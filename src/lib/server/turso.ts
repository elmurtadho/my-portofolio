import { createClient, Client } from '@libsql/client';
import { DatabaseSchema } from './models';
import { runMigrations } from './migrations';

let client: Client | null = null;
let isInitialized = false;

/**
 * Returns an instance of the Turso libSQL client if configured.
 */
export function getTursoClient(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) return null;

  if (!client) {
    client = createClient({
      url,
      authToken: authToken || undefined,
    });
  }
  return client;
}

/**
 * Checks whether Turso environment variable is configured.
 */
export function isTursoEnabled(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL);
}

/**
 * Initializes tables in Turso if they do not already exist.
 */
export async function initTursoSchema(c: Client): Promise<void> {
  if (isInitialized) return;
  try {
    await c.execute(`CREATE TABLE IF NOT EXISTS portfolio_kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`);
    await c.execute(`CREATE TABLE IF NOT EXISTS portfolio_media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      data BLOB NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );`);
    isInitialized = true;
  } catch (err) {
    console.error('[turso] Failed to initialize tables:', err);
  }
}

/**
 * Fetches the entire DatabaseSchema from Turso.
 * Always retrieves fresh data directly from Turso.
 */
export async function getTursoDatabase(fallbackInitial: DatabaseSchema): Promise<DatabaseSchema | null> {
  const c = getTursoClient();
  if (!c) return null;

  try {
    await initTursoSchema(c);
    const rs = await c.execute({
      sql: 'SELECT value FROM portfolio_kv WHERE key = ? LIMIT 1',
      args: ['full_database'],
    });

    if (rs.rows.length > 0 && rs.rows[0].value) {
      const raw = rs.rows[0].value as string;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return runMigrations(parsed);
      }
    }

    // First time running on Turso: seed with existing complete portfolio
    console.log('[turso] Database empty. Seeding initial portfolio data into Turso...');
    await saveTursoDatabase(fallbackInitial);
    return fallbackInitial;
  } catch (err) {
    console.error('[turso] Failed to get database from Turso:', err);
    return null;
  }
}

/**
 * Persists the DatabaseSchema to Turso.
 */
export async function saveTursoDatabase(data: DatabaseSchema): Promise<boolean> {
  const c = getTursoClient();
  if (!c) return false;

  try {
    await initTursoSchema(c);
    const now = new Date().toISOString();
    await c.execute({
      sql: 'INSERT INTO portfolio_kv (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
      args: ['full_database', JSON.stringify(data), now],
    });
    return true;
  } catch (err) {
    console.error('[turso] Failed to save database to Turso:', err);
    return false;
  }
}

/**
 * Stores a binary media file (image, 3D model, video) in Turso SQLite.
 * Returns a permanent direct API URL (e.g. /api/media/med-178906-abc.png)
 */
export async function saveTursoMedia(
  filename: string,
  mimeType: string,
  buffer: Buffer
): Promise<{ id: string; url: string; filename: string; mimeType: string; size: number }> {
  const c = getTursoClient();
  if (!c) throw new Error('Turso client not configured');

  await initTursoSchema(c);

  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase();
  const ext = cleanName.includes('.') ? cleanName.slice(cleanName.lastIndexOf('.')) : '';
  const id = `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;
  const now = new Date().toISOString();

  await c.execute({
    sql: 'INSERT INTO portfolio_media (id, filename, mime_type, data, size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, cleanName, mimeType, buffer, buffer.length, now],
  });

  return {
    id,
    url: `/api/media/${id}`,
    filename: cleanName,
    mimeType,
    size: buffer.length,
  };
}

/**
 * Retrieves a binary media file from Turso by ID.
 */
export async function getTursoMedia(
  id: string
): Promise<{ filename: string; mimeType: string; data: Buffer } | null> {
  const c = getTursoClient();
  if (!c) return null;

  try {
    await initTursoSchema(c);
    const rs = await c.execute({
      sql: 'SELECT filename, mime_type, data FROM portfolio_media WHERE id = ? LIMIT 1',
      args: [id],
    });

    if (rs.rows.length === 0) return null;

    const row = rs.rows[0];
    const filename = String(row.filename);
    const mimeType = String(row.mime_type);
    const rawData = row.data;

    let buffer: Buffer;
    if (Buffer.isBuffer(rawData)) {
      buffer = rawData;
    } else if (rawData instanceof ArrayBuffer) {
      buffer = Buffer.from(rawData);
    } else if (typeof rawData === 'string') {
      buffer = Buffer.from(rawData, 'base64');
    } else if (rawData && typeof rawData === 'object') {
      buffer = Buffer.from(rawData as any);
    } else {
      buffer = Buffer.from(String(rawData || ''));
    }

    return {
      filename,
      mimeType,
      data: buffer,
    };
  } catch (err) {
    console.error('[turso] Error reading media:', err);
    return null;
  }
}
