import { describe, it, expect, vi, beforeEach, type MockInstance } from 'vitest';
import { scrubPii, initSentry, createLogger } from '../src/index';
import {
  InMemorySentryClient,
  InMemoryLogger,
} from '../src/__test-double/index';

describe('scrubPii', () => {
  it('redacts known PII fields', () => {
    const result = scrubPii({
      email: 'a@b.com',
      customerEmail: 'c@d.com',
      phone: '555-1234',
      customerPhone: '555-5678',
      customerName: 'Alice',
    });

    expect(result).toEqual({
      email: '[REDACTED]',
      customerEmail: '[REDACTED]',
      phone: '[REDACTED]',
      customerPhone: '[REDACTED]',
      customerName: '[REDACTED]',
    });
  });

  it('leaves non-PII fields untouched', () => {
    const result = scrubPii({
      tenantId: 'tenant-1',
      bookingId: 'booking-2',
      amount: 100,
    });

    expect(result).toEqual({
      tenantId: 'tenant-1',
      bookingId: 'booking-2',
      amount: 100,
    });
  });

  it('handles nested objects', () => {
    const result = scrubPii({
      user: {
        email: 'nested@test.com',
        name: 'safe-field',
      },
      topLevel: 'ok',
    });

    expect(result).toEqual({
      user: {
        email: '[REDACTED]',
        name: 'safe-field',
      },
      topLevel: 'ok',
    });
  });
});

describe('initSentry', () => {
  it('returns no-op client when dsn is empty', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const client = initSentry('');
    const eventId = client.captureException(new Error('test'));
    expect(eventId).toBe('noop-event-id');
    warnSpy.mockRestore();
  });

  it('no-op client does not throw on captureMessage', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const client = initSentry('');
    const eventId = client.captureMessage('hello', 'info');
    expect(eventId).toBe('noop-event-id');
    warnSpy.mockRestore();
  });
});

describe('InMemorySentryClient', () => {
  it('records exceptions', () => {
    const client = new InMemorySentryClient();
    const error = new Error('boom');
    const eventId = client.captureException(error, { userId: '1' });

    expect(eventId).toBe('test-event-1');
    expect(client.exceptions).toHaveLength(1);
    expect(client.exceptions[0]!.error).toBe(error);
    expect(client.exceptions[0]!.context).toEqual({ userId: '1' });
  });

  it('records messages', () => {
    const client = new InMemorySentryClient();
    const eventId = client.captureMessage('alert', 'warning', {
      source: 'test',
    });

    expect(eventId).toBe('test-event-1');
    expect(client.messages).toHaveLength(1);
    expect(client.messages[0]).toEqual({
      message: 'alert',
      level: 'warning',
      context: { source: 'test' },
    });
  });

  it('clear resets state', () => {
    const client = new InMemorySentryClient();
    client.captureException(new Error('e'));
    client.captureMessage('m', 'info');
    client.clear();

    expect(client.exceptions).toHaveLength(0);
    expect(client.messages).toHaveLength(0);
  });
});

describe('createLogger', () => {
  it('returns a Logger', () => {
    const logger = createLogger();
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.with).toBe('function');
  });
});

describe('StructuredLogger', () => {
  let stdoutSpy: MockInstance;

  beforeEach(() => {
    stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
  });

  it('writes JSON to stdout', () => {
    const logger = createLogger();
    logger.info('hello');

    expect(stdoutSpy).toHaveBeenCalledOnce();
    const output = (stdoutSpy.mock.calls[0]![0] as string).trim();
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('hello');
    expect(parsed.timestamp).toBeDefined();
  });

  it('.with() creates a child with merged context', () => {
    const logger = createLogger();
    const child = logger.with({ tenantId: 'x' });
    child.info('child-msg');

    const output = (stdoutSpy.mock.calls[0]![0] as string).trim();
    const parsed = JSON.parse(output);
    expect(parsed.tenantId).toBe('x');
    expect(parsed.message).toBe('child-msg');
  });

  it('.with() chains context across multiple calls', () => {
    const logger = createLogger();
    const child = logger.with({ tenantId: 'x' }).with({ bookingId: 'y' });
    child.info('chained');

    const output = (stdoutSpy.mock.calls[0]![0] as string).trim();
    const parsed = JSON.parse(output);
    expect(parsed.tenantId).toBe('x');
    expect(parsed.bookingId).toBe('y');
  });

  it('scrubs PII from data', () => {
    const logger = createLogger();
    logger.info('user-action', { customerEmail: 'secret@test.com', action: 'click' });

    const output = (stdoutSpy.mock.calls[0]![0] as string).trim();
    const parsed = JSON.parse(output);
    expect(parsed.customerEmail).toBe('[REDACTED]');
    expect(parsed.action).toBe('click');
  });

  it('filters by level: error logger skips info and warn', () => {
    const logger = createLogger({ level: 'error' });
    logger.info('skip-info');
    logger.warn('skip-warn');
    logger.error('keep-error');

    expect(stdoutSpy).toHaveBeenCalledOnce();
    const output = (stdoutSpy.mock.calls[0]![0] as string).trim();
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('keep-error');
  });

  it('filters by level: warn logger skips info', () => {
    const logger = createLogger({ level: 'warn' });
    logger.info('skip-info');
    logger.warn('keep-warn');

    expect(stdoutSpy).toHaveBeenCalledOnce();
    const output = (stdoutSpy.mock.calls[0]![0] as string).trim();
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe('warn');
  });
});

describe('InMemoryLogger', () => {
  it('records entries', () => {
    const logger = new InMemoryLogger();
    logger.info('hi', { key: 'val' });
    logger.warn('caution');
    logger.error('bad');

    expect(logger.entries).toHaveLength(3);
    expect(logger.entries[0]).toEqual({
      level: 'info',
      message: 'hi',
      data: { key: 'val' },
    });
    expect(logger.entries[1]!.level).toBe('warn');
    expect(logger.entries[2]!.level).toBe('error');
  });

  it('.with() merges context into entries', () => {
    const logger = new InMemoryLogger();
    const child = logger.with({ tenantId: 'abc' });
    child.info('from-child');

    const childLogger = child as InMemoryLogger;
    expect(childLogger.entries).toHaveLength(1);
    expect(childLogger.entries[0]!.data).toEqual({
      tenantId: 'abc',
    });
  });

  it('clear resets state', () => {
    const logger = new InMemoryLogger();
    logger.info('entry');
    logger.clear();

    expect(logger.entries).toHaveLength(0);
  });
});
