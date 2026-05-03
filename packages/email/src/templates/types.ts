export type Locale = 'fr' | 'en';

export interface Branding {
  logoUrl: string;
  primaryColor: string;
}

export interface CalendarLinks {
  apple: string;
  google: string;
  ics: string;
}

export interface BookingConfirmationProps {
  customerName: string;
  serviceName: string;
  practitionerName: string | null;
  roomName: string | null;
  dateTime: string;
  address: string;
  contactInfo: string;
  manageBookingUrl: string;
  calendarLinks: CalendarLinks;
  policyText: string;
  locale: Locale;
  branding: Branding;
}

export interface BookingReminderProps {
  customerName: string;
  serviceName: string;
  practitionerName: string | null;
  roomName: string | null;
  dateTime: string;
  address: string;
  contactInfo: string;
  manageBookingUrl: string;
  calendarLinks: CalendarLinks;
  policyText: string;
  hoursUntil: number;
  locale: Locale;
  branding: Branding;
}

export interface RefundBreakdown {
  toCard: number;
  toPack: number;
  toGiftCard: number;
}

export interface BookingCancellationProps {
  customerName: string;
  serviceName: string;
  dateTime: string;
  refundBreakdown: RefundBreakdown;
  locale: Locale;
  branding: Branding;
}
