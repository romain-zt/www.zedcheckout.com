import type { RequestContext } from '../context';

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 50;

/**
 * Cron job: process scheduled emails.
 * Runs every 1 minute via Vercel Cron.
 */
export async function handleProcessEmails(ctx: RequestContext) {
  const now = new Date();
  const pending = await ctx.store.listPendingEmails(ctx.tenantId, now, BATCH_SIZE);

  let sent = 0;
  let failed = 0;

  for (const email of pending) {
    await ctx.store.incrementEmailAttempts(ctx.tenantId, email.id);

    try {
      const booking = await ctx.store.getBooking(ctx.tenantId, email.bookingId);
      if (!booking) {
        await ctx.store.updateEmailStatus(ctx.tenantId, email.id, 'failed');
        failed++;
        continue;
      }

      const customer = await findCustomerForBooking(ctx, booking.customerId);
      if (!customer) {
        await ctx.store.updateEmailStatus(ctx.tenantId, email.id, 'failed');
        failed++;
        continue;
      }

      const service = await ctx.store.getService(ctx.tenantId, booking.serviceId);

      const subject = getSubject(email.type, service?.name);
      const html = renderEmailHtml(email.type, {
        customerName: customer.displayName,
        serviceName: service?.name?.en ?? 'Booking',
        startsAt: booking.startsAt.toISOString(),
        endsAt: booking.endsAt.toISOString(),
      });

      const result = await ctx.deps.email.send({
        to: customer.email,
        subject,
        html,
      });

      if (result.success) {
        await ctx.store.updateEmailStatus(ctx.tenantId, email.id, 'sent', new Date());
        sent++;
      } else {
        if (email.attempts + 1 >= MAX_ATTEMPTS) {
          await ctx.store.updateEmailStatus(ctx.tenantId, email.id, 'failed');
          failed++;
        }
      }
    } catch {
      if (email.attempts + 1 >= MAX_ATTEMPTS) {
        await ctx.store.updateEmailStatus(ctx.tenantId, email.id, 'failed');
        failed++;
      }
    }
  }

  return {
    status: 200,
    body: { processed: pending.length, sent, failed },
  };
}

async function findCustomerForBooking(ctx: RequestContext, customerId: string) {
  // Search through customers in the store
  // In production this would be a direct DB lookup by ID
  const allCustomers = await Promise.resolve(
    (ctx.store as unknown as { customers?: Array<{ id: string; email: string; displayName: string }> }).customers ?? [],
  );
  return (allCustomers as Array<{ id: string; email: string; displayName: string }>).find((c) => c.id === customerId) ?? null;
}

function getSubject(type: string, serviceName?: Record<string, string>): string {
  const name = serviceName?.en ?? 'Booking';
  switch (type) {
    case 'booking_confirmation':
      return `Booking Confirmed: ${name}`;
    case 'booking_reminder':
      return `Reminder: ${name} tomorrow`;
    case 'booking_cancellation':
      return `Booking Cancelled: ${name}`;
    default:
      return 'Booking Update';
  }
}

function renderEmailHtml(
  type: string,
  data: { customerName: string; serviceName: string; startsAt: string; endsAt: string },
): string {
  // Minimal HTML; React Email templates (Phase 6) will replace this
  switch (type) {
    case 'booking_confirmation':
      return `<h1>Booking Confirmed</h1><p>Hi ${data.customerName}, your ${data.serviceName} is confirmed for ${data.startsAt}.</p>`;
    case 'booking_reminder':
      return `<h1>Booking Reminder</h1><p>Hi ${data.customerName}, your ${data.serviceName} is tomorrow at ${data.startsAt}.</p>`;
    case 'booking_cancellation':
      return `<h1>Booking Cancelled</h1><p>Hi ${data.customerName}, your ${data.serviceName} for ${data.startsAt} has been cancelled.</p>`;
    default:
      return '<p>Booking update</p>';
  }
}
