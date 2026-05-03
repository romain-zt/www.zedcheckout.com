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
import type { BookingStore } from './store.js';

export class InMemoryBookingStore implements BookingStore {
  services: Service[] = [];
  resources: Resource[] = [];
  rooms: Room[] = [];
  bookings: Booking[] = [];
  customers: Customer[] = [];
  payments: Payment[] = [];
  policies: Policy[] = [];
  availabilityRules: AvailabilityRule[] = [];
  packHolds: PackHold[] = [];
  refunds: Refund[] = [];
  scheduledEmails: ScheduledEmail[] = [];

  async listActiveServices(tenantId: string): Promise<Service[]> {
    return this.services.filter((s) => s.tenantId === tenantId && s.status === 'active');
  }

  async getService(tenantId: string, serviceId: string): Promise<Service | null> {
    return this.services.find((s) => s.tenantId === tenantId && s.id === serviceId) ?? null;
  }

  async listResources(tenantId: string, ids?: string[]): Promise<Resource[]> {
    let result = this.resources.filter((r) => r.tenantId === tenantId);
    if (ids) result = result.filter((r) => ids.includes(r.id));
    return result;
  }

  async listRooms(tenantId: string, ids?: string[]): Promise<Room[]> {
    let result = this.rooms.filter((r) => r.tenantId === tenantId);
    if (ids) result = result.filter((r) => ids.includes(r.id));
    return result;
  }

  async listAvailabilityRules(tenantId: string): Promise<AvailabilityRule[]> {
    return this.availabilityRules.filter((r) => r.tenantId === tenantId);
  }

  async listBookings(
    tenantId: string,
    filters?: { roomId?: string; resourceId?: string; status?: string[] },
  ): Promise<Booking[]> {
    let result = this.bookings.filter((b) => b.tenantId === tenantId);
    if (filters?.roomId) result = result.filter((b) => b.roomId === filters.roomId);
    if (filters?.resourceId) result = result.filter((b) => b.resourceId === filters.resourceId);
    if (filters?.status) result = result.filter((b) => filters.status!.includes(b.status));
    return result;
  }

  async getBooking(tenantId: string, bookingId: string): Promise<Booking | null> {
    return this.bookings.find((b) => b.tenantId === tenantId && b.id === bookingId) ?? null;
  }

  async createBooking(booking: Booking): Promise<Booking> {
    this.bookings.push(booking);
    return booking;
  }

  async updateBookingStatus(tenantId: string, bookingId: string, status: Booking['status']): Promise<Booking | null> {
    const booking = this.bookings.find((b) => b.tenantId === tenantId && b.id === bookingId);
    if (!booking) return null;
    booking.status = status;
    return booking;
  }

  async updateBookingSlot(
    tenantId: string,
    bookingId: string,
    update: { startsAt: Date; endsAt: Date; resourceId: string | null; roomId: string; rescheduleCount: number },
  ): Promise<Booking | null> {
    const booking = this.bookings.find((b) => b.tenantId === tenantId && b.id === bookingId);
    if (!booking) return null;
    booking.startsAt = update.startsAt;
    booking.endsAt = update.endsAt;
    booking.resourceId = update.resourceId;
    booking.roomId = update.roomId;
    booking.rescheduleCount = update.rescheduleCount;
    return booking;
  }

  async findPendingBooking(
    tenantId: string,
    serviceId: string,
    resourceId: string | null,
    roomId: string,
    startsAt: Date,
    email: string,
  ): Promise<Booking | null> {
    const customer = this.customers.find((c) => c.tenantId === tenantId && c.email === email);
    if (!customer) return null;
    return (
      this.bookings.find(
        (b) =>
          b.tenantId === tenantId &&
          b.serviceId === serviceId &&
          b.resourceId === resourceId &&
          b.roomId === roomId &&
          b.startsAt.getTime() === startsAt.getTime() &&
          b.customerId === customer.id &&
          b.status === 'pending',
      ) ?? null
    );
  }

  async listExpiredPendingBookings(tenantId: string, cutoff: Date): Promise<Booking[]> {
    return this.bookings.filter(
      (b) => b.tenantId === tenantId && b.status === 'pending' && b.createdAt.getTime() < cutoff.getTime(),
    );
  }

  async getCustomerByEmail(tenantId: string, email: string): Promise<Customer | null> {
    return this.customers.find((c) => c.tenantId === tenantId && c.email === email) ?? null;
  }

  async upsertCustomer(customer: Customer): Promise<Customer> {
    const idx = this.customers.findIndex((c) => c.tenantId === customer.tenantId && c.email === customer.email);
    if (idx >= 0) {
      this.customers[idx] = customer;
    } else {
      this.customers.push(customer);
    }
    return customer;
  }

  async updateCustomerPackCredit(tenantId: string, customerId: string, delta: number): Promise<void> {
    const customer = this.customers.find((c) => c.tenantId === tenantId && c.id === customerId);
    if (customer) customer.packCreditCents += delta;
  }

  async getPayment(tenantId: string, paymentId: string): Promise<Payment | null> {
    return this.payments.find((p) => p.tenantId === tenantId && p.id === paymentId) ?? null;
  }

  async getPaymentByStripeId(tenantId: string, stripePaymentIntentId: string): Promise<Payment | null> {
    return this.payments.find((p) => p.tenantId === tenantId && p.stripePaymentIntentId === stripePaymentIntentId) ?? null;
  }

  async createPayment(payment: Payment): Promise<Payment> {
    this.payments.push(payment);
    return payment;
  }

  async updatePaymentStatus(tenantId: string, paymentId: string, status: Payment['status'], stripePaymentIntentId?: string): Promise<Payment | null> {
    const payment = this.payments.find((p) => p.tenantId === tenantId && p.id === paymentId);
    if (!payment) return null;
    payment.status = status;
    if (stripePaymentIntentId) (payment as { stripePaymentIntentId: string | null }).stripePaymentIntentId = stripePaymentIntentId;
    return payment;
  }

  async getGlobalPolicy(tenantId: string): Promise<Policy | null> {
    return this.policies.find((p) => p.tenantId === tenantId && p.scope === 'global') ?? null;
  }

  async createPackHold(hold: PackHold): Promise<PackHold> {
    this.packHolds.push(hold);
    return hold;
  }

  async getPackHoldByBooking(tenantId: string, bookingId: string): Promise<PackHold | null> {
    return this.packHolds.find((h) => h.tenantId === tenantId && h.bookingId === bookingId && h.status === 'held') ?? null;
  }

  async updatePackHoldStatus(tenantId: string, holdId: string, status: PackHold['status']): Promise<void> {
    const hold = this.packHolds.find((h) => h.tenantId === tenantId && h.id === holdId);
    if (hold) hold.status = status;
  }

  async listExpiredPackHolds(tenantId: string, now: Date): Promise<PackHold[]> {
    return this.packHolds.filter(
      (h) => h.tenantId === tenantId && h.status === 'held' && h.expiresAt.getTime() < now.getTime(),
    );
  }

  async createRefund(refund: Refund): Promise<Refund> {
    this.refunds.push(refund);
    return refund;
  }

  async getRefundByBooking(tenantId: string, bookingId: string): Promise<Refund | null> {
    return this.refunds.find((r) => r.tenantId === tenantId && r.bookingId === bookingId) ?? null;
  }

  async createScheduledEmail(email: ScheduledEmail): Promise<ScheduledEmail> {
    this.scheduledEmails.push(email);
    return email;
  }

  async listPendingEmails(tenantId: string, now: Date, limit: number): Promise<ScheduledEmail[]> {
    return this.scheduledEmails
      .filter(
        (e) => e.tenantId === tenantId && e.status === 'pending' && e.scheduledAt.getTime() <= now.getTime(),
      )
      .slice(0, limit);
  }

  async updateEmailStatus(tenantId: string, emailId: string, status: ScheduledEmail['status'], sentAt?: Date): Promise<void> {
    const email = this.scheduledEmails.find((e) => e.tenantId === tenantId && e.id === emailId);
    if (email) {
      email.status = status;
      if (sentAt) (email as { sentAt: Date | null }).sentAt = sentAt;
    }
  }

  async incrementEmailAttempts(tenantId: string, emailId: string): Promise<void> {
    const email = this.scheduledEmails.find((e) => e.tenantId === tenantId && e.id === emailId);
    if (email) {
      (email as { attempts: number }).attempts += 1;
      (email as { lastAttemptAt: Date | null }).lastAttemptAt = new Date();
    }
  }

  async deletePendingReminder(tenantId: string, bookingId: string): Promise<void> {
    const idx = this.scheduledEmails.findIndex(
      (e) => e.tenantId === tenantId && e.bookingId === bookingId && e.type === 'booking_reminder' && e.status === 'pending',
    );
    if (idx >= 0) this.scheduledEmails.splice(idx, 1);
  }
}
