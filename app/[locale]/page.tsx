import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ZedHero from '@/components/ZedHero';
import ZedProblem from '@/components/ZedProblem';
import ZedSolution from '@/components/ZedSolution';
import ZedFilter from '@/components/ZedFilter';
import ZedProcess from '@/components/ZedProcess';
import ZedFAQ from '@/components/ZedFAQ';
import ZedFinalCTA from '@/components/ZedFinalCTA';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <ZedHero />
        <ZedProblem />
        <ZedSolution />
        <ZedFilter />
        <ZedProcess />
        <ZedFAQ />
        <ZedFinalCTA />
        <Footer />
      </main>
    </>
  );
}

