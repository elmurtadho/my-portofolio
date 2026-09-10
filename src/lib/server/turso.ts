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
 * Initializes the portfolio_kv table in Turso if it does not already exist.
 */
export async function initTursoSchema(c: Client): Promise<void> {
  if (isInitialized) return;
  try {
    await c.execute(`
      CREATE TABLE IF NOT EXISTS portfolio_kv (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    isInitialized = true;
  } catch (err) {
    console.error('[turso] Failed to initialize table:', err);
  }
}

/**
 * Fetches the entire DatabaseSchema from Turso.
 * If not yet seeded in Turso, automatically seeds it using the fallback database.
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
