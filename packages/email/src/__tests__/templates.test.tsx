import { describe, it, expect } from 'vitest';
import { render } from '@react-email/render';
import { BookingConfirmationEmail, getConfirmationSubject } from '../templates/booking-confirmation';
import { BookingReminderEmail, getReminderSubject } from '../templates/booking-reminder';
import { BookingCancellationEmail, getCancellationSubject } from '../templates/booking-cancellation';
import type { BookingConfirmationProps, BookingReminderProps, BookingCancellationProps } from '../templates/types';

const baseBranding = { logoUrl: 'https://example.com/logo.png', primaryColor: '#1E2A47' };
const baseCalendarLinks = {
  apple: 'https://example.com/apple',
  google: 'https://example.com/google',
  ics: 'https://example.com/event.ics',
};

const confirmationProps: BookingConfirmationProps = {
  customerName: 'Marie Dupont',
  serviceName: 'Drainage Renata França',
  practitionerName: 'Oriane',
  roomName: 'Salle 1',
  dateTime: 'Lundi 5 mai 2026, 14h00',
  address: '12 Rue des Lilas, 75011 Paris',
  contactInfo: 'contact@littlebiceps.com',
  manageBookingUrl: 'https://book.littlebiceps.com/manage/abc123',
  calendarLinks: baseCalendarLinks,
  policyText: 'Annulation gratuite jusqu\'à 24h avant.',
  locale: 'fr',
  branding: baseBranding,
};

const reminderProps: BookingReminderProps = {
  ...confirmationProps,
  hoursUntil: 24,
  locale: 'fr',
};

const cancellationProps: BookingCancellationProps = {
  customerName: 'Marie Dupont',
  serviceName: 'Drainage Renata França',
  dateTime: 'Lundi 5 mai 2026, 14h00',
  refundBreakdown: { toCard: 5000, toPack: 2000, toGiftCard: 1000 },
  locale: 'fr',
  branding: baseBranding,
};

describe('BookingConfirmationEmail', () => {
  it('renders FR confirmation with key content', async () => {
    const html = await render(<BookingConfirmationEmail {...confirmationProps} />);

    expect(html).toContain('Réservation confirmée');
    expect(html).toContain('Marie Dupont');
    expect(html).toContain('Drainage Renata França');
    expect(html).toContain('Oriane');
    expect(html).toContain('Salle 1');
    expect(html).toContain('Lundi 5 mai 2026, 14h00');
    expect(html).toContain('12 Rue des Lilas');
    expect(html).toContain('Gérer ma réservation');
    expect(html).toContain('Google Calendar');
    expect(html).toContain('Annulation gratuite');
  });

  it('renders EN confirmation with key content', async () => {
    const html = await render(
      <BookingConfirmationEmail {...confirmationProps} locale="en" />
    );

    expect(html).toContain('Booking confirmed');
    expect(html).toContain('Hi Marie Dupont,');
    expect(html).toContain('Manage my booking');
    expect(html).toContain('Cancellation policy');
  });

  it('omits practitioner when null', async () => {
    const html = await render(
      <BookingConfirmationEmail {...confirmationProps} practitionerName={null} />
    );

    expect(html).not.toContain('Praticien');
    expect(html).toContain('Drainage Renata França');
  });

  it('omits room when null', async () => {
    const html = await render(
      <BookingConfirmationEmail {...confirmationProps} roomName={null} />
    );

    expect(html).not.toContain('Salle 1');
  });

  it('uses branding primaryColor in button', async () => {
    const html = await render(<BookingConfirmationEmail {...confirmationProps} />);

    expect(html).toContain('#1E2A47');
  });

  it('generates FR subject', () => {
    expect(getConfirmationSubject('Drainage', 'fr')).toBe('Réservation confirmée — Drainage');
  });

  it('generates EN subject', () => {
    expect(getConfirmationSubject('Drainage', 'en')).toBe('Booking confirmed — Drainage');
  });
});

describe('BookingReminderEmail', () => {
  it('renders FR reminder with hours-until copy', async () => {
    const html = await render(<BookingReminderEmail {...reminderProps} />);

    expect(html).toContain('Votre rendez-vous est demain');
    expect(html).toContain('dans 24h');
    expect(html).toContain('Marie Dupont');
    expect(html).toContain('Drainage Renata França');
  });

  it('renders EN reminder with hours-until copy', async () => {
    const html = await render(
      <BookingReminderEmail {...reminderProps} locale="en" />
    );

    expect(html).toContain('Your appointment is tomorrow');
    expect(html).toContain('in 24 hours');
  });

  it('generates FR subject', () => {
    expect(getReminderSubject('Drainage', 'fr')).toBe('Rappel — Drainage demain');
  });

  it('generates EN subject', () => {
    expect(getReminderSubject('Drainage', 'en')).toBe('Reminder — Drainage tomorrow');
  });
});

describe('BookingCancellationEmail', () => {
  it('renders FR cancellation with refund breakdown', async () => {
    const html = await render(<BookingCancellationEmail {...cancellationProps} />);

    expect(html).toContain('Réservation annulée');
    expect(html).toContain('Marie Dupont');
    expect(html).toContain('Drainage Renata França');
    expect(html).toContain('Remboursé sur carte');
    expect(html).toContain('50.00');
    expect(html).toContain('Crédité sur votre Pack');
    expect(html).toContain('20.00');
    expect(html).toContain('Crédité sur carte cadeau');
    expect(html).toContain('10.00');
    expect(html).toContain('80.00');
  });

  it('renders EN cancellation with refund breakdown', async () => {
    const html = await render(
      <BookingCancellationEmail {...cancellationProps} locale="en" />
    );

    expect(html).toContain('Booking cancelled');
    expect(html).toContain('Refund breakdown');
    expect(html).toContain('Refunded to card');
    expect(html).toContain('Credited to your Pack');
    expect(html).toContain('Credited to gift card');
  });

  it('shows no-refund message when all amounts are zero', async () => {
    const html = await render(
      <BookingCancellationEmail
        {...cancellationProps}
        refundBreakdown={{ toCard: 0, toPack: 0, toGiftCard: 0 }}
      />
    );

    expect(html).toContain('Aucun remboursement applicable');
    expect(html).not.toContain('Remboursé sur carte');
  });

  it('shows no-refund EN message when all amounts are zero', async () => {
    const html = await render(
      <BookingCancellationEmail
        {...cancellationProps}
        locale="en"
        refundBreakdown={{ toCard: 0, toPack: 0, toGiftCard: 0 }}
      />
    );

    expect(html).toContain('No refund applicable');
  });

  it('generates FR subject', () => {
    expect(getCancellationSubject('Drainage', 'fr')).toBe('Annulation — Drainage');
  });

  it('generates EN subject', () => {
    expect(getCancellationSubject('Drainage', 'en')).toBe('Cancellation — Drainage');
  });

  it('only shows refund lines with non-zero amounts', async () => {
    const html = await render(
      <BookingCancellationEmail
        {...cancellationProps}
        refundBreakdown={{ toCard: 3000, toPack: 0, toGiftCard: 0 }}
      />
    );

    expect(html).toContain('Remboursé sur carte');
    expect(html).toContain('30.00');
    expect(html).not.toContain('Crédité sur votre Pack');
    expect(html).not.toContain('Crédité sur carte cadeau');
  });
});

describe('renderEmail helper', () => {
  it('returns subject and html string', async () => {
    const { renderEmail } = await import('../render.js');
    const result = await renderEmail(
      <BookingConfirmationEmail {...confirmationProps} />,
      'Test Subject',
    );

    expect(result.subject).toBe('Test Subject');
    expect(result.html).toContain('<!DOCTYPE');
    expect(result.html).toContain('Marie Dupont');
  });
});
