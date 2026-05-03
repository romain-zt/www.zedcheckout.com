export interface MagicLinkParams {
  email: string;
  tenantId: string;
  returnTo: string;
}

export interface MagicLinkResult {
  sent: boolean;
  token?: string;
}

export interface VerifyTokenResult {
  valid: boolean;
  email?: string;
  tenantId?: string;
}

export interface AuthClient {
  sendMagicLink(params: MagicLinkParams): Promise<MagicLinkResult>;
  verifyToken(token: string): Promise<VerifyTokenResult>;
  generateManageBookingToken(bookingId: string, customerId: string, expiresInMs: number): string;
  verifyManageBookingToken(token: string): { bookingId: string; customerId: string } | null;
}

export type { AuthClient as default };
