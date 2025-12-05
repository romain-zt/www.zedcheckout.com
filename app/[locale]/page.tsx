import { useTranslations } from 'next-intl';
import Hero from '@/components/Hero';
import Qualification from '@/components/Qualification';
import ArchitectureDual from '@/components/ArchitectureDual';
import EconomicJustification from '@/components/EconomicJustification';
import Choices from '@/components/Choices';
import Notice from '@/components/Notice';
import Story from '@/components/Story';
import MarketMonopoly from '@/components/MarketMonopoly';
import SocialProof from '@/components/SocialProof';
import Process from '@/components/Process';
import ROICalculator from '@/components/ROICalculator';
import Offers from '@/components/Offers';
import Waitlist from '@/components/Waitlist';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main>
      <div className="alert-bar">
        <AlertBar />
      </div>
      <Hero />
      <Qualification />
      <ArchitectureDual />
      <EconomicJustification />
      <Choices />
      <Notice />
      <Story />
      <MarketMonopoly />
      {/* <SocialProof /> */}
      <Process />
      <ROICalculator />
      <Offers />
      <Waitlist pageSource="main" />
      <Footer />
    </main>
  );
}

function AlertBar() {
  const t = useTranslations('alert');
  return (
    <>
      {t('text')} <strong>{t('highlight')}</strong>
    </>
  );
}
