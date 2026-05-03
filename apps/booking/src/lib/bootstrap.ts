import { InMemoryBookingStore } from './in-memory-store';
import { initStore } from './store-provider';
import { initDependencies, getDependencies } from './dependencies';

let _initialized = false;

/**
 * One-time app initialization. Safe to call multiple times (idempotent).
 *
 * When DATABASE_URL is set, uses DrizzleBookingStore backed by Postgres.
 * Otherwise falls back to InMemoryBookingStore (tests / local dev without DB).
 *
 * Also initializes external dependencies (payments, email, auth, shopify).
 * Uses test doubles when API keys are not configured.
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

  try {
    getDependencies();
  } catch {
    const { InMemoryPaymentsClient } = await import('@zedslot/payments/__test-double');
    const { InMemoryEmailSender } = await import('@zedslot/email/__test-double');
    const { InMemoryAuthClient } = await import('@zedslot/auth/__test-double');
    const { InMemoryShopifyClient } = await import('@zedslot/shopify/__test-double');

    initDependencies({
      payments: new InMemoryPaymentsClient(),
      email: new InMemoryEmailSender(),
      auth: new InMemoryAuthClient(),
      shopify: new InMemoryShopifyClient(),
    });
  }

  _initialized = true;
}
