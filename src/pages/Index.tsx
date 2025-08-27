import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { TimelineSection } from "@/components/TimelineSection";
import { PartnersSection } from "@/components/PartnersSection";
import { ContactUsSection } from "@/components/ContactUsSection";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Footer } from "@/components/Footer";
import PrizePoolSection from "@/components/PrizePoolSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <div id="about"><AboutSection /></div>
        <div id="timeline"><TimelineSection /></div>
        <div id="prizes"><PrizePoolSection /></div>
        <div id="partners"><PartnersSection /></div>
        <div id="contact"><ContactUsSection /></div>
        <div id="register"><RegistrationForm /></div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
