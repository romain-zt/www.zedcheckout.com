'use client';

import { useMemo } from 'react';
import { Card, Button, Badge } from '@zedslot/ui';
import { localizedName, formatDateTime, type Locale } from '@/lib/locale';
import type { ServiceData, ResourceData, SlotData } from './BookingFlow';

interface BookingDetails {
  id: string;
  status: string;
  serviceName: Record<'fr' | 'en', string> | null;
  resourceName: string | null;
  startsAt: string;
  endsAt: string;
}

interface ConfirmationScreenProps {
  bookingDetails: BookingDetails | null;
  service: ServiceData | null;
  resource: ResourceData | null;
  slot: SlotData | null;
  locale: Locale;
}

const labels = {
  fr: {
    title: 'Réservation confirmée !',
    subtitle: 'Vous recevrez un email de confirmation',
    service: 'Soin',
    practitioner: 'Praticien(ne)',
    dateTime: 'Date et heure',
    addToCalendar: 'Ajouter au calendrier',
    googleCalendar: 'Google Calendar',
    appleCalendar: 'Apple Calendar',
    downloadICS: 'Télécharger (.ics)',
    bookAnother: 'Réserver un autre créneau',
  },
  en: {
    title: 'Booking confirmed!',
    subtitle: 'You will receive a confirmation email',
    service: 'Service',
    practitioner: 'Practitioner',
    dateTime: 'Date & time',
    addToCalendar: 'Add to calendar',
    googleCalendar: 'Google Calendar',
    appleCalendar: 'Apple Calendar',
    downloadICS: 'Download (.ics)',
    bookAnother: 'Book another slot',
  },
};

export function ConfirmationScreen({ bookingDetails, service, resource, slot, locale }: ConfirmationScreenProps) {
  const t = labels[locale];

  const serviceName = bookingDetails?.serviceName
    ? localizedName(bookingDetails.serviceName, locale)
    : service
      ? localizedName(service.name, locale)
      : '';

  const practitionerName = bookingDetails?.resourceName ?? resource?.name ?? null;
  const startsAt = bookingDetails?.startsAt ?? slot?.startsAt ?? '';
  const endsAt = bookingDetails?.endsAt ?? slot?.endsAt ?? '';

  const calendarLinks = useMemo(() => {
    if (!startsAt || !endsAt) return null;

    const event = {
      id: bookingDetails?.id ?? 'booking',
      serviceName,
      practitionerName,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
      location: '',
      description: practitionerName
        ? `${serviceName} with ${practitionerName}`
        : serviceName,
    };

    const summary = practitionerName
      ? `${serviceName} with ${practitionerName}`
      : serviceName;

    // Build Google Calendar URL
    const googleStart = new Date(startsAt).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const googleEnd = new Date(endsAt).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const googleParams = new URLSearchParams({
      action: 'TEMPLATE',
      text: summary,
      dates: `${googleStart}/${googleEnd}`,
      details: event.description,
    });
    const googleUrl = `https://calendar.google.com/calendar/render?${googleParams.toString()}`;

    // Build ICS content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//zedslot//booking//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${event.id}@zedslot`,
      `DTSTART:${googleStart}`,
      `DTEND:${googleEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${event.description}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const icsDataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

    return { googleUrl, icsDataUrl };
  }, [startsAt, endsAt, serviceName, practitionerName, bookingDetails?.id]);

  return (
    <section aria-label={t.title} className="flex flex-col gap-4">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold">{t.title}</h2>
        <p className="text-sm text-navy/60">{t.subtitle}</p>
      </div>

      {/* Booking details */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-xs uppercase text-navy/50">{t.service}</p>
            <p className="font-medium">{serviceName}</p>
          </div>
          {practitionerName && (
            <div>
              <p className="text-xs uppercase text-navy/50">{t.practitioner}</p>
              <p className="font-medium">{practitionerName}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase text-navy/50">{t.dateTime}</p>
            <p className="font-medium">{formatDateTime(startsAt, locale)}</p>
          </div>
          <Badge variant="success" className="w-fit">
            {locale === 'fr' ? 'Confirmée' : 'Confirmed'}
          </Badge>
        </div>
      </Card>

      {/* Calendar links */}
      {calendarLinks && (
        <div>
          <p className="mb-2 text-sm font-medium text-navy/70">{t.addToCalendar}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={calendarLinks.googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-navy/10 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-beige"
            >
              {t.googleCalendar}
            </a>
            <a
              href={calendarLinks.icsDataUrl}
              download={`booking-${bookingDetails?.id ?? 'event'}.ics`}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-navy/10 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-beige"
            >
              {t.downloadICS}
            </a>
          </div>
        </div>
      )}

      {/* Book another */}
      <Button
        variant="secondary"
        size="md"
        fullWidth
        onClick={() => window.location.reload()}
      >
        {t.bookAnother}
      </Button>
    </section>
  );
}
