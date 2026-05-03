import type { RequestContext } from '../context';

interface BalanceInput {
  email: string;
}

export async function handleGetBalance(ctx: RequestContext, input: BalanceInput) {
  if (!input.email) {
    return { status: 401, body: { error: 'UNAUTHORIZED', message: 'Authentication required' } };
  }

  // Look up customer locally first
  const customer = await ctx.store.getCustomerByEmail(ctx.tenantId, input.email);

  // Try Shopify for live balance
  try {
    const shopifyCustomer = await ctx.deps.shopify.getCustomerByEmail(input.email);
    if (shopifyCustomer) {
      const credit = await ctx.deps.shopify.getCustomerCredit(shopifyCustomer.id);
      return {
        status: 200,
        body: {
          packCreditCents: credit.packCreditCents,
          giftCardBalanceCents: credit.giftCardBalanceCents,
          email: input.email,
        },
      };
    }
  } catch {
    // Shopify down: fall back to cached local balance
  }

  if (customer) {
    return {
      status: 200,
      body: {
        packCreditCents: customer.packCreditCents,
        giftCardBalanceCents: customer.giftCardBalanceCents,
        email: input.email,
      },
    };
  }

  return {
    status: 200,
    body: {
      packCreditCents: 0,
      giftCardBalanceCents: 0,
      email: input.email,
    },
  };
}
