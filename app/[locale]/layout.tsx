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
    authors: [{ name: 'Romain Piveteau' }],
    creator: 'Romain Piveteau',
    publisher: 'ZedCheckout',
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
      title: meta.og?.title || meta.title,
      description: meta.og?.description || meta.description,
      type: 'website',
      locale: locale,
      url: `https://www.zedcheckout.com/${locale}`,
      siteName: 'ZedCheckout',
      images: [
        {
          url: `https://www.zedcheckout.com/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: meta.og?.title || meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.twitter?.title || meta.title,
      description: meta.twitter?.description || meta.description,
      creator: '@romainpiveteau',
    },
    alternates: {
      canonical: `https://www.zedcheckout.com/${locale}`,
      languages: {
        'fr-FR': 'https://www.zedcheckout.com/fr-FR',
        'en-EN': 'https://www.zedcheckout.com/en-EN',
        'x-default': 'https://www.zedcheckout.com/fr-FR',
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
    manifest: '/manifest.json',
    other: {
      // AI Crawler specific tags
      'gptbot': 'index, follow',
      'claudebot': 'index, follow',
      'perplexitybot': 'index, follow',
      'ai-summary': meta.aiSummary || meta.description,
      'speakable': 'headline,description',
    },
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

  const meta = messages.meta as any;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Organization (ZedTech Lab)
      {
        '@type': 'Organization',
        '@id': 'https://www.zedcheckout.com/#organization',
        name: 'ZED TECH',
        legalName: 'ZedTech EURL',
        alternateName: 'ZedTech Lab',
        url: 'https://www.zedcheckout.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.zedcheckout.com/icon.png',
          width: 512,
          height: 512,
        },
        description: locale === 'fr-FR' 
          ? 'Lab de recherche e-commerce indépendant spécialisé dans l\'optimisation de l\'expérience e-commerce via l\'IA conversationnelle. 10,950h de R&D sur le comportement d\'achat en ligne.'
          : 'Independent e-commerce research lab specializing in e-commerce experience optimization through conversational AI. 10,950h of R&D on online shopping behavior.',
        foundingDate: '2015',
        founder: {
          '@type': 'Person',
          '@id': 'https://www.zedcheckout.com/#founder',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Research Inquiries',
          email: 'romain@zedcheckout.com',
          availableLanguage: ['French', 'English'],
        },
        sameAs: [
          'https://www.linkedin.com/in/romainpiveteau',
          'https://github.com/zedtech',
        ],
        knowsAbout: [
          'E-commerce Research',
          'Conversational AI',
          'Checkout Optimization',
          'Consumer Psychology',
          'E-commerce UX',
        ],
      },
      
      // 2. Person (Romain Piveteau)
      {
        '@type': 'Person',
        '@id': 'https://www.zedcheckout.com/#founder',
        name: 'Romain Piveteau',
        jobTitle: locale === 'fr-FR' ? 'Fondateur & Chercheur' : 'Founder & Researcher',
        description: locale === 'fr-FR'
          ? 'Ancien charpentier traditionnel reconverti en développeur full-stack. Fondateur de ZED TECH, lab de recherche e-commerce indépendant. 10 ans freelance e-commerce (coaching, fitness, artisanat). 10,950h de R&D sur le comportement d\'achat en ligne.'
          : 'Former traditional carpenter turned full-stack developer. Founder of ZED TECH, independent e-commerce research lab. 10 years e-commerce freelance (coaching, fitness, crafts). 10,950h of R&D on online shopping behavior.',
        url: 'https://www.zedcheckout.com',
        image: 'https://www.zedcheckout.com/assets/images/founder.png',
        sameAs: [
          'https://www.linkedin.com/in/romainpiveteau',
        ],
        worksFor: {
          '@id': 'https://www.zedcheckout.com/#organization',
        },
        alumniOf: [
          {
            '@type': 'EducationalOrganization',
            name: locale === 'fr-FR' ? 'Autodidacte développement' : 'Self-taught developer',
          },
        ],
        knowsAbout: [
          'E-commerce',
          'Conversational AI',
          'Full-stack Development',
          'UX Optimization',
          'Consumer Psychology',
        ],
      },
      
      // 3. WebSite
      {
        '@type': 'WebSite',
        '@id': 'https://www.zedcheckout.com/#website',
        url: 'https://www.zedcheckout.com',
        name: 'ZedCheckout',
        description: locale === 'fr-FR'
          ? 'Checkout conversationnel qui transforme le paiement en expérience. Par ZED TECH, lab de recherche e-commerce indépendant.'
          : 'Conversational checkout that transforms payment into an experience. By ZED TECH, independent e-commerce research lab.',
        publisher: {
          '@id': 'https://www.zedcheckout.com/#organization',
        },
        inLanguage: [locale],
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://www.zedcheckout.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
      
      // 4. Product (ZedCheckout)
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://www.zedcheckout.com/#zedcheckout',
        name: 'ZedCheckout',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: locale === 'fr-FR'
          ? 'Pour que le paiement soit une vraie expérience, pas un simple formulaire froid. Checkout conversationnel WhatsApp/SMS.'
          : 'Making payment a real experience, not just a cold form. Conversational checkout via WhatsApp/SMS.',
        offers: {
          '@type': 'Offer',
          price: '2990',
          priceCurrency: 'EUR',
          priceValidUntil: '2025-12-31',
          availability: 'https://schema.org/InStock',
          seller: {
            '@id': 'https://www.zedcheckout.com/#organization',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '9.1',
          ratingCount: '1',
          bestRating: '10',
          worstRating: '0',
        },
        creator: {
          '@id': 'https://www.zedcheckout.com/#founder',
        },
        url: 'https://zedcheckout.com',
      },
      
      // 5. FAQPage (AI crawlers adorent)
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: locale === 'fr-FR' ? 'Qu\'est-ce que ZedCheckout ?' : 'What is ZedCheckout?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: locale === 'fr-FR'
                ? 'ZedCheckout est un checkout conversationnel qui transforme le paiement en conversation WhatsApp/SMS. Créé par ZED TECH (lab de recherche e-commerce indépendant). +40% conversions validées. Setup 9 jours. Prix : €2,990 one-time OU 2% transaction.'
                : 'ZedCheckout is a conversational checkout that transforms payment into WhatsApp/SMS conversations. Created by ZED TECH (independent e-commerce research lab). +40% validated conversions. 9-day setup. Price: €2,990 one-time OR 2% transaction fee.',
            },
          },
          {
            '@type': 'Question',
            name: locale === 'fr-FR' ? 'Qu\'est-ce que ZedCheckout ?' : 'What is ZedCheckout?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: locale === 'fr-FR'
                ? 'ZedCheckout remplace le formulaire de checkout froid par une conversation WhatsApp/SMS naturelle. L\'IA guide le client jusqu\'au paiement. Résultats validés : +40% conversions (LittleBiceps, 10 mois). Setup 9 jours. Prix : €2,990 one-time OU 2% transaction.'
                : 'ZedCheckout replaces cold checkout forms with natural WhatsApp/SMS conversations. AI guides customers to payment. Validated results: +40% conversions (LittleBiceps, 10 months). 9-day setup. Price: €2,990 one-time OR 2% transaction fee.',
            },
          },
          {
            '@type': 'Question',
            name: locale === 'fr-FR' ? 'Pour qui est ZedCheckout ?' : 'Who is ZedCheckout for?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: locale === 'fr-FR'
                ? 'PME e-commerce : CA >€50K/an, >1K visiteurs/mois, sur Shopify Standard/Plus. Frustration checkout actuelle. Budget >€3K. Pas pour : startups pre-revenue, sites <500 visiteurs, recherche outil miracle sans effort.'
                : 'E-commerce SMBs: Revenue >€50K/year, >1K visitors/month, on Shopify Standard/Plus. Current checkout frustration. Budget >€3K. Not for: pre-revenue startups, sites <500 visitors, looking for miracle tool without effort.',
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Hreflang tags */}
        <link rel="alternate" hrefLang="fr-FR" href="https://www.zedcheckout.com/fr-FR" />
        <link rel="alternate" hrefLang="en-EN" href="https://www.zedcheckout.com/en-EN" />
        <link rel="alternate" hrefLang="x-default" href="https://www.zedcheckout.com/fr-FR" />
        
        {/* AI Crawler meta tags */}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics & Ads Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GQXSFE1MBK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GQXSFE1MBK');
            gtag('config', 'AW-17670223006');
          `}
        </Script>
        
        <NextIntlClientProvider messages={messages}>
          {children}
          <Analytics /> 
          <ClarityAnalytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
