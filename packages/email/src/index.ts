export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  id: string;
  success: boolean;
}

export interface EmailSender {
  send(params: SendEmailParams): Promise<SendEmailResult>;
}

export { createResendSender } from './resend.js';
export { renderEmail, type RenderedEmail } from './render.js';
export {
  BookingConfirmationEmail,
  getConfirmationSubject,
  BookingReminderEmail,
  getReminderSubject,
  BookingCancellationEmail,
  getCancellationSubject,
} from './templates/index.js';
export type {
  BookingConfirmationProps,
  BookingReminderProps,
  BookingCancellationProps,
  RefundBreakdown,
  Branding,
  CalendarLinks,
  Locale,
} from './templates/index.js';

export type { EmailSender as default };
