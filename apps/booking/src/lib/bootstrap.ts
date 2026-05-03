import { InMemoryBookingStore } from './in-memory-store';
import { initStore } from './store-provider';

let _initialized = false;

/**
 * One-time app initialization. Safe to call multiple times (idempotent).
 *
 * When DATABASE_URL is set, uses DrizzleBookingStore backed by Postgres.
 * Otherwise falls back to InMemoryBookingStore (tests / local dev without DB).
 */
export async function bootstrap(): Promise<void> {
  if (_initialized) return;

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    const { createDatabase, DrizzleBookingStore } = await import(
      '@zedslot/database'
    );
    const db = createDatabase(databaseUrl);
    initStore(new DrizzleBookingStore(db));
  } else {
    initStore(new InMemoryBookingStore());
  }

  _initialized = true;
}
