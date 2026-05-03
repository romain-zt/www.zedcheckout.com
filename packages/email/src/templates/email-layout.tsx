import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { Branding } from './types.js';

interface EmailLayoutProps {
  preview: string;
  branding: Branding;
  footer: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, branding, footer, children }: EmailLayoutProps) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Img
              src={branding.logoUrl}
              alt="Logo"
              width={140}
              height={40}
              style={logoStyle}
            />
          </Section>
          {children}
          <Section style={footerSectionStyle}>
            <Text style={footerTextStyle}>{footer}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#f4f4f5',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
};

const headerStyle: React.CSSProperties = {
  padding: '24px 24px 0 24px',
  textAlign: 'center' as const,
};

const logoStyle: React.CSSProperties = {
  margin: '0 auto',
};

const footerSectionStyle: React.CSSProperties = {
  padding: '16px 24px 24px 24px',
  borderTop: '1px solid #e4e4e7',
};

const footerTextStyle: React.CSSProperties = {
  color: '#71717a',
  fontSize: '13px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: 0,
};
