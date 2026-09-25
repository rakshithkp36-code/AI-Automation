import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

let pool: pg.Pool | null = null;
let pgliteInstance: PGlite | null = null;
let saveSnapshotTimeout: NodeJS.Timeout | null = null;

const dataDir = path.resolve(__dirname, '../../data');
const snapshotPath = path.resolve(dataDir, 'flowpilot_snapshot.tar.gz');

export async function saveSnapshot() {
  if (!pgliteInstance) return;
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dump = await pgliteInstance.dumpDataDir('gzip');
    const buffer = Buffer.from(await dump.arrayBuffer());
    fs.writeFileSync(snapshotPath, buffer);
  } catch (err) {
    console.warn('[DB] Failed to save snapshot:', err);
  }
}

function scheduleSnapshot() {
  if (!pgliteInstance) return;
  if (saveSnapshotTimeout) clearTimeout(saveSnapshotTimeout);
  saveSnapshotTimeout = setTimeout(() => {
    saveSnapshot();
  }, 1000);
}

export async function getDb() {
  if (pool) return { type: 'pg', client: pool };
  if (pgliteInstance) return { type: 'pglite', client: pgliteInstance };

  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.trim() !== '' && !dbUrl.includes('[') && !dbUrl.includes(']')) {
    console.log('[DB] Connecting to remote PostgreSQL via DATABASE_URL...');
    try {
      pool = new pg.Pool({ connectionString: dbUrl });
      await pool.query('SELECT 1');
      console.log('[DB] Connected to PostgreSQL successfully.');
      return { type: 'pg', client: pool };
    } catch (err) {
      console.warn('[DB] Failed connecting to DATABASE_URL, falling back to embedded PGlite engine:', err);
      pool = null;
    }
  }

  // Embedded persistent PGlite PostgreSQL engine
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(snapshotPath)) {
    console.log(`[DB] Restoring persistent PostgreSQL snapshot from ${snapshotPath}...`);
    try {
      const fileBuffer = fs.readFileSync(snapshotPath);
      pgliteInstance = new PGlite({ loadDataDir: new Blob([fileBuffer]) });
      await pgliteInstance.waitReady;
      console.log('[DB] Embedded PostgreSQL engine restored successfully from snapshot.');
      return { type: 'pglite', client: pgliteInstance };
    } catch (e) {
      console.warn('[DB] Snapshot restore failed, creating fresh instance:', e);
      pgliteInstance = null;
    }
  }

  console.log('[DB] Initializing embedded persistent PostgreSQL (PGlite) engine...');
  pgliteInstance = new PGlite();
  await pgliteInstance.waitReady;
  console.log('[DB] Embedded PostgreSQL (PGlite) engine is ready.');
  return { type: 'pglite', client: pgliteInstance };
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
    
    // Check if modifying data to schedule persistent snapshot
    const upper = sql.trim().toUpperCase();
    if (upper.startsWith('INSERT') || upper.startsWith('UPDATE') || upper.startsWith('DELETE') || upper.startsWith('CREATE')) {
      scheduleSnapshot();
    }

    return {
      rows: res.rows as T[],
      rowCount: (res as any).affectedRows ?? res.rows.length,
    };
  }

  throw new Error('Database not initialized');
}

export async function initSchema(): Promise<void> {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  console.log('[DB] Running database migrations...');
  const db = await getDb();
  if (db.type === 'pg' && pool) {
    await pool.query(sql);
  } else if (pgliteInstance) {
    await pgliteInstance.exec(sql);
    await saveSnapshot();
  }
  console.log('[DB] Database schema initialized successfully.');
}
