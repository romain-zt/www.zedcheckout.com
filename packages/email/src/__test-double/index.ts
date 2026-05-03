import type { EmailSender, SendEmailParams, SendEmailResult } from '../index.js';

export class InMemoryEmailSender implements EmailSender {
  readonly sentEmails: Array<SendEmailParams & { id: string }> = [];
  private counter = 0;
  shouldFail = false;

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    if (this.shouldFail) {
      return { id: '', success: false };
    }

    const id = `email_${++this.counter}`;
    this.sentEmails.push({ ...params, id });
    return { id, success: true };
  }

  reset(): void {
    this.sentEmails.length = 0;
    this.counter = 0;
    this.shouldFail = false;
  }
}
