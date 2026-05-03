import type { Service, Resource, Room, Booking, AvailabilityRule, Slot } from '@zedslot/domain';
import { getAvailableWindows } from './availability.js';

export function listAvailableSlots(
  service: Service,
  dateRange: { from: Date; to: Date },
  resources: Resource[],
  rooms: Room[],
  existingBookings: Booking[],
  availabilityRules: AvailabilityRule[],
  tz: string,
): Slot[] {
  const slots: Slot[] = [];
  const durationMs = service.durationMinutes * 60 * 1000;
  const slotStepMs = 30 * 60 * 1000; // 30-min increments

  const eligibleResources = resources.filter(
    (r) => service.eligibleResourceIds.includes(r.id) && r.status === 'active',
  );
  const eligibleRooms = rooms.filter(
    (r) => service.eligibleRoomIds.includes(r.id) && r.status === 'active',
  );

  const confirmedOrPending = existingBookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed',
  );

  const currentDate = new Date(dateRange.from);
  while (currentDate <= dateRange.to) {
    const dateSnapshot = new Date(currentDate);

    if (service.requiresResource) {
      for (const resource of eligibleResources) {
        const resourceRules = availabilityRules.filter(
          (r) => r.scope === `resource:${resource.id}`,
        );
        const windows = getAvailableWindows(dateSnapshot, resourceRules, tz);

        for (const window of windows) {
          const windowSlots = generateSlotsFromWindow(
            dateSnapshot,
            window.startTime,
            window.endTime,
            durationMs,
            slotStepMs,
            tz,
          );

          for (const { startsAt, endsAt } of windowSlots) {
            const resourceConflict = confirmedOrPending.some(
              (b) =>
                b.resourceId === resource.id &&
                hasOverlap(b.startsAt, b.endsAt, startsAt, endsAt),
            );
            if (resourceConflict) continue;

            const availableRoom = findAvailableRoom(
              eligibleRooms,
              confirmedOrPending,
              availabilityRules,
              startsAt,
              endsAt,
              dateSnapshot,
              tz,
            );
            if (!availableRoom) continue;

            slots.push({
              tenantId: service.tenantId,
              serviceId: service.id,
              resourceId: resource.id,
              roomId: availableRoom.id,
              startsAt,
              endsAt,
            });
          }
        }
      }
    } else {
      for (const room of eligibleRooms) {
        const roomRules = availabilityRules.filter(
          (r) => r.scope === `room:${room.id}`,
        );
        const windows = getAvailableWindows(dateSnapshot, roomRules, tz);

        for (const window of windows) {
          const windowSlots = generateSlotsFromWindow(
            dateSnapshot,
            window.startTime,
            window.endTime,
            durationMs,
            slotStepMs,
            tz,
          );

          for (const { startsAt, endsAt } of windowSlots) {
            const roomConflict = confirmedOrPending.some(
              (b) =>
                b.roomId === room.id &&
                hasOverlap(b.startsAt, b.endsAt, startsAt, endsAt),
            );
            if (roomConflict) continue;

            slots.push({
              tenantId: service.tenantId,
              serviceId: service.id,
              resourceId: null,
              roomId: room.id,
              startsAt,
              endsAt,
            });
          }
        }
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return deduplicateSlots(slots);
}

function findAvailableRoom(
  eligibleRooms: Room[],
  existingBookings: Booking[],
  availabilityRules: AvailabilityRule[],
  startsAt: Date,
  endsAt: Date,
  date: Date,
  tz: string,
): Room | null {
  const sorted = [...eligibleRooms].sort((a, b) => a.id.localeCompare(b.id));

  for (const room of sorted) {
    const roomRules = availabilityRules.filter((r) => r.scope === `room:${room.id}`);
    const windows = getAvailableWindows(date, roomRules, tz);

    const slotStartTime = formatTimeInTz(startsAt, tz);
    const slotEndTime = formatTimeInTz(endsAt, tz);
    const withinWindow = windows.some(
      (w) => w.startTime <= slotStartTime && w.endTime >= slotEndTime,
    );

    if (roomRules.length > 0 && !withinWindow) continue;

    const roomConflict = existingBookings.some(
      (b) => b.roomId === room.id && hasOverlap(b.startsAt, b.endsAt, startsAt, endsAt),
    );
    if (roomConflict) continue;

    return room;
  }

  return null;
}

function generateSlotsFromWindow(
  date: Date,
  startTime: string,
  endTime: string,
  durationMs: number,
  stepMs: number,
  tz: string,
): Array<{ startsAt: Date; endsAt: Date }> {
  const slots: Array<{ startsAt: Date; endsAt: Date }> = [];
  const dateStr = formatDateInTz(date, tz);

  const windowStart = parseDateTimeInTz(dateStr, startTime, tz);
  const windowEnd = parseDateTimeInTz(dateStr, endTime, tz);

  let cursor = windowStart.getTime();
  while (cursor + durationMs <= windowEnd.getTime()) {
    slots.push({
      startsAt: new Date(cursor),
      endsAt: new Date(cursor + durationMs),
    });
    cursor += stepMs;
  }

  return slots;
}

function formatDateInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatTimeInTz(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function parseDateTimeInTz(dateStr: string, timeStr: string, tz: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);

  const utcGuess = new Date(Date.UTC(year!, month! - 1, day!, hours!, minutes!));

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(utcGuess);
  const tzHour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const tzMinute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);

  const offsetMs = ((tzHour - hours!) * 60 + (tzMinute - minutes!)) * 60 * 1000;
  return new Date(utcGuess.getTime() - offsetMs);
}

export function hasOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

function deduplicateSlots(slots: Slot[]): Slot[] {
  const seen = new Set<string>();
  return slots.filter((s) => {
    const key = `${s.resourceId ?? 'null'}:${s.roomId}:${s.startsAt.getTime()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
