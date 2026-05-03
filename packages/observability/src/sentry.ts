import * as Sentry from '@sentry/node';

export interface SentryClient {
  captureException(
    error: Error,
    context?: Record<string, unknown>,
  ): string;
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: Record<string, unknown>,
  ): string;
}

const PII_FIELDS = [
  'email',
  'customerEmail',
  'phone',
  'customerPhone',
  'customerName',
] as const;

const piiSet: ReadonlySet<string> = new Set(PII_FIELDS);

export function scrubPii(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (piiSet.has(key)) {
      result[key] = '[REDACTED]';
    } else if (
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value)
    ) {
      result[key] = scrubPii(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

class SentrySdkClient implements SentryClient {
  captureException(
    error: Error,
    context?: Record<string, unknown>,
  ): string {
    const eventId = Sentry.captureException(error, {
      extra: context ? scrubPii(context) : undefined,
    });
    return eventId;
  }

  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    context?: Record<string, unknown>,
  ): string {
    const eventId = Sentry.captureMessage(message, {
      level,
      extra: context ? scrubPii(context) : undefined,
    });
    return eventId;
  }
}

class NoOpSentryClient implements SentryClient {
  captureException(
    error: Error,
    _context?: Record<string, unknown>,
  ): string {
    console.warn('[sentry:noop] captureException:', error.message);
    return 'noop-event-id';
  }

  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error',
    _context?: Record<string, unknown>,
  ): string {
    console.warn(`[sentry:noop] captureMessage (${level}):`, message);
    return 'noop-event-id';
  }
}

export function initSentry(
  dsn: string,
  options?: { environment?: string; release?: string },
): SentryClient {
  if (!dsn) {
    return new NoOpSentryClient();
  }

  Sentry.init({
    dsn,
    environment: options?.environment,
    release: options?.release,
  });

  return new SentrySdkClient();
}
