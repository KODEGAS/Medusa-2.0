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

// Loading component
const PageLoader = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.85)' }}>
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
                <Route path="*" element={<NotFound />} />
              </Routes>
          </BrowserRouter>
        </Suspense>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
