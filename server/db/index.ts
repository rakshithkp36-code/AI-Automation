import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { SCHEMA_SQL } from './schema.js';

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

let pool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;
let connectPromise: Promise<{ type: 'pg' | 'pglite'; client: pg.Pool | PGlite }> | null = null;

function getSupabasePoolerUrl(urlStr: string): string | null {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname;
    // Check if direct Supabase host: db.<ref>.supabase.co
    if (host.startsWith('db.') && host.endsWith('.supabase.co')) {
      const projectRef = host.split('.')[1];
      const rawUser = decodeURIComponent(parsed.username || 'postgres');
      const poolerUser = rawUser.includes('.') ? rawUser : `${rawUser}.${projectRef}`;
      // Supabase pooler host for this project (Session mode port 5432, IPv4 compatible)
      parsed.hostname = 'aws-0-ap-south-1.pooler.supabase.com';
      parsed.username = poolerUser;
      parsed.port = '5432';
      return parsed.toString();
    }
  } catch {
    // ignore
  }
  return null;
}

export async function getDb(): Promise<{ type: 'pg' | 'pglite'; client: pg.Pool | PGlite }> {
  if (pool) return { type: 'pg', client: pool };
  if (pgliteInstance) return { type: 'pglite', client: pgliteInstance };
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const dbUrl = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

    // Check if valid PostgreSQL connection string is provided
    if (dbUrl && dbUrl.trim() !== '' && !dbUrl.includes('[YOUR-PASSWORD]') && !dbUrl.includes('[YOUR_PASSWORD]')) {
      const isSupabase = dbUrl.includes('supabase.co') || dbUrl.includes('pooler.supabase.com');
      console.log(`[DB] Connecting to ${isSupabase ? 'Supabase' : 'remote'} PostgreSQL database...`);

      const urlsToTry = [dbUrl];
      const poolerUrl = getSupabasePoolerUrl(dbUrl);
      if (poolerUrl && poolerUrl !== dbUrl) {
        // If direct IPv6 URL was supplied, also prepare IPv4 pooler URL as fallback for Vercel
        urlsToTry.push(poolerUrl);
      }

      let lastError: any = null;

      for (const targetUrl of urlsToTry) {
        try {
          const newPool = new pg.Pool({
            connectionString: targetUrl,
            ssl: isSupabase || isProduction ? { rejectUnauthorized: false } : undefined,
            max: isProduction ? 5 : 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          });

          newPool.on('connect', (client) => {
            client.query('SET search_path TO public, extensions;').catch(() => {});
          });

          // Test connection
          await newPool.query('SELECT 1');
          console.log('[DB] Successfully connected to PostgreSQL database.');
          pool = newPool;
          return { type: 'pg', client: pool };
        } catch (err: any) {
          lastError = err;
          console.warn(`[DB] Connection attempt failed: ${err.message}`);
        }
      }

      console.warn('[DB] Remote PostgreSQL connection attempt failed:', lastError?.message);
      console.warn('[DB] Falling back to in-memory PostgreSQL engine to preserve application availability.');
    } else {
      console.warn('[DB] DATABASE_URL is not configured or contains placeholder. Running with in-memory PostgreSQL engine.');
    }

    // In-memory PostgreSQL engine (PGlite) with zero filesystem storage
    console.log('[DB] Initializing in-memory PostgreSQL (PGlite) engine...');
    pgliteInstance = new PGlite();
    await pgliteInstance.waitReady;
    console.log('[DB] In-memory PostgreSQL engine is ready.');
    return { type: 'pglite', client: pgliteInstance };
  })();

  try {
    const result = await connectPromise;
    return result;
  } finally {
    connectPromise = null;
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
  const db = await getDb();

  const safeParams = params.map((p) => {
    if (p === undefined) return null;
    if (p !== null && typeof p === 'object' && !(p instanceof Date)) {
      return JSON.stringify(p);
    }
    return p;
  });

  if (db.type === 'pg' && pool) {
    const res = await pool.query(sql, safeParams);
    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? res.rows.length,
    };
  } else if (pgliteInstance) {
    const res = await pgliteInstance.query(sql, safeParams);
    return {
      rows: res.rows as T[],
      rowCount: (res as any).affectedRows ?? res.rows.length,
    };
  }

  throw new Error('Database not initialized');
}

export async function initSchema(): Promise<void> {
  console.log('[DB] Running database schema setup...');
  const db = await getDb();
  if (db.type === 'pg' && pool) {
    await pool.query('SET search_path TO public, extensions;');
    await pool.query(SCHEMA_SQL);
  } else if (pgliteInstance) {
    await pgliteInstance.exec(SCHEMA_SQL);
  }
  console.log('[DB] Database schema initialized successfully.');
}
