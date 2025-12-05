import { getMessages } from 'next-intl/server';
import DevHero from '@/components/DevHero';
import DevFeatures from '@/components/DevFeatures';
import DevPricing from '@/components/DevPricing';
import DevTimeline from '@/components/DevTimeline';
import Waitlist from '@/components/Waitlist';
import Footer from '@/components/Footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const devMeta = messages.devMeta as any;

  return {
    title: devMeta?.title || 'Shopify Checkout Boilerplate - Production-Ready in 30 Minutes',
    description: devMeta?.description || 'Production-ready boilerplate with Stripe, A/B testing, and 4 design templates. Own the code. Ship faster.',
    keywords: devMeta?.keywords || 'Shopify boilerplate, custom checkout, developer tools, Shopify development, checkout template',
    authors: [{ name: 'Zedtech' }],
    creator: 'Zedtech',
    publisher: 'Zedtech',
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
      title: devMeta?.title || 'Shopify Checkout Boilerplate - Production-Ready in 30 Minutes',
      description: devMeta?.description || 'Production-ready boilerplate with Stripe, A/B testing, and 4 design templates. Own the code. Ship faster.',
      type: 'website',
      locale: locale,
      url: `/${locale}/developers`,
      siteName: 'Zedtech',
    },
    twitter: {
      card: 'summary_large_image',
      title: devMeta?.title || 'Shopify Checkout Boilerplate - Production-Ready in 30 Minutes',
      description: devMeta?.description || 'Production-ready boilerplate with Stripe, A/B testing, and 4 design templates. Own the code. Ship faster.',
    },
    alternates: {
      canonical: `/${locale}/developers`,
      languages: {
        'fr-FR': '/fr-FR/developers',
        'en-EN': '/en-EN/developers',
      },
    },
  };
}

export default async function DevelopersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const devMeta = messages.devMeta as any;
  const devPricing = messages.devPricing as any;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Shopify Checkout Boilerplate',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '497',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/PreOrder',
      priceValidUntil: '2025-12-21',
      description: devPricing?.subtitle || 'Pre-sale pricing for early adopters',
    },
    description: devMeta?.description || 'Production-ready boilerplate with Stripe, A/B testing, and 4 design templates. Own the code. Ship faster.',
    url: `https://www.zedcheckout.com/${locale}/developers`,
    author: {
      '@type': 'Organization',
      name: 'Zedtech',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '1',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <DevHero />
        <DevFeatures />
        <DevPricing />
        <DevTimeline />
        <Waitlist pageSource="developers" variant="developer" />
        <Footer />
      </main>
    </>
  );
}
