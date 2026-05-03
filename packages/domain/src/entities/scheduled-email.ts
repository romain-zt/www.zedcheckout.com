export type EmailType = 'booking_confirmation' | 'booking_reminder' | 'booking_cancellation';
export type EmailStatus = 'pending' | 'sent' | 'failed';

export interface ScheduledEmail {
  id: string;
  tenantId: string;
  bookingId: string;
  type: EmailType;
  scheduledAt: Date;
  status: EmailStatus;
  attempts: number;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
}
