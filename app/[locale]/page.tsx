import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ZedHero from '@/components/ZedHero';
import WhyStay from '@/components/WhyStay';
import ComparisonTable from '@/components/ComparisonTable';
import ZedProblem from '@/components/ZedProblem';
import ZedSolution from '@/components/ZedSolution';
import ForWho from '@/components/ForWho';
import ZedFilter from '@/components/ZedFilter';
import ZedProcess from '@/components/ZedProcess';
import ZedFAQ from '@/components/ZedFAQ';
import ZedFinalCTA from '@/components/ZedFinalCTA';
import ChatWidgetAI from '@/components/ChatWidgetAI';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <ZedHero />
        <WhyStay />
        <ComparisonTable />
        <ZedProblem />
        <ZedSolution />
        <ForWho />
        <ZedFilter />
        <ZedProcess />
        <ZedFAQ />
        <ZedFinalCTA />
        <Footer />
        <ChatWidgetAI />
      </main>
    </>
  );
}

