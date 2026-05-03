import { listAvailableSlots } from '@zedslot/booking-engine';
import type { RequestContext } from '../context.js';

interface SlotsQuery {
  serviceId: string;
  resourceId?: string;
  from: string;
  to: string;
}

export async function handleListSlots(ctx: RequestContext, query: SlotsQuery) {
  const service = await ctx.store.getService(ctx.tenantId, query.serviceId);
  if (!service) {
    return { status: 404, body: { error: 'NOT_FOUND', message: 'Service not found' } };
  }

  const [resources, rooms, bookings, rules] = await Promise.all([
    ctx.store.listResources(ctx.tenantId, service.eligibleResourceIds),
    ctx.store.listRooms(ctx.tenantId, service.eligibleRoomIds),
    ctx.store.listBookings(ctx.tenantId, { status: ['pending', 'confirmed'] }),
    ctx.store.listAvailabilityRules(ctx.tenantId),
  ]);

  let filteredResources = resources;
  if (query.resourceId) {
    filteredResources = resources.filter((r) => r.id === query.resourceId);
  }

  const from = new Date(query.from);
  const to = new Date(query.to);

  const tenant = (await import('../tenant.js')).getTenant(ctx.tenantId);
  const tz = tenant?.timezone ?? 'Europe/Paris';

  const slots = listAvailableSlots(service, { from, to }, filteredResources, rooms, bookings, rules, tz);

  return {
    status: 200,
    body: {
      slots: slots.map((s) => ({
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        resourceId: s.resourceId,
        roomId: s.roomId,
      })),
    },
  };
}
