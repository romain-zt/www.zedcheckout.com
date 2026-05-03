import type { BookingStore } from './store';

let _store: BookingStore | null = null;

export function getStore(): BookingStore {
  if (!_store) {
    throw new Error(
      'BookingStore not initialized. Call initStore() at app startup.',
    );
  }
  return _store;
}

export function initStore(store: BookingStore): void {
  _store = store;
}
