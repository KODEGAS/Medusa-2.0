import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { AboutSection } from "@/components/AboutSection";
import { TimelineSection } from "@/components/TimelineSection";
import { PartnersSection } from "@/components/PartnersSection";
import { ContactUsSection } from "@/components/ContactUsSection";
import { Footer } from "@/components/Footer";
import PrizePoolSection from "@/components/PrizePoolSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="pt-16">
        <HeroSection />
        <div id="about"><AboutSection /></div>
        <div id="timeline"><TimelineSection /></div>
        <div id="prizes"><PrizePoolSection /></div>
        <div id="partners"><PartnersSection /></div>
        <div id="contact"><ContactUsSection /></div>
        <div id="register" className="flex justify-center py-8">
          <Link to="/register">
            <Button>Register Now</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;