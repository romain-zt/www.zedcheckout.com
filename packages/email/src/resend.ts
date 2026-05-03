import { Resend } from 'resend';
import type { EmailSender, SendEmailParams, SendEmailResult } from './index';

class ResendEmailSender implements EmailSender {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    const { data, error } = await this.client.emails.send({
      from: params.from ?? 'noreply@zedslot.com',
      to: [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo,
    });

    if (error || !data) {
      return { id: '', success: false };
    }

    return { id: data.id, success: true };
  }
}

export function createResendSender(apiKey: string): EmailSender {
  return new ResendEmailSender(apiKey);
}
