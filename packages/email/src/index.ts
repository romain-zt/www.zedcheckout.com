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

export type { EmailSender as default };
