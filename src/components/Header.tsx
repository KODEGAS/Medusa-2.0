import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, Users, Calendar, Award, Phone } from "lucide-react";
import logoWhite from "@/assets/logowhite.png";
import { Link } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "About", href: "#about", icon: Award },
    { name: "Timeline", href: "#timeline", icon: Calendar },
    { name: "Partners", href: "#partners", icon: Users },
    { name: "Contact", href: "#contact", icon: Phone },
    { name: "Register", href: "/register", icon: Zap, isRoute: true },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
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
              item.isRoute ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 group"
                >
                  <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 group"
                >
                  <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                  {item.name}
                </button>
              )
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button variant="cyber" size="sm" asChild>
              <Link to="/register">Join CTF</Link>
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
                item.isRoute ? (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center gap-3 text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 p-2 rounded-lg hover:bg-card"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
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