import type { AuthClient, MagicLinkParams, MagicLinkResult, VerifyTokenResult } from '../index.js';

export class InMemoryAuthClient implements AuthClient {
  readonly sentLinks: MagicLinkParams[] = [];
  readonly tokens: Map<string, { email: string; tenantId: string }> = new Map();
  readonly manageTokens: Map<string, { bookingId: string; customerId: string; expiresAt: number }> = new Map();
  private counter = 0;

  async sendMagicLink(params: MagicLinkParams): Promise<MagicLinkResult> {
    const token = `magic_${++this.counter}`;
    this.sentLinks.push(params);
    this.tokens.set(token, { email: params.email, tenantId: params.tenantId });
    return { sent: true, token };
  }

  async verifyToken(token: string): Promise<VerifyTokenResult> {
    const data = this.tokens.get(token);
    if (!data) return { valid: false };
    this.tokens.delete(token);
    return { valid: true, email: data.email, tenantId: data.tenantId };
  }

  generateManageBookingToken(bookingId: string, customerId: string, expiresInMs: number): string {
    const token = `manage_${++this.counter}`;
    this.manageTokens.set(token, { bookingId, customerId, expiresAt: Date.now() + expiresInMs });
    return token;
  }

  verifyManageBookingToken(token: string): { bookingId: string; customerId: string } | null {
    const data = this.manageTokens.get(token);
    if (!data || data.expiresAt < Date.now()) return null;
    this.manageTokens.delete(token);
    return { bookingId: data.bookingId, customerId: data.customerId };
  }
}
