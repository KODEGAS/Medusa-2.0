import { useState } from "react"; // 1. Import useState

import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { TimelineSection } from "@/components/TimelineSection";
import { PartnersSection } from "@/components/PartnersSection";
import { ContactUsSection } from "@/components/ContactUsSection";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Footer } from "@/components/Footer";
import PrizePoolSection from "@/components/PrizePoolSection";
import { CtfChallenge } from "@/components/CTFChallenge";
import { PreviousEventsSection } from "@/components/PreviousEventsSection";
import { MedusaShowcase } from "@/components/MedusaShowcase";


const Index = () => {
  // 3. Add state to track if the challenge is solved
  const [isChallengeSolved, setIsChallengeSolved] = useState(false);

  // 4. Create the function that the child component will call on success
  const handleChallengeSuccess = () => {
    setIsChallengeSolved(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <div id="about"><AboutSection /></div>
        <div id="timeline"><TimelineSection /></div>
        <div id="prizes"><PrizePoolSection /></div>
        <div id="previous-events"><PreviousEventsSection /></div>
        <div id="medusa"><MedusaShowcase /></div>
        <div id="partners"><PartnersSection /></div>
        <div id="contact"><ContactUsSection /></div>

        {/* 5. This is the conditional rendering logic */}
        <div id="register">
          {isChallengeSolved ? (
            // If the challenge is solved, show the real registration form
            <RegistrationForm />
          ) : (
            // Otherwise, show the challenge and pass the success handler to it
            <CtfChallenge onSuccess={handleChallengeSuccess} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;