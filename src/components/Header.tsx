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
      // List of IP detection services to try in order
      const ipServices = [
        'https://api.ipify.org?format=json',
        'https://api64.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://ipinfo.io/json',
        'https://api.my-ip.io/ip.json',
        'https://ip-api.com/json/',
        'https://httpbin.org/ip'
      ];

      for (const service of ipServices) {
        try {
          console.log(`Trying IP service: ${service}`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(service, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          console.log(`IP service response:`, data);
          
          // Different services return IP in different formats
          let ip = '';
          if (data.ip) ip = data.ip;
          else if (data.origin) ip = data.origin; // httpbin format
          else if (data.query) ip = data.query; // ip-api format
          else if (typeof data === 'string') ip = data;
          
          if (ip) {
            console.log(`Successfully fetched IP: ${ip}`);
            setUserIP(ip);
            return; // Success, exit the loop
          }
        } catch (error) {
          console.warn(`Failed to fetch IP from ${service}:`, error);
          continue; // Try next service
        }
      }
      
      // If all services fail, try to get approximate location info
      try {
        console.log('All IP services failed, trying browser geolocation...');
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserIP(`~${position.coords.latitude.toFixed(2)},${position.coords.longitude.toFixed(2)}`);
            },
            (error) => {
              console.warn('Geolocation failed:', error);
              setUserIP(getDeviceInfo());
            },
            { timeout: 3000 }
          );
        } else {
          setUserIP(getDeviceInfo());
        }
      } catch (error) {
        console.error('All IP detection methods failed:', error);
        setUserIP(getDeviceInfo());
      }
    };
    
    // Helper function to get device/browser info as fallback
    const getDeviceInfo = () => {
      const ua = navigator.userAgent;
      if (ua.includes('Mac') || ua.includes('iPhone') || ua.includes('iPad')) {
        return ua.includes('Safari') && !ua.includes('Chrome') ? '🍎 Safari' : '🍎 Mac';
      } else if (ua.includes('Windows')) {
        return '🖥️ Windows';
      } else if (ua.includes('Android')) {
        return '🤖 Android';
      } else if (ua.includes('Linux')) {
        return '🐧 Linux';
      }
      return '🌐 Protected';
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
                        {userIP.includes('🍎') || userIP.includes('🖥️') || userIP.includes('🤖') || userIP.includes('🐧') || userIP.includes('🌐') 
                          ? `Device: ${userIP}` 
                          : userIP.includes('~') 
                            ? `Location: ${userIP}` 
                            : `IP: ${userIP}`
                        }
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-destructive border-destructive text-destructive-foreground font-mono text-sm max-w-xs">
                    <p>Medusa is watching you...</p>
                    {userIP.includes('🍎') || userIP.includes('🖥️') || userIP.includes('🤖') || userIP.includes('🐧') || userIP.includes('🌐') ? (
                      <p className="text-xs mt-1 opacity-80">Privacy settings detected</p>
                    ) : userIP.includes('~') ? (
                      <p className="text-xs mt-1 opacity-80">Approximate location</p>
                    ) : (
                      <p className="text-xs mt-1 opacity-80">Network detected</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button variant="cyber" size="sm" onClick={handleRegisterClick}>
              {shouldRedirectToCtf() 
                ? "Register Now" 
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