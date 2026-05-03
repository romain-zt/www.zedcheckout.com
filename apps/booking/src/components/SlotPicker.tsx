'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, ScrollArea, Skeleton, Badge } from '@zedslot/ui';
import { formatTime, formatDayShort, type Locale } from '@/lib/locale';
import type { SlotData } from './BookingFlow';

interface SlotPickerProps {
  serviceId: string;
  resourceId?: string;
  locale: Locale;
  onSelect: (slot: SlotData) => void;
  selectedSlot: SlotData | null;
}

interface DayGroup {
  dateKey: string;
  label: { dayName: string; dayNum: string; monthName: string };
  slots: SlotData[];
}

export function SlotPicker({ serviceId, resourceId, locale, onSelect, selectedSlot }: SlotPickerProps) {
  const [loading, setLoading] = useState(true);
  const [dayGroups, setDayGroups] = useState<DayGroup[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadSlots() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ serviceId });
        if (resourceId) params.set('resourceId', resourceId);
        const res = await fetch(`/api/slots?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to load slots');
        const data = await res.json();

        if (cancelled) return;

        const grouped = groupByDay(data.slots, locale);
        setDayGroups(grouped);
        setActiveDayIndex(0);
      } catch {
        if (!cancelled) setDayGroups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadSlots();
    return () => { cancelled = true; };
  }, [serviceId, resourceId, locale]);

  const label = locale === 'fr' ? 'Choisissez un créneau' : 'Choose a time';

  if (loading) {
    return (
      <section aria-label={label}>
        <h2 className="mb-3 text-lg font-semibold">{label}</h2>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-xl" />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  if (dayGroups.length === 0) {
    return (
      <section aria-label={label}>
        <h2 className="mb-3 text-lg font-semibold">{label}</h2>
        <p className="text-sm text-navy/60">
          {locale === 'fr'
            ? 'Aucune disponibilité dans les 14 prochains jours.'
            : 'No availability in the next 14 days.'}
        </p>
      </section>
    );
  }

  const activeGroup = dayGroups[activeDayIndex];

  return (
    <section aria-label={label}>
      <h2 className="mb-3 text-lg font-semibold">{label}</h2>

      {/* Day tabs */}
      <ScrollArea orientation="horizontal" className="-mx-4 px-4 mb-3">
        <div ref={tabsRef} className="flex gap-2" role="tablist">
          {dayGroups.map((group, idx) => {
            const isActive = idx === activeDayIndex;
            return (
              <button
                key={group.dateKey}
                role="tab"
                aria-selected={isActive}
                className={`
                  flex min-h-[44px] min-w-[60px] shrink-0 flex-col items-center justify-center rounded-xl px-3 py-2
                  transition-colors
                  ${isActive
                    ? 'bg-navy text-white'
                    : 'bg-white text-navy border border-navy/10 hover:border-navy/20'
                  }
                `}
                onClick={() => setActiveDayIndex(idx)}
              >
                <span className="text-xs uppercase opacity-70">{group.label.dayName}</span>
                <span className="text-lg font-semibold leading-tight">{group.label.dayNum}</span>
                <span className="text-xs opacity-70">{group.label.monthName}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Time slots for active day */}
      {activeGroup && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="tabpanel">
          {activeGroup.slots.map((slot) => {
            const isSelected =
              selectedSlot?.startsAt === slot.startsAt &&
              selectedSlot?.resourceId === slot.resourceId;

            return (
              <Card
                key={`${slot.startsAt}-${slot.resourceId}`}
                variant={isSelected ? 'selected' : 'default'}
                interactive
                padding="sm"
                onClick={() => onSelect(slot)}
                role="radio"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(slot);
                  }
                }}
              >
                <p className="text-center text-sm font-medium">
                  {formatTime(slot.startsAt, locale)}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        <Badge variant="default">
          {activeGroup?.slots.length ?? 0} {locale === 'fr' ? 'créneaux' : 'slots'}
        </Badge>
      </div>
    </section>
  );
}

function groupByDay(slots: SlotData[], locale: Locale): DayGroup[] {
  const groups = new Map<string, SlotData[]>();

  for (const slot of slots) {
    const date = new Date(slot.startsAt);
    const dateKey = date.toISOString().split('T')[0]!;
    const existing = groups.get(dateKey);
    if (existing) {
      existing.push(slot);
    } else {
      groups.set(dateKey, [slot]);
    }
  }

  return Array.from(groups.entries()).map(([dateKey, daySlots]) => ({
    dateKey,
    label: formatDayShort(daySlots[0]!.startsAt, locale),
    slots: daySlots.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
  }));
}
