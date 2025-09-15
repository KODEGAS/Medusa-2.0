
import { Suspense, lazy } from "react";
import { useInView } from "react-intersection-observer";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { Footer } from "@/components/Footer";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const TimelineSection = lazy(() => import("@/components/TimelineSection"));
const PrizePoolSection = lazy(() => import("@/components/PrizePoolSection"));
const PreviousEventsSection = lazy(() => import("@/components/PreviousEventsSection"));
const MedusaShowcase = lazy(() => import("@/components/MedusaShowcase"));
const PartnersSection = lazy(() => import("@/components/PartnersSection"));
const ContactUsSection = lazy(() => import("@/components/ContactUsSection"));

function VirtualSection({ children, rootMargin = "200px 0px" }) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin });
  return <div ref={ref}>{inView ? children : null}</div>;
}


const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <HeroSection />
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <div id="about"><VirtualSection><AboutSection /></VirtualSection></div>
          <div id="timeline"><VirtualSection><TimelineSection /></VirtualSection></div>
          <VirtualSection><PrizePoolSection /></VirtualSection>
          <VirtualSection><PreviousEventsSection /></VirtualSection>
          <VirtualSection><MedusaShowcase /></VirtualSection>
          <div id="contact"><VirtualSection><ContactUsSection /></VirtualSection></div>
        </Suspense>
        <div id="register" className="flex justify-center py-8">
          {/* Registration CTA or form can go here */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;