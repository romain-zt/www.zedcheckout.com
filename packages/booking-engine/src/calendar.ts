/**
 * ICS and calendar URL generation. Pure functions, zero deps.
 */

interface CalendarEvent {
  id: string;
  serviceName: string;
  practitionerName: string | null;
  startsAt: Date;
  endsAt: Date;
  location: string;
  description: string;
}

export function generateICS(event: CalendarEvent): string {
  const uid = `${event.id}@zedslot`;
  const dtstart = formatICSDate(event.startsAt);
  const dtend = formatICSDate(event.endsAt);
  const summary = event.practitionerName
    ? `${event.serviceName} with ${event.practitionerName}`
    : event.serviceName;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//zedslot//booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICS(summary)}`,
    `LOCATION:${escapeICS(event.location)}`,
    `DESCRIPTION:${escapeICS(event.description)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const summary = event.practitionerName
    ? `${event.serviceName} with ${event.practitionerName}`
    : event.serviceName;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    dates: `${formatGoogleDate(event.startsAt)}/${formatGoogleDate(event.endsAt)}`,
    location: event.location,
    details: event.description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function generateAppleCalendarUrl(event: CalendarEvent): string {
  const summary = event.practitionerName
    ? `${event.serviceName} with ${event.practitionerName}`
    : event.serviceName;

  const params = new URLSearchParams({
    title: summary,
    startdt: event.startsAt.toISOString(),
    enddt: event.endsAt.toISOString(),
    location: event.location,
    description: event.description,
  });

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(generateICS(event))}`;
}

function formatICSDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function formatGoogleDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function escapeICS(text: string): string {
  return text.replace(/[\\;,\n]/g, (c) => {
    if (c === '\n') return '\\n';
    return `\\${c}`;
  });
}
