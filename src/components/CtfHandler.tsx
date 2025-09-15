import { useEffect } from "react";
import { markCtfCompleted } from "@/lib/registrationStorage";

interface CtfHandlerProps {
  onCtfCompleted?: () => void;
}

export const CtfHandler = ({ onCtfCompleted }: CtfHandlerProps) => {
  useEffect(() => {
    // Check if user is coming from CTF challenge
    const urlParams = new URLSearchParams(window.location.search);
    const fromCtf = urlParams.get('from_ctf');
    
    // Also check for referrer from CTF site
    const referrer = document.referrer;
    const isFromCtfSite = referrer.includes('medusa-main-0f96d0a.azurewebsites.net');
    
    if (fromCtf === 'true' || isFromCtfSite) {
      // Mark CTF as completed
      markCtfCompleted();
      
      // Clean up URL parameters
      if (fromCtf) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
      
      // Notify parent component if callback provided
      if (onCtfCompleted) {
        onCtfCompleted();
      }
    }
  }, [onCtfCompleted]);

  return null; // This component doesn't render anything
};