import { describe, it, expect } from 'vitest';
import { generateICS, generateGoogleCalendarUrl } from '../src/calendar.js';

const event = {
  id: 'booking-123',
  serviceName: 'Drainage',
  practitionerName: 'Oriane',
  startsAt: new Date('2026-06-01T13:00:00Z'),
  endsAt: new Date('2026-06-01T14:00:00Z'),
  location: 'Little Biceps, Paris',
  description: 'Your booking at Little Biceps',
};

describe('generateICS', () => {
  it('produces valid ICS structure', () => {
    const ics = generateICS(event);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
    expect(ics).toContain('booking-123@zedslot');
    expect(ics).toContain('Drainage with Oriane');
    expect(ics).toContain('Little Biceps');
  });

  it('handles null practitioner', () => {
    const ics = generateICS({ ...event, practitionerName: null });
    expect(ics).toContain('SUMMARY:Drainage');
    expect(ics).not.toContain('with');
  });
});

describe('generateGoogleCalendarUrl', () => {
  it('produces a valid Google Calendar URL', () => {
    const url = generateGoogleCalendarUrl(event);
    expect(url).toContain('calendar.google.com/calendar/render');
    expect(url).toContain('Drainage+with+Oriane');
  });
});
