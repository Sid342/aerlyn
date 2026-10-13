import Shell from './Shell.jsx';
import Hero from '../features/marketing/Hero.jsx';
import WhatItDoes from '../features/marketing/WhatItDoes.jsx';
import HowItWorks from '../features/marketing/HowItWorks.jsx';
import Proof from '../features/marketing/Proof.jsx';
import Faq from '../features/marketing/Faq.jsx';
import ContactCTA from '../features/marketing/ContactCTA.jsx';
import Planner from '../features/houseExplorer/Planner.jsx';

export default function LandingPage() {
  return (
    <Shell>
      <Hero />
      <Planner />
      <WhatItDoes />
      <HowItWorks />
      <Proof />
      <Faq />
      <ContactCTA />
    </Shell>
  );
}
