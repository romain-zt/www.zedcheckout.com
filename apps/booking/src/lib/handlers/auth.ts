import type { RequestContext } from '../context.js';

const MAGIC_LINK_RATE_LIMIT = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

interface MagicLinkInput {
  email: string;
  returnTo: string;
}

export async function handleMagicLink(ctx: RequestContext, input: MagicLinkInput) {
  if (!input.email || !input.returnTo) {
    return { status: 400, body: { error: 'VALIDATION_ERROR', message: 'email and returnTo are required' } };
  }

  // Rate limiting
  const rateKey = `${ctx.tenantId}:${input.email}`;
  const now = Date.now();
  const entry = MAGIC_LINK_RATE_LIMIT.get(rateKey);

  if (entry) {
    if (now - entry.windowStart < RATE_LIMIT_WINDOW_MS) {
      if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        return { status: 429, body: { error: 'RATE_LIMITED', message: 'Too many magic link requests. Try again later.' } };
      }
      entry.count++;
    } else {
      MAGIC_LINK_RATE_LIMIT.set(rateKey, { count: 1, windowStart: now });
    }
  } else {
    MAGIC_LINK_RATE_LIMIT.set(rateKey, { count: 1, windowStart: now });
  }

  await ctx.deps.auth.sendMagicLink({
    email: input.email,
    tenantId: ctx.tenantId,
    returnTo: input.returnTo,
  });

  return { status: 200, body: { sent: true } };
}

interface VerifyInput {
  token: string;
}

export interface SessionData {
  email: string;
  tenantId: string;
}

export async function handleVerify(ctx: RequestContext, input: VerifyInput): Promise<{
  status: number;
  body: Record<string, unknown>;
  session?: SessionData;
  redirectTo?: string;
}> {
  if (!input.token) {
    return { status: 400, body: { error: 'VALIDATION_ERROR', message: 'token is required' } };
  }

  const result = await ctx.deps.auth.verifyToken(input.token);
  if (!result.valid || !result.email || !result.tenantId) {
    return { status: 401, body: { error: 'INVALID_TOKEN', message: 'Magic link is invalid or expired' } };
  }

  return {
    status: 200,
    body: { verified: true, email: result.email },
    session: { email: result.email, tenantId: result.tenantId },
  };
}

/**
 * Reset rate limiter (for testing).
 */
export function resetRateLimiter(): void {
  MAGIC_LINK_RATE_LIMIT.clear();
}
