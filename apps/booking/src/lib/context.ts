import type { Dependencies } from './dependencies';
import type { BookingStore } from './store';

/**
 * Request context passed to all route handlers.
 * Constructed by the handler wrapper from headers + DI.
 */
export interface RequestContext {
  tenantId: string;
  store: BookingStore;
  deps: Dependencies;
}
