import { scrubPii } from './sentry';

export interface Logger {
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  with(context: {
    tenantId?: string;
    bookingId?: string;
    traceId?: string;
    [key: string]: string | undefined;
  }): Logger;
}

type LogLevel = 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  info: 0,
  warn: 1,
  error: 2,
};

export class StructuredLogger implements Logger {
  private readonly name?: string;
  private readonly level: LogLevel;
  private readonly parentContext: Record<string, string>;

  constructor(
    options?: { name?: string; level?: LogLevel },
    parentContext?: Record<string, string>,
  ) {
    this.name = options?.name;
    this.level = options?.level ?? 'info';
    this.parentContext = parentContext ?? {};
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  with(context: {
    tenantId?: string;
    bookingId?: string;
    traceId?: string;
    [key: string]: string | undefined;
  }): Logger {
    const merged: Record<string, string> = { ...this.parentContext };
    for (const [key, value] of Object.entries(context)) {
      if (value !== undefined) {
        merged[key] = value;
      }
    }
    return new StructuredLogger(
      { name: this.name, level: this.level },
      merged,
    );
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[this.level]) {
      return;
    }

    const entry: Record<string, unknown> = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.parentContext,
      ...scrubPii(data ?? {}),
    };

    if (this.name) {
      entry.name = this.name;
    }

    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}

export function createLogger(options?: {
  name?: string;
  level?: LogLevel;
}): Logger {
  return new StructuredLogger(options);
}
