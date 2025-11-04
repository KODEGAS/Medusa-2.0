import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, useState, useEffect, Suspense } from "react";
import poster from "./assets/poster.webp";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RegistrationPage = lazy(() => import("./pages/RegistrationPage"));
const FlagSubmissionPage = lazy(() => import("./pages/FlagSubmissionPage"));
const Round1Page = lazy(() => import("./pages/Round1Page"));
const Round1Auth = lazy(() => import("./pages/Round1Auth"));

// Social Media Redirect Components
const LinkedInRedirect = () => {
  window.location.href = "https://www.linkedin.com/company/medusaecs/"; 
  return null;
};

const FacebookRedirect = () => {
  window.location.href = "https://www.facebook.com/share/16wRiSfKkW/?mibextid=wwXIfr"; 
  return null;
};

const WhatsAppRedirect = () => {
  window.location.href = "https://whatsapp.com/channel/0029Vb6vhSBKrWQv83bWfR3q/94726677555";
  return null;
};

const DelegateBookRedirect = () => {
  window.location.href = "https://drive.google.com/file/d/1wJ7caV0KBz3yEniIXMDS388mtdBoMhSF/view";
  return null;
};

const AwarenessSessionRedirect = () => {
  window.location.href = "https://zoom.us/j/96715243562?pwd=ap9xBgK9YPyGBsfz0raf7Chehu1HZF.1";
  return null;
};


// Loading component
const PageLoader = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-[70]" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto" />
          <p className="text-muted-foreground font-mono mt-6">Loading...</p>
        </div>
);

const queryClient = new QueryClient();


const App = () => {
  const [posterLoaded, setPosterLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = poster;
    if (img.complete) {
      setPosterLoaded(true);
    } else {
      img.onload = () => setPosterLoaded(true);
    }
  }, []);

  if (!posterLoaded) {
    return <PageLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={<PageLoader />}>
          <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/7458c148293e2f70830e369ace8d3b9c" element={<RegistrationPage />} />
                <Route path="/submit-flag" element={<FlagSubmissionPage />} />
                <Route path="/round1-auth" element={<Round1Auth />} />
                <Route path="/round1" element={<Round1Page />} />
                <Route path="/linkedin" element={<LinkedInRedirect />} />
                <Route path="/facebook" element={<FacebookRedirect />} />
                <Route path="/whatsapp" element={<WhatsAppRedirect />} />
                <Route path="/awareness-session" element={<AwarenessSessionRedirect />} />
                
                {/* Delegate Book Redirect */}
                <Route path="/delegate-book" element={<DelegateBookRedirect />} />
                <Route path="/rules" element={<DelegateBookRedirect />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
          </BrowserRouter>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
