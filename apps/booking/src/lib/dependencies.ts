import type { PaymentsClient } from '@zedslot/payments';
import type { EmailSender } from '@zedslot/email';
import type { AuthClient } from '@zedslot/auth';
import type { ShopifyClient } from '@zedslot/shopify';

/**
 * All external dependencies injected into route handlers.
 * Production wires real clients; tests wire test doubles.
 */
export interface Dependencies {
  payments: PaymentsClient;
  email: EmailSender;
  auth: AuthClient;
  shopify: ShopifyClient;
}

let _deps: Dependencies | null = null;

export function initDependencies(deps: Dependencies): void {
  _deps = deps;
}

export function getDependencies(): Dependencies {
  if (!_deps) {
    throw new Error(
      'Dependencies not initialized. Call initDependencies() at app startup.',
    );
  }
  return _deps;
}
