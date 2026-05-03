import type { SentryClient } from '../sentry';
import type { Logger } from '../logger';

export class InMemorySentryClient implements SentryClient {
  readonly exceptions: Array<{
    error: Error;
    context?: Record<string, unknown>;
  }> = [];
  readonly messages: Array<{
    message: string;
    level: string;
    context?: Record<string, unknown>;
  }> = [];

  captureException(
    error: Error,
    context?: Record<string, unknown>,
  ): string {
    this.exceptions.push({ error, context });
    return `test-event-${this.exceptions.length}`;
  }

  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: Record<string, unknown>,
  ): string {
    this.messages.push({ message, level, context });
    return `test-event-${this.messages.length}`;
  }

  clear(): void {
    this.exceptions.length = 0;
    this.messages.length = 0;
  }
}

export class InMemoryLogger implements Logger {
  readonly entries: Array<{
    level: string;
    message: string;
    data?: Record<string, unknown>;
  }> = [];
  private context: Record<string, string> = {};

  info(message: string, data?: Record<string, unknown>): void {
    this.entries.push({
      level: 'info',
      message,
      data: { ...this.context, ...data },
    });
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.entries.push({
      level: 'warn',
      message,
      data: { ...this.context, ...data },
    });
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.entries.push({
      level: 'error',
      message,
      data: { ...this.context, ...data },
    });
  }

  with(ctx: {
    tenantId?: string;
    bookingId?: string;
    traceId?: string;
    [key: string]: string | undefined;
  }): Logger {
    const child = new InMemoryLogger();
    child.context = { ...this.context };
    for (const [k, v] of Object.entries(ctx)) {
      if (v !== undefined) child.context[k] = v;
    }
    return child;
  }

  clear(): void {
    this.entries.length = 0;
    this.context = {};
  }
}
