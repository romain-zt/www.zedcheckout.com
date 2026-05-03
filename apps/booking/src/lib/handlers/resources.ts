import type { RequestContext } from '../context.js';

interface ResourcesQuery {
  ids?: string[];
}

export async function handleListResources(ctx: RequestContext, query: ResourcesQuery) {
  const resources = await ctx.store.listResources(ctx.tenantId, query.ids);

  return {
    status: 200,
    body: {
      resources: resources
        .filter((r) => r.status === 'active')
        .map((r) => ({
          id: r.id,
          name: r.name,
        })),
    },
  };
}
