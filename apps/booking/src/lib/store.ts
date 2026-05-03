import type {
  Service,
  Resource,
  Room,
  Booking,
  Customer,
  Payment,
  Policy,
  AvailabilityRule,
  PackHold,
  Refund,
  ScheduledEmail,
} from '@zedslot/domain';

/**
 * Data store abstraction for tenant-scoped queries.
 * In-memory for V0 tests; real implementation uses @zedslot/database (Drizzle).
 */
export interface BookingStore {
  // Services
  listActiveServices(tenantId: string): Promise<Service[]>;
  getService(tenantId: string, serviceId: string): Promise<Service | null>;

  // Resources
  listResources(tenantId: string, ids?: string[]): Promise<Resource[]>;

  // Rooms
  listRooms(tenantId: string, ids?: string[]): Promise<Room[]>;

  // Availability
  listAvailabilityRules(tenantId: string): Promise<AvailabilityRule[]>;

  // Bookings
  listBookings(tenantId: string, filters?: { roomId?: string; resourceId?: string; status?: string[] }): Promise<Booking[]>;
  getBooking(tenantId: string, bookingId: string): Promise<Booking | null>;
  createBooking(booking: Booking): Promise<Booking>;
  updateBookingStatus(tenantId: string, bookingId: string, status: Booking['status']): Promise<Booking | null>;
  updateBookingSlot(tenantId: string, bookingId: string, update: { startsAt: Date; endsAt: Date; resourceId: string | null; roomId: string; rescheduleCount: number }): Promise<Booking | null>;
  findPendingBooking(tenantId: string, serviceId: string, resourceId: string | null, roomId: string, startsAt: Date, email: string): Promise<Booking | null>;
  listExpiredPendingBookings(tenantId: string, cutoff: Date): Promise<Booking[]>;

  // Customers
  getCustomerByEmail(tenantId: string, email: string): Promise<Customer | null>;
  upsertCustomer(customer: Customer): Promise<Customer>;
  updateCustomerPackCredit(tenantId: string, customerId: string, delta: number): Promise<void>;

  // Payments
  getPayment(tenantId: string, paymentId: string): Promise<Payment | null>;
  getPaymentByStripeId(tenantId: string, stripePaymentIntentId: string): Promise<Payment | null>;
  createPayment(payment: Payment): Promise<Payment>;
  updatePaymentStatus(tenantId: string, paymentId: string, status: Payment['status'], stripePaymentIntentId?: string): Promise<Payment | null>;

  // Policies
  getGlobalPolicy(tenantId: string): Promise<Policy | null>;

  // Pack holds
  createPackHold(hold: PackHold): Promise<PackHold>;
  getPackHoldByBooking(tenantId: string, bookingId: string): Promise<PackHold | null>;
  updatePackHoldStatus(tenantId: string, holdId: string, status: PackHold['status']): Promise<void>;
  listExpiredPackHolds(tenantId: string, now: Date): Promise<PackHold[]>;

  // Refunds
  createRefund(refund: Refund): Promise<Refund>;
  getRefundByBooking(tenantId: string, bookingId: string): Promise<Refund | null>;

  // Scheduled emails
  createScheduledEmail(email: ScheduledEmail): Promise<ScheduledEmail>;
  listPendingEmails(tenantId: string, now: Date, limit: number): Promise<ScheduledEmail[]>;
  updateEmailStatus(tenantId: string, emailId: string, status: ScheduledEmail['status'], sentAt?: Date): Promise<void>;
  incrementEmailAttempts(tenantId: string, emailId: string): Promise<void>;
  deletePendingReminder(tenantId: string, bookingId: string): Promise<void>;
}
