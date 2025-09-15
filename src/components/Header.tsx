import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Menu, X, Users, Calendar, Award, Phone, Wifi } from "lucide-react";
import logoWhite from "@/assets/logowhite.png";
import { hasIncompleteRegistration, shouldRedirectToCtf, getCtfChallengeUrl } from "@/lib/registrationStorage";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userIP, setUserIP] = useState<string>("");

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        console.error('Failed to fetch IP:', error);
        setUserIP("Unable to fetch");
      }
    };
    
    fetchIP();
  }, []);

  const navItems = [
    { name: "About", href: "#about", icon: Award },
    { name: "Timeline", href: "#timeline", icon: Calendar },
    { name: "Partners", href: "#partners", icon: Users },
    { name: "Contact", href: "#contact", icon: Phone },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  const handleRegisterClick = () => {
    // Check if user should be redirected to CTF challenge first
    if (shouldRedirectToCtf()) {
      // First-time visitor - redirect to CTF challenge
      window.location.href = getCtfChallengeUrl();
      return;
    }
    
    // User has completed CTF, proceed to registration
    if (hasIncompleteRegistration()) {
      // User has saved data, navigate to registration page
      window.location.href = "/7458c148293e2f70830e369ace8d3b9c";
    } else {
      // No saved data, navigate to registration page normally
      window.location.href = "/7458c148293e2f70830e369ace8d3b9c";
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logoWhite} alt="Medusa Logo" className="w-24 h-24 object-contain" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 group"
              >
                <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                {item.name}
              </button>
            ))}
          </nav>

          {/* IP Address & CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            {userIP && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1 bg-card/50 rounded-lg border border-border/50 cursor-pointer hover:bg-card/70 transition-colors">
                      <Wifi className="w-4 h-4 text-primary" />
                      <span className="text-xs font-mono text-muted-foreground">
                        IP: {userIP}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-destructive border-destructive text-destructive-foreground font-mono text-sm">
                    <p>Medusa is watching on you...</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="cyber" size="sm" onClick={handleRegisterClick}>
              {shouldRedirectToCtf() 
                ? "Start Challenge" 
                : hasIncompleteRegistration() 
                  ? "Continue Registration" 
                  : "Register Now"
              }
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="flex items-center gap-3 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-card"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};