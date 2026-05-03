import type { AvailabilityRule, TimeWindow } from '@zedslot/domain';

/**
 * For a given date, compose recurring + override rules into available time windows.
 * Override always wins: isUnavailable=true subtracts; isUnavailable=false replaces.
 */
export function getAvailableWindows(
  date: Date,
  rules: AvailabilityRule[],
  tz: string,
): TimeWindow[] {
  const dayOfWeek = getDayOfWeekInTz(date, tz);
  const dateStr = formatDateInTz(date, tz);

  const recurring = rules.filter(
    (r) => r.kind === 'recurring' && r.dayOfWeek === dayOfWeek && !r.isUnavailable,
  );

  const overrides = rules.filter((r) => {
    if (r.kind !== 'override') return false;
    if (!r.dateRangeStart || !r.dateRangeEnd) return false;
    const start = formatDateInTz(r.dateRangeStart, tz);
    const end = formatDateInTz(r.dateRangeEnd, tz);
    return dateStr >= start && dateStr <= end;
  });

  if (overrides.length === 0) {
    return mergeWindows(recurring.map((r) => ({ startTime: r.startTime, endTime: r.endTime })));
  }

  const unavailableOverrides = overrides.filter((o) => o.isUnavailable);
  const availableOverrides = overrides.filter((o) => !o.isUnavailable);

  let baseWindows: TimeWindow[];

  if (availableOverrides.length > 0) {
    baseWindows = mergeWindows(
      availableOverrides.map((o) => ({ startTime: o.startTime, endTime: o.endTime })),
    );
  } else {
    baseWindows = mergeWindows(
      recurring.map((r) => ({ startTime: r.startTime, endTime: r.endTime })),
    );
  }

  if (unavailableOverrides.length > 0) {
    for (const unavailable of unavailableOverrides) {
      baseWindows = subtractWindow(baseWindows, {
        startTime: unavailable.startTime,
        endTime: unavailable.endTime,
      });
    }
  }

  return baseWindows;
}

function getDayOfWeekInTz(date: Date, tz: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' });
  const dayStr = formatter.format(date);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[dayStr] ?? 0;
}

function formatDateInTz(date: Date, tz: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  return formatter.format(date);
}

/** Merge overlapping/adjacent windows into sorted non-overlapping list. */
export function mergeWindows(windows: TimeWindow[]): TimeWindow[] {
  if (windows.length === 0) return [];

  const sorted = [...windows].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const merged: TimeWindow[] = [sorted[0]!];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]!;
    const last = merged[merged.length - 1]!;

    if (current.startTime <= last.endTime) {
      last.endTime = current.endTime > last.endTime ? current.endTime : last.endTime;
    } else {
      merged.push({ ...current });
    }
  }

  return merged;
}

/** Subtract a single window from a list of windows. */
export function subtractWindow(windows: TimeWindow[], sub: TimeWindow): TimeWindow[] {
  const result: TimeWindow[] = [];

  for (const w of windows) {
    if (sub.endTime <= w.startTime || sub.startTime >= w.endTime) {
      result.push(w);
    } else {
      if (sub.startTime > w.startTime) {
        result.push({ startTime: w.startTime, endTime: sub.startTime });
      }
      if (sub.endTime < w.endTime) {
        result.push({ startTime: sub.endTime, endTime: w.endTime });
      }
    }
  }

  return result;
}
