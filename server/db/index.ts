import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { SCHEMA_SQL } from './schema.js';

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

let pool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;
let isConnecting = false;
let connectPromise: Promise<{ type: 'pg' | 'pglite'; client: pg.Pool | PGlite }> | null = null;

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

      try {
        const newPool = new pg.Pool({
          connectionString: dbUrl,
          ssl: isSupabase || isProduction ? { rejectUnauthorized: false } : undefined,
          max: isProduction ? 10 : 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000,
        });

        // Test connection
        await newPool.query('SELECT 1');
        console.log('[DB] Successfully connected to PostgreSQL database.');
        pool = newPool;
        return { type: 'pg', client: pool };
      } catch (err: any) {
        console.error('[DB] Failed connecting to DATABASE_URL:', err.message);
        if (isProduction) {
          throw new Error(
            `[DB Error] Unable to connect to Supabase PostgreSQL database: ${err.message}. ` +
            'Please verify your DATABASE_URL in Vercel Project Environment Variables.'
          );
        }
        console.warn('[DB] Falling back to local in-memory PostgreSQL engine for development.');
      }
    }

    if (isProduction) {
      throw new Error(
        '[DB Error] DATABASE_URL is not configured in production. ' +
        'Please set DATABASE_URL pointing to your Supabase PostgreSQL database in Vercel Project Settings.'
      );
    }

    // Local in-memory PostgreSQL fallback for local development only (no filesystem writes)
    console.log('[DB] Initializing local in-memory PostgreSQL (PGlite) engine...');
    pgliteInstance = new PGlite();
    await pgliteInstance.waitReady;
    console.log('[DB] Local in-memory PostgreSQL engine is ready.');
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
    await pool.query(SCHEMA_SQL);
  } else if (pgliteInstance) {
    await pgliteInstance.exec(SCHEMA_SQL);
  }
  console.log('[DB] Database schema initialized successfully.');
}
