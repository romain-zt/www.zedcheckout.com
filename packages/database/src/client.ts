import { drizzle } from 'drizzle-orm/postgres-js';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type Database = PostgresJsDatabase<typeof schema>;

/**
 * Create a Drizzle ORM client connected to the given Postgres connection string.
 * Caller owns the lifecycle — call `db.$client.end()` on shutdown.
 */
export function createDatabase(connectionString: string): Database {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}
