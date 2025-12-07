import { Analytics } from "@vercel/analytics/next"
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import { Inter } from 'next/font/google';
import ClarityAnalytics from '@/components/ClarityAnalytics';

import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const meta = messages.meta as any;

  return {
    metadataBase: new URL('https://www.zedcheckout.com'),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords || 'Shopify, checkout, conversion, e-commerce, optimization',
    authors: [{ name: 'Zedtech' }],
    creator: 'Zedtech',
    publisher: 'Zedtech',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: locale,
      url: `/${locale}`,
      siteName: 'Zedtech',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'fr-FR': '/fr-FR',
        'en-EN': '/en-EN',
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
    manifest: '/manifest.json',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Zedtech',
    url: 'https://www.zedcheckout.com',
    logo: 'https://www.zedcheckout.com/icon.png',
    description: messages.meta?.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['French', 'English'],
    },
  };

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics & Ads Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GT-MBLB23X4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GT-MBLB23X4');
            gtag('config', 'AW-17670223006');
          `}
        </Script>
        
        <NextIntlClientProvider messages={messages}>
          <ClarityAnalytics />
          {children}
          <Analytics /> 
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
