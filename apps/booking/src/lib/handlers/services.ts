import type { RequestContext } from '../context';

export async function handleListServices(ctx: RequestContext) {
  const services = await ctx.store.listActiveServices(ctx.tenantId);

  return {
    status: 200,
    body: {
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        durationMinutes: s.durationMinutes,
        priceCents: s.priceCents,
        requiresResource: s.requiresResource,
        requiresRoom: s.requiresRoom,
        eligibleResourceIds: s.eligibleResourceIds,
        eligibleRoomIds: s.eligibleRoomIds,
      })),
    },
  };
}
