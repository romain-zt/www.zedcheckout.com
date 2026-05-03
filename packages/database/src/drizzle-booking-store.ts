import { eq, and, lt, lte, inArray, sql } from 'drizzle-orm';
import type { Database } from './client';
import {
  services,
  serviceResources,
  serviceRooms,
  resources,
  rooms,
  availabilityRules,
  bookings,
  customers,
  payments,
  policies,
  packHolds,
  refunds,
  scheduledEmails,
} from './schema/index';
import { handleExclusionViolation } from './errors/index';
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
  BookingStatus,
  PaymentStatus,
  PackHoldStatus,
  EmailStatus,
} from '@zedslot/domain';

// ── Row → Domain mappers ──────────────────────────────────────────

type ServiceRow = typeof services.$inferSelect;
type ServiceResourceRow = typeof serviceResources.$inferSelect;
type ServiceRoomRow = typeof serviceRooms.$inferSelect;

function toService(
  row: ServiceRow,
  resourceIds: string[],
  roomIds: string[],
): Service {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: { fr: row.nameFr, en: row.nameEn },
    description:
      row.descriptionFr || row.descriptionEn
        ? { fr: row.descriptionFr ?? '', en: row.descriptionEn ?? '' }
        : null,
    durationMinutes: row.durationMinutes,
    priceCents: row.priceCents,
    eligibleResourceIds: resourceIds,
    eligibleRoomIds: roomIds,
    requiresResource: row.requiresResource,
    requiresRoom: row.requiresRoom,
    status: row.status as Service['status'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toResource(row: typeof resources.$inferSelect): Resource {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    email: row.email,
    status: row.status as Resource['status'],
    createdAt: row.createdAt,
  };
}

function toRoom(row: typeof rooms.$inferSelect): Room {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    bookableWithoutResource: row.bookableWithoutResource,
    status: row.status as Room['status'],
    createdAt: row.createdAt,
  };
}

function toBooking(row: typeof bookings.$inferSelect): Booking {
  return {
    id: row.id,
    tenantId: row.tenantId,
    serviceId: row.serviceId,
    resourceId: row.resourceId,
    roomId: row.roomId,
    customerId: row.customerId,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    status: row.status as BookingStatus,
    paymentId: row.paymentId,
    policyId: row.policyId,
    rescheduleCount: row.rescheduleCount,
    createdAt: row.createdAt,
  };
}

function toCustomer(row: typeof customers.$inferSelect): Customer {
  return {
    id: row.id,
    tenantId: row.tenantId,
    shopifyCustomerId: row.shopifyCustomerId,
    email: row.email,
    displayName: row.displayName,
    phone: row.phone,
    packCreditCents: row.packCreditCents,
    giftCardBalanceCents: row.giftCardBalanceCents,
    createdAt: row.createdAt,
  };
}

function toPayment(row: typeof payments.$inferSelect): Payment {
  return {
    id: row.id,
    tenantId: row.tenantId,
    bookingId: row.bookingId,
    stripePaymentIntentId: row.stripePaymentIntentId,
    paidByCardCents: row.paidByCardCents,
    paidByPackCents: row.paidByPackCents,
    paidByGiftCardCents: row.paidByGiftCardCents,
    totalCents: row.totalCents,
    currency: row.currency,
    status: row.status as PaymentStatus,
    idempotencyKey: row.idempotencyKey,
    createdAt: row.createdAt,
  };
}

function toPolicy(row: typeof policies.$inferSelect): Policy {
  return {
    id: row.id,
    tenantId: row.tenantId,
    scope: row.scope as Policy['scope'],
    freeCancelHours: row.freeCancelHours,
    lateCancelBehavior: row.lateCancelBehavior as Policy['lateCancelBehavior'],
    noShowBehavior: row.noShowBehavior as Policy['noShowBehavior'],
    freeRescheduleHours: row.freeRescheduleHours,
    maxReschedules: row.maxReschedules,
    createdAt: row.createdAt,
  };
}

function toAvailabilityRule(
  row: typeof availabilityRules.$inferSelect,
): AvailabilityRule {
  return {
    id: row.id,
    tenantId: row.tenantId,
    scope: row.scope as AvailabilityRule['scope'],
    kind: row.kind as AvailabilityRule['kind'],
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    endTime: row.endTime,
    dateRangeStart: row.dateRangeStart,
    dateRangeEnd: row.dateRangeEnd,
    isUnavailable: row.isUnavailable,
    createdAt: row.createdAt,
  };
}

function toPackHold(row: typeof packHolds.$inferSelect): PackHold {
  return {
    id: row.id,
    tenantId: row.tenantId,
    customerId: row.customerId,
    bookingId: row.bookingId,
    amountCents: row.amountCents,
    status: row.status as PackHoldStatus,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

function toRefund(row: typeof refunds.$inferSelect): Refund {
  return {
    id: row.id,
    tenantId: row.tenantId,
    paymentId: row.paymentId,
    bookingId: row.bookingId,
    refundedToCardCents: row.refundedToCardCents,
    refundedToPackCents: row.refundedToPackCents,
    refundedToGiftCardCents: row.refundedToGiftCardCents,
    totalCents: row.totalCents,
    reason: row.reason,
    status: row.status as Refund['status'],
    requestedAt: row.requestedAt,
    completedAt: row.completedAt,
  };
}

function toScheduledEmail(
  row: typeof scheduledEmails.$inferSelect,
): ScheduledEmail {
  return {
    id: row.id,
    tenantId: row.tenantId,
    bookingId: row.bookingId,
    type: row.type as ScheduledEmail['type'],
    scheduledAt: row.scheduledAt,
    status: row.status as ScheduledEmail['status'],
    attempts: row.attempts,
    lastAttemptAt: row.lastAttemptAt,
    sentAt: row.sentAt,
    createdAt: row.createdAt,
  };
}

// ── Store implementation ──────────────────────────────────────────

/**
 * Real BookingStore backed by Drizzle ORM + Postgres.
 * Every query is tenant-scoped. Conflict errors from EXCLUDE constraints
 * are caught and re-thrown as BookingConflictError.
 */
export class DrizzleBookingStore {
  constructor(private readonly db: Database) {}

  // ── Services ──────────────────────────────────────────────────

  async listActiveServices(tenantId: string): Promise<Service[]> {
    const rows = await this.db
      .select()
      .from(services)
      .where(and(eq(services.tenantId, tenantId), eq(services.status, 'active')));

    return this.hydrateServices(rows);
  }

  async getService(
    tenantId: string,
    serviceId: string,
  ): Promise<Service | null> {
    const rows = await this.db
      .select()
      .from(services)
      .where(and(eq(services.tenantId, tenantId), eq(services.id, serviceId)))
      .limit(1);

    if (rows.length === 0) return null;
    const hydrated = await this.hydrateServices(rows);
    return hydrated[0] ?? null;
  }

  private async hydrateServices(rows: ServiceRow[]): Promise<Service[]> {
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);

    const [resLinks, roomLinks] = await Promise.all([
      this.db
        .select()
        .from(serviceResources)
        .where(inArray(serviceResources.serviceId, ids)),
      this.db
        .select()
        .from(serviceRooms)
        .where(inArray(serviceRooms.serviceId, ids)),
    ]);

    const resMap = new Map<string, string[]>();
    for (const link of resLinks) {
      const arr = resMap.get(link.serviceId) ?? [];
      arr.push(link.resourceId);
      resMap.set(link.serviceId, arr);
    }

    const roomMap = new Map<string, string[]>();
    for (const link of roomLinks) {
      const arr = roomMap.get(link.serviceId) ?? [];
      arr.push(link.roomId);
      roomMap.set(link.serviceId, arr);
    }

    return rows.map((row) =>
      toService(row, resMap.get(row.id) ?? [], roomMap.get(row.id) ?? []),
    );
  }

  // ── Resources ─────────────────────────────────────────────────

  async listResources(tenantId: string, ids?: string[]): Promise<Resource[]> {
    const conditions = [eq(resources.tenantId, tenantId)];
    if (ids && ids.length > 0) {
      conditions.push(inArray(resources.id, ids));
    }

    const rows = await this.db
      .select()
      .from(resources)
      .where(and(...conditions));

    return rows.map(toResource);
  }

  // ── Rooms ─────────────────────────────────────────────────────

  async listRooms(tenantId: string, ids?: string[]): Promise<Room[]> {
    const conditions = [eq(rooms.tenantId, tenantId)];
    if (ids && ids.length > 0) {
      conditions.push(inArray(rooms.id, ids));
    }

    const rows = await this.db
      .select()
      .from(rooms)
      .where(and(...conditions));

    return rows.map(toRoom);
  }

  // ── Availability ──────────────────────────────────────────────

  async listAvailabilityRules(tenantId: string): Promise<AvailabilityRule[]> {
    const rows = await this.db
      .select()
      .from(availabilityRules)
      .where(eq(availabilityRules.tenantId, tenantId));

    return rows.map(toAvailabilityRule);
  }

  // ── Bookings ──────────────────────────────────────────────────

  async listBookings(
    tenantId: string,
    filters?: { roomId?: string; resourceId?: string; status?: string[] },
  ): Promise<Booking[]> {
    const conditions = [eq(bookings.tenantId, tenantId)];

    if (filters?.roomId) {
      conditions.push(eq(bookings.roomId, filters.roomId));
    }
    if (filters?.resourceId) {
      conditions.push(eq(bookings.resourceId, filters.resourceId));
    }
    if (filters?.status && filters.status.length > 0) {
      conditions.push(
        inArray(
          bookings.status,
          filters.status as [BookingStatus, ...BookingStatus[]],
        ),
      );
    }

    const rows = await this.db
      .select()
      .from(bookings)
      .where(and(...conditions));

    return rows.map(toBooking);
  }

  async getBooking(
    tenantId: string,
    bookingId: string,
  ): Promise<Booking | null> {
    const rows = await this.db
      .select()
      .from(bookings)
      .where(and(eq(bookings.tenantId, tenantId), eq(bookings.id, bookingId)))
      .limit(1);

    return rows[0] ? toBooking(rows[0]) : null;
  }

  async createBooking(booking: Booking): Promise<Booking> {
    try {
      const rows = await this.db
        .insert(bookings)
        .values({
          id: booking.id,
          tenantId: booking.tenantId,
          serviceId: booking.serviceId,
          resourceId: booking.resourceId,
          roomId: booking.roomId,
          customerId: booking.customerId,
          startsAt: booking.startsAt,
          endsAt: booking.endsAt,
          status: booking.status,
          paymentId: booking.paymentId,
          policyId: booking.policyId,
          rescheduleCount: booking.rescheduleCount,
          createdAt: booking.createdAt,
        })
        .returning();

      return toBooking(rows[0]!);
    } catch (error) {
      handleExclusionViolation(error);
    }
  }

  async updateBookingStatus(
    tenantId: string,
    bookingId: string,
    status: BookingStatus,
  ): Promise<Booking | null> {
    try {
      const rows = await this.db
        .update(bookings)
        .set({ status })
        .where(
          and(eq(bookings.tenantId, tenantId), eq(bookings.id, bookingId)),
        )
        .returning();

      return rows[0] ? toBooking(rows[0]) : null;
    } catch (error) {
      handleExclusionViolation(error);
    }
  }

  async updateBookingSlot(
    tenantId: string,
    bookingId: string,
    update: {
      startsAt: Date;
      endsAt: Date;
      resourceId: string | null;
      roomId: string;
      rescheduleCount: number;
    },
  ): Promise<Booking | null> {
    try {
      const rows = await this.db
        .update(bookings)
        .set({
          startsAt: update.startsAt,
          endsAt: update.endsAt,
          resourceId: update.resourceId,
          roomId: update.roomId,
          rescheduleCount: update.rescheduleCount,
        })
        .where(
          and(eq(bookings.tenantId, tenantId), eq(bookings.id, bookingId)),
        )
        .returning();

      return rows[0] ? toBooking(rows[0]) : null;
    } catch (error) {
      handleExclusionViolation(error);
    }
  }

  async findPendingBooking(
    tenantId: string,
    serviceId: string,
    resourceId: string | null,
    roomId: string,
    startsAt: Date,
    email: string,
  ): Promise<Booking | null> {
    const customer = await this.getCustomerByEmail(tenantId, email);
    if (!customer) return null;

    const conditions = [
      eq(bookings.tenantId, tenantId),
      eq(bookings.serviceId, serviceId),
      eq(bookings.roomId, roomId),
      eq(bookings.startsAt, startsAt),
      eq(bookings.customerId, customer.id),
      eq(bookings.status, 'pending'),
    ];

    if (resourceId !== null) {
      conditions.push(eq(bookings.resourceId, resourceId));
    } else {
      conditions.push(sql`${bookings.resourceId} IS NULL`);
    }

    const rows = await this.db
      .select()
      .from(bookings)
      .where(and(...conditions))
      .limit(1);

    return rows[0] ? toBooking(rows[0]) : null;
  }

  async listExpiredPendingBookings(
    tenantId: string,
    cutoff: Date,
  ): Promise<Booking[]> {
    const rows = await this.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.tenantId, tenantId),
          eq(bookings.status, 'pending'),
          lt(bookings.createdAt, cutoff),
        ),
      );

    return rows.map(toBooking);
  }

  // ── Customers ─────────────────────────────────────────────────

  async getCustomerByEmail(
    tenantId: string,
    email: string,
  ): Promise<Customer | null> {
    const rows = await this.db
      .select()
      .from(customers)
      .where(
        and(eq(customers.tenantId, tenantId), eq(customers.email, email)),
      )
      .limit(1);

    return rows[0] ? toCustomer(rows[0]) : null;
  }

  async upsertCustomer(customer: Customer): Promise<Customer> {
    const existing = await this.getCustomerByEmail(
      customer.tenantId,
      customer.email,
    );

    if (existing) {
      const rows = await this.db
        .update(customers)
        .set({
          displayName: customer.displayName,
          phone: customer.phone,
          shopifyCustomerId: customer.shopifyCustomerId,
        })
        .where(
          and(
            eq(customers.tenantId, customer.tenantId),
            eq(customers.email, customer.email),
          ),
        )
        .returning();
      return toCustomer(rows[0]!);
    }

    const rows = await this.db
      .insert(customers)
      .values({
        id: customer.id,
        tenantId: customer.tenantId,
        shopifyCustomerId: customer.shopifyCustomerId,
        email: customer.email,
        displayName: customer.displayName,
        phone: customer.phone,
        packCreditCents: customer.packCreditCents,
        giftCardBalanceCents: customer.giftCardBalanceCents,
        createdAt: customer.createdAt,
      })
      .returning();

    return toCustomer(rows[0]!);
  }

  async updateCustomerPackCredit(
    tenantId: string,
    customerId: string,
    delta: number,
  ): Promise<void> {
    await this.db
      .update(customers)
      .set({
        packCreditCents: sql`${customers.packCreditCents} + ${delta}`,
      })
      .where(
        and(eq(customers.tenantId, tenantId), eq(customers.id, customerId)),
      );
  }

  // ── Payments ──────────────────────────────────────────────────

  async getPayment(
    tenantId: string,
    paymentId: string,
  ): Promise<Payment | null> {
    const rows = await this.db
      .select()
      .from(payments)
      .where(
        and(eq(payments.tenantId, tenantId), eq(payments.id, paymentId)),
      )
      .limit(1);

    return rows[0] ? toPayment(rows[0]) : null;
  }

  async getPaymentByStripeId(
    tenantId: string,
    stripePaymentIntentId: string,
  ): Promise<Payment | null> {
    const rows = await this.db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.stripePaymentIntentId, stripePaymentIntentId),
        ),
      )
      .limit(1);

    return rows[0] ? toPayment(rows[0]) : null;
  }

  async createPayment(payment: Payment): Promise<Payment> {
    const rows = await this.db
      .insert(payments)
      .values({
        id: payment.id,
        tenantId: payment.tenantId,
        bookingId: payment.bookingId,
        stripePaymentIntentId: payment.stripePaymentIntentId,
        paidByCardCents: payment.paidByCardCents,
        paidByPackCents: payment.paidByPackCents,
        paidByGiftCardCents: payment.paidByGiftCardCents,
        totalCents: payment.totalCents,
        currency: payment.currency,
        status: payment.status,
        idempotencyKey: payment.idempotencyKey,
        createdAt: payment.createdAt,
      })
      .returning();

    return toPayment(rows[0]!);
  }

  async updatePaymentStatus(
    tenantId: string,
    paymentId: string,
    status: PaymentStatus,
    stripePaymentIntentId?: string,
  ): Promise<Payment | null> {
    const set: Record<string, unknown> = { status };
    if (stripePaymentIntentId) {
      set.stripePaymentIntentId = stripePaymentIntentId;
    }

    const rows = await this.db
      .update(payments)
      .set(set)
      .where(
        and(eq(payments.tenantId, tenantId), eq(payments.id, paymentId)),
      )
      .returning();

    return rows[0] ? toPayment(rows[0]) : null;
  }

  // ── Policies ──────────────────────────────────────────────────

  async getGlobalPolicy(tenantId: string): Promise<Policy | null> {
    const rows = await this.db
      .select()
      .from(policies)
      .where(
        and(eq(policies.tenantId, tenantId), eq(policies.scope, 'global')),
      )
      .limit(1);

    return rows[0] ? toPolicy(rows[0]) : null;
  }

  // ── Pack holds ────────────────────────────────────────────────

  async createPackHold(hold: PackHold): Promise<PackHold> {
    const rows = await this.db
      .insert(packHolds)
      .values({
        id: hold.id,
        tenantId: hold.tenantId,
        customerId: hold.customerId,
        bookingId: hold.bookingId,
        amountCents: hold.amountCents,
        status: hold.status,
        expiresAt: hold.expiresAt,
        createdAt: hold.createdAt,
      })
      .returning();

    return toPackHold(rows[0]!);
  }

  async getPackHoldByBooking(
    tenantId: string,
    bookingId: string,
  ): Promise<PackHold | null> {
    const rows = await this.db
      .select()
      .from(packHolds)
      .where(
        and(
          eq(packHolds.tenantId, tenantId),
          eq(packHolds.bookingId, bookingId),
          eq(packHolds.status, 'held'),
        ),
      )
      .limit(1);

    return rows[0] ? toPackHold(rows[0]) : null;
  }

  async updatePackHoldStatus(
    tenantId: string,
    holdId: string,
    status: PackHoldStatus,
  ): Promise<void> {
    await this.db
      .update(packHolds)
      .set({ status })
      .where(
        and(eq(packHolds.tenantId, tenantId), eq(packHolds.id, holdId)),
      );
  }

  async listExpiredPackHolds(
    tenantId: string,
    now: Date,
  ): Promise<PackHold[]> {
    const rows = await this.db
      .select()
      .from(packHolds)
      .where(
        and(
          eq(packHolds.tenantId, tenantId),
          eq(packHolds.status, 'held'),
          lt(packHolds.expiresAt, now),
        ),
      );

    return rows.map(toPackHold);
  }

  // ── Refunds ───────────────────────────────────────────────────

  async createRefund(refund: Refund): Promise<Refund> {
    const rows = await this.db
      .insert(refunds)
      .values({
        id: refund.id,
        tenantId: refund.tenantId,
        paymentId: refund.paymentId,
        bookingId: refund.bookingId,
        refundedToCardCents: refund.refundedToCardCents,
        refundedToPackCents: refund.refundedToPackCents,
        refundedToGiftCardCents: refund.refundedToGiftCardCents,
        totalCents: refund.totalCents,
        reason: refund.reason,
        status: refund.status,
        requestedAt: refund.requestedAt,
        completedAt: refund.completedAt,
      })
      .returning();

    return toRefund(rows[0]!);
  }

  async getRefundByBooking(
    tenantId: string,
    bookingId: string,
  ): Promise<Refund | null> {
    const rows = await this.db
      .select()
      .from(refunds)
      .where(
        and(eq(refunds.tenantId, tenantId), eq(refunds.bookingId, bookingId)),
      )
      .limit(1);

    return rows[0] ? toRefund(rows[0]) : null;
  }

  // ── Scheduled emails ──────────────────────────────────────────

  async createScheduledEmail(email: ScheduledEmail): Promise<ScheduledEmail> {
    const rows = await this.db
      .insert(scheduledEmails)
      .values({
        id: email.id,
        tenantId: email.tenantId,
        bookingId: email.bookingId,
        type: email.type,
        scheduledAt: email.scheduledAt,
        status: email.status,
        attempts: email.attempts,
        lastAttemptAt: email.lastAttemptAt,
        sentAt: email.sentAt,
        createdAt: email.createdAt,
      })
      .returning();

    return toScheduledEmail(rows[0]!);
  }

  async listPendingEmails(
    tenantId: string,
    now: Date,
    limit: number,
  ): Promise<ScheduledEmail[]> {
    const rows = await this.db
      .select()
      .from(scheduledEmails)
      .where(
        and(
          eq(scheduledEmails.tenantId, tenantId),
          eq(scheduledEmails.status, 'pending'),
          lte(scheduledEmails.scheduledAt, now),
        ),
      )
      .limit(limit);

    return rows.map(toScheduledEmail);
  }

  async updateEmailStatus(
    tenantId: string,
    emailId: string,
    status: EmailStatus,
    sentAt?: Date,
  ): Promise<void> {
    const set: Record<string, unknown> = { status };
    if (sentAt) {
      set.sentAt = sentAt;
    }

    await this.db
      .update(scheduledEmails)
      .set(set)
      .where(
        and(
          eq(scheduledEmails.tenantId, tenantId),
          eq(scheduledEmails.id, emailId),
        ),
      );
  }

  async incrementEmailAttempts(
    tenantId: string,
    emailId: string,
  ): Promise<void> {
    await this.db
      .update(scheduledEmails)
      .set({
        attempts: sql`${scheduledEmails.attempts} + 1`,
        lastAttemptAt: new Date(),
      })
      .where(
        and(
          eq(scheduledEmails.tenantId, tenantId),
          eq(scheduledEmails.id, emailId),
        ),
      );
  }

  async deletePendingReminder(
    tenantId: string,
    bookingId: string,
  ): Promise<void> {
    await this.db
      .delete(scheduledEmails)
      .where(
        and(
          eq(scheduledEmails.tenantId, tenantId),
          eq(scheduledEmails.bookingId, bookingId),
          eq(scheduledEmails.type, 'booking_reminder'),
          eq(scheduledEmails.status, 'pending'),
        ),
      );
  }
}
