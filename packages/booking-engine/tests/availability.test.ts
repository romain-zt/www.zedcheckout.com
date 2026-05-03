import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getAvailableWindows, mergeWindows, subtractWindow } from '../src/availability.js';
import type { AvailabilityRule } from '@zedslot/domain';

const tz = 'Europe/Paris';

function makeRule(
  overrides: Partial<AvailabilityRule> & Pick<AvailabilityRule, 'kind'>,
): AvailabilityRule {
  return {
    id: 'rule-1',
    tenantId: 'tenant-1',
    scope: 'resource:res-1',
    dayOfWeek: null,
    startTime: '09:00',
    endTime: '18:00',
    dateRangeStart: null,
    dateRangeEnd: null,
    isUnavailable: false,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('getAvailableWindows', () => {
  it('returns recurring windows for a matching day', () => {
    const monday = new Date('2026-06-01T12:00:00Z'); // Monday
    const rules: AvailabilityRule[] = [
      makeRule({ kind: 'recurring', dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }),
    ];
    const windows = getAvailableWindows(monday, rules, tz);
    expect(windows).toEqual([{ startTime: '09:00', endTime: '18:00' }]);
  });

  it('returns empty for non-matching day', () => {
    const tuesday = new Date('2026-06-02T12:00:00Z'); // Tuesday
    const rules: AvailabilityRule[] = [
      makeRule({ kind: 'recurring', dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }),
    ];
    const windows = getAvailableWindows(tuesday, rules, tz);
    expect(windows).toEqual([]);
  });

  it('override unavailable blocks recurring', () => {
    const monday = new Date('2026-06-01T12:00:00Z');
    const rules: AvailabilityRule[] = [
      makeRule({ kind: 'recurring', dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }),
      makeRule({
        id: 'override-1',
        kind: 'override',
        isUnavailable: true,
        startTime: '00:00',
        endTime: '23:59',
        dateRangeStart: new Date('2026-06-01T00:00:00Z'),
        dateRangeEnd: new Date('2026-06-01T23:59:59Z'),
      }),
    ];
    const windows = getAvailableWindows(monday, rules, tz);
    expect(windows).toEqual([]);
  });

  it('override replaces recurring when not unavailable', () => {
    const monday = new Date('2026-06-01T12:00:00Z');
    const rules: AvailabilityRule[] = [
      makeRule({ kind: 'recurring', dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }),
      makeRule({
        id: 'override-1',
        kind: 'override',
        isUnavailable: false,
        startTime: '14:00',
        endTime: '17:00',
        dateRangeStart: new Date('2026-06-01T00:00:00Z'),
        dateRangeEnd: new Date('2026-06-01T23:59:59Z'),
      }),
    ];
    const windows = getAvailableWindows(monday, rules, tz);
    expect(windows).toEqual([{ startTime: '14:00', endTime: '17:00' }]);
  });

  it('partial unavailable override subtracts from recurring', () => {
    const monday = new Date('2026-06-01T12:00:00Z');
    const rules: AvailabilityRule[] = [
      makeRule({ kind: 'recurring', dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }),
      makeRule({
        id: 'override-1',
        kind: 'override',
        isUnavailable: true,
        startTime: '12:00',
        endTime: '14:00',
        dateRangeStart: new Date('2026-06-01T00:00:00Z'),
        dateRangeEnd: new Date('2026-06-01T23:59:59Z'),
      }),
    ];
    const windows = getAvailableWindows(monday, rules, tz);
    expect(windows).toEqual([
      { startTime: '09:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '18:00' },
    ]);
  });
});

describe('mergeWindows', () => {
  it('merges overlapping windows', () => {
    expect(
      mergeWindows([
        { startTime: '09:00', endTime: '12:00' },
        { startTime: '11:00', endTime: '15:00' },
      ]),
    ).toEqual([{ startTime: '09:00', endTime: '15:00' }]);
  });

  it('property: merged windows are sorted and non-overlapping', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            startTime: fc.integer({ min: 0, max: 23 }).map((h) => `${String(h).padStart(2, '0')}:00`),
            endTime: fc.integer({ min: 1, max: 24 }).map((h) => `${String(h).padStart(2, '0')}:00`),
          }),
          { minLength: 0, maxLength: 10 },
        ),
        (windows) => {
          const valid = windows.filter((w) => w.startTime < w.endTime);
          const merged = mergeWindows(valid);

          for (let i = 1; i < merged.length; i++) {
            expect(merged[i]!.startTime >= merged[i - 1]!.endTime).toBe(true);
          }
        },
      ),
    );
  });
});

describe('subtractWindow', () => {
  it('removes middle of a window', () => {
    const result = subtractWindow(
      [{ startTime: '09:00', endTime: '18:00' }],
      { startTime: '12:00', endTime: '14:00' },
    );
    expect(result).toEqual([
      { startTime: '09:00', endTime: '12:00' },
      { startTime: '14:00', endTime: '18:00' },
    ]);
  });

  it('removes nothing when no overlap', () => {
    const result = subtractWindow(
      [{ startTime: '09:00', endTime: '12:00' }],
      { startTime: '14:00', endTime: '16:00' },
    );
    expect(result).toEqual([{ startTime: '09:00', endTime: '12:00' }]);
  });
});
