/**
 * Compile-time check that DrizzleBookingStore satisfies BookingStore.
 * This file is never executed — it only needs to typecheck.
 */
import type { BookingStore } from '../lib/store';
import type { DrizzleBookingStore } from '@zedslot/database';

const _check: BookingStore = {} as DrizzleBookingStore;
void _check;
