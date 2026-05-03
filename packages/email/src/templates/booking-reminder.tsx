import {
  Button,
  Column,
  Heading,
  Hr,
  Link,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type { BookingReminderProps } from './types';
import { getReminderCopy } from './copy';
import { EmailLayout } from './email-layout';

export function BookingReminderEmail(props: BookingReminderProps) {
  const {
    customerName,
    serviceName,
    practitionerName,
    roomName,
    dateTime,
    address,
    contactInfo,
    manageBookingUrl,
    calendarLinks,
    policyText,
    hoursUntil,
    locale,
    branding,
  } = props;

  const t = getReminderCopy(locale);

  return (
    <EmailLayout
      preview={t.preview(serviceName)}
      branding={branding}
      footer={t.footer}
    >
      <Section style={contentStyle}>
        <Heading as="h1" style={headingStyle(branding.primaryColor)}>
          {t.heading}
        </Heading>
        <Text style={greetingStyle}>{t.greeting(customerName)}</Text>
        <Text style={introStyle}>{t.intro(hoursUntil)}</Text>

        <Section style={detailsCardStyle}>
          <DetailRow label={t.serviceLabel} value={serviceName} />
          {practitionerName && (
            <DetailRow label={t.practitionerLabel} value={practitionerName} />
          )}
          {roomName && (
            <DetailRow label={t.roomLabel} value={roomName} />
          )}
          <DetailRow label={t.dateTimeLabel} value={dateTime} />
          <DetailRow label={t.addressLabel} value={address} />
          <DetailRow label={t.contactLabel} value={contactInfo} />
        </Section>

        <Section style={ctaStyle}>
          <Button
            href={manageBookingUrl}
            style={buttonStyle(branding.primaryColor)}
          >
            {t.manageBooking}
          </Button>
        </Section>

        <Hr style={hrStyle} />

        <Text style={calendarHeadingStyle}>{t.addToCalendar}</Text>
        <Section style={calendarLinksStyle}>
          <Row>
            <Column style={calendarLinkColumnStyle}>
              <Link href={calendarLinks.google} style={calendarLinkStyle(branding.primaryColor)}>
                {t.googleCalendar}
              </Link>
            </Column>
            <Column style={calendarLinkColumnStyle}>
              <Link href={calendarLinks.apple} style={calendarLinkStyle(branding.primaryColor)}>
                {t.appleCalendar}
              </Link>
            </Column>
            <Column style={calendarLinkColumnStyle}>
              <Link href={calendarLinks.ics} style={calendarLinkStyle(branding.primaryColor)}>
                {t.downloadIcs}
              </Link>
            </Column>
          </Row>
        </Section>

        <Hr style={hrStyle} />

        <Text style={policySectionHeadingStyle}>{t.policyHeading}</Text>
        <Text style={policyTextStyle}>{policyText}</Text>
      </Section>
    </EmailLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Row style={detailRowStyle}>
      <Column style={detailLabelStyle}>{label}</Column>
      <Column style={detailValueStyle}>{value}</Column>
    </Row>
  );
}

export function getReminderSubject(serviceName: string, locale: 'fr' | 'en') {
  return getReminderCopy(locale).subject(serviceName);
}

const contentStyle: React.CSSProperties = {
  padding: '24px',
};

const headingStyle = (color: string): React.CSSProperties => ({
  color,
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: '28px',
  margin: '16px 0 8px 0',
});

const greetingStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#27272a',
  margin: '0 0 4px 0',
};

const introStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: '24px',
  color: '#52525b',
  margin: '0 0 20px 0',
};

const detailsCardStyle: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '20px',
};

const detailRowStyle: React.CSSProperties = {
  marginBottom: '8px',
};

const detailLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#71717a',
  fontWeight: 600,
  width: '120px',
  verticalAlign: 'top',
  paddingBottom: '8px',
};

const detailValueStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#27272a',
  verticalAlign: 'top',
  paddingBottom: '8px',
};

const ctaStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const buttonStyle = (color: string): React.CSSProperties => ({
  backgroundColor: color,
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  lineHeight: '20px',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  display: 'inline-block',
});

const hrStyle: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '20px 0',
};

const calendarHeadingStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#52525b',
  margin: '0 0 8px 0',
  textAlign: 'center' as const,
};

const calendarLinksStyle: React.CSSProperties = {
  marginBottom: '8px',
};

const calendarLinkColumnStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  verticalAlign: 'middle',
  padding: '4px',
};

const calendarLinkStyle = (color: string): React.CSSProperties => ({
  color,
  fontSize: '13px',
  textDecoration: 'underline',
});

const policySectionHeadingStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#52525b',
  margin: '0 0 4px 0',
};

const policyTextStyle: React.CSSProperties = {
  fontSize: '13px',
  lineHeight: '20px',
  color: '#71717a',
  margin: 0,
};
