import {
  Column,
  Heading,
  Hr,
  Row,
  Section,
  Text,
} from '@react-email/components';
import type { BookingCancellationProps } from './types';
import { getCancellationCopy } from './copy';
import { EmailLayout } from './email-layout';

export function BookingCancellationEmail(props: BookingCancellationProps) {
  const {
    customerName,
    serviceName,
    dateTime,
    refundBreakdown,
    locale,
    branding,
  } = props;

  const t = getCancellationCopy(locale);
  const totalRefund = refundBreakdown.toCard + refundBreakdown.toPack + refundBreakdown.toGiftCard;
  const hasRefund = totalRefund > 0;

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
        <Text style={introStyle}>{t.intro}</Text>

        <Section style={detailsCardStyle}>
          <Row style={detailRowStyle}>
            <Column style={detailLabelStyle}>{t.serviceLabel}</Column>
            <Column style={detailValueStyle}>{serviceName}</Column>
          </Row>
          <Row style={detailRowStyle}>
            <Column style={detailLabelStyle}>{t.dateTimeLabel}</Column>
            <Column style={detailValueStyle}>{dateTime}</Column>
          </Row>
        </Section>

        <Hr style={hrStyle} />

        <Heading as="h2" style={refundHeadingStyle}>
          {t.refundHeading}
        </Heading>

        {hasRefund ? (
          <Section style={refundCardStyle}>
            {refundBreakdown.toCard > 0 && (
              <RefundRow label={t.toCardLabel} amount={refundBreakdown.toCard} />
            )}
            {refundBreakdown.toPack > 0 && (
              <RefundRow label={t.toPackLabel} amount={refundBreakdown.toPack} />
            )}
            {refundBreakdown.toGiftCard > 0 && (
              <RefundRow label={t.toGiftCardLabel} amount={refundBreakdown.toGiftCard} />
            )}
            <Hr style={refundDividerStyle} />
            <Row>
              <Column style={totalLabelStyle}>{t.totalLabel}</Column>
              <Column style={totalValueStyle}>{formatCents(totalRefund)}</Column>
            </Row>
          </Section>
        ) : (
          <Text style={noRefundStyle}>{t.noRefund}</Text>
        )}
      </Section>
    </EmailLayout>
  );
}

function RefundRow({ label, amount }: { label: string; amount: number }) {
  return (
    <Row style={refundRowStyle}>
      <Column style={refundLabelStyle}>{label}</Column>
      <Column style={refundValueStyle}>{formatCents(amount)}</Column>
    </Row>
  );
}

function formatCents(cents: number): string {
  return `${(cents / 100).toFixed(2)} €`;
}

export function getCancellationSubject(serviceName: string, locale: 'fr' | 'en') {
  return getCancellationCopy(locale).subject(serviceName);
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

const hrStyle: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '20px 0',
};

const refundHeadingStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  color: '#27272a',
  margin: '0 0 12px 0',
};

const refundCardStyle: React.CSSProperties = {
  backgroundColor: '#fafafa',
  borderRadius: '6px',
  padding: '16px',
};

const refundRowStyle: React.CSSProperties = {
  marginBottom: '8px',
};

const refundLabelStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#52525b',
  verticalAlign: 'top',
  paddingBottom: '8px',
};

const refundValueStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#27272a',
  fontWeight: 600,
  textAlign: 'right' as const,
  verticalAlign: 'top',
  paddingBottom: '8px',
};

const refundDividerStyle: React.CSSProperties = {
  borderColor: '#e4e4e7',
  margin: '8px 0',
};

const totalLabelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#27272a',
  verticalAlign: 'top',
};

const totalValueStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#27272a',
  textAlign: 'right' as const,
  verticalAlign: 'top',
};

const noRefundStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#71717a',
  fontStyle: 'italic',
};
