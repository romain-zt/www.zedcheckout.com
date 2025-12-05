import Hero from '@/components/Hero';
import Qualification from '@/components/Qualification';
import Story from '@/components/Story';
import Offers from '@/components/Offers';
import Waitlist from '@/components/Waitlist';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Qualification />
      <Story />
      <Offers />
      <Waitlist pageSource="main" />
      <Footer />
    </main>
  );
}
