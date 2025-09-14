import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, Users, Calendar, Award, Phone } from "lucide-react";
import logoWhite from "@/assets/logowhite.png";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Force navigation to be clickable immediately
  useEffect(() => {
    const enableNavigation = () => {
      if (headerRef.current) {
        const buttons = headerRef.current.querySelectorAll('button[data-nav-button]');
        buttons.forEach((button) => {
          const htmlButton = button as HTMLButtonElement;
          htmlButton.style.pointerEvents = 'auto';
          htmlButton.style.zIndex = '10000';
          htmlButton.addEventListener('click', (e) => {
            console.log('Direct event listener clicked:', e.target);
          });
        });
      }
    };

    // Try multiple timing approaches
    enableNavigation();
    setTimeout(enableNavigation, 100);
    setTimeout(enableNavigation, 500);
    setTimeout(enableNavigation, 1000);

    return () => {
      if (headerRef.current) {
        const buttons = headerRef.current.querySelectorAll('button[data-nav-button]');
        buttons.forEach((button) => {
          button.removeEventListener('click', () => {});
        });
      }
    };
  }, []);

  const navItems = [
    { name: "About", href: "#about", icon: Award },
    { name: "Timeline", href: "#timeline", icon: Calendar },
    { name: "Partners", href: "#partners", icon: Users },
    { name: "Contact", href: "#contact", icon: Phone },
    { name: "Register", href: "https://medusa-ctf-production.azurewebsites.net/", icon: Zap, isExternal: true },
  ];

  const scrollToSection = (href: string) => {
    console.log('Navigation clicked:', href); // Debug log
    const element = document.querySelector(href);
    if (element) {
      console.log('Element found, scrolling to:', element); // Debug log
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.log('Element not found for:', href); // Debug log
    }
    setIsMenuOpen(false);
  };

  return (
    <header 
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[9999] bg-red-500/50 backdrop-blur-md border-b-2 border-red-500" 
      style={{ pointerEvents: 'auto' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logoWhite} alt="Medusa Logo" className="w-24 h-24 object-contain" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" style={{ pointerEvents: 'auto' }}>
            {navItems.map((item) => (
              item.isExternal ? (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 group"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                >
                  <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                  {item.name}
                </a>
              ) : (
                <button
                  key={item.name}
                  data-nav-button="true"
                  onClick={() => scrollToSection(item.href)}
                  onMouseDown={() => console.log('Mouse down on:', item.name)}
                  onMouseUp={() => console.log('Mouse up on:', item.name)}
                  className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 group"
                  style={{ pointerEvents: 'auto', cursor: 'pointer', backgroundColor: 'yellow', padding: '8px' }}
                >
                  <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                  {item.name}
                </button>
              )
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block" style={{ pointerEvents: 'auto' }}>
            <Button variant="cyber" size="sm" asChild>
              <a href="https://medusa-ctf-production.azurewebsites.net/" target="_blank" rel="noopener noreferrer">Join CTF</a>
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
                item.isExternal ? (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-card"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </a>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className="flex items-center gap-3 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-card"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </button>
                )
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};