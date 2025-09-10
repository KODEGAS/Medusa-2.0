import { Shield, Mail, Phone, MapPin, Github, Twitter, Linkedin, ExternalLink, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/people/MEDUSA/61561933005641/" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/medusaecs/" },
    { name: "WhatsApp", icon: MessageCircle, href: "https://whatsapp.com/channel/0029Vb6vhSBKrWQv83bWfR3q/94726677555" },
  ];

  const quickLinks = [
    { name: "About Competition", href: "#about" },
    { name: "Event Timeline", href: "#timeline" },
    { name: "Registration", href: "#register" },
    { name: "Partners", href: "#partners" },
    { name: "Contact Us", href: "#contact" },
  ];

  const contactInfo = [
    { icon: Mail, text: "contact@ecsc-uok.com", href: "mailto:contact@ecsc-uok.com" },

    { icon: Phone, text: "+94 76 30 74 621", href: "tel:+94763074621" },
    { icon: MapPin, text: "University of Kaleniya", href: "kln.ac.lk" },

  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-card border-t border-border relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyber-grid opacity-5" />
      <div className="absolute inset-0 matrix-rain opacity-3" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-cyber rounded-lg flex items-center justify-center animate-pulse-glow">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-orbitron font-bold text-transparent bg-gradient-neon bg-clip-text">
                    MEDUSA 2.0
                  </h3>
                  <p className="text-sm font-mono text-muted-foreground">CTF Competition</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-mono mb-6">
                The ultimate inter-university cybersecurity challenge. Test your skills,
                defend your network, and emerge victorious in the digital realm.
              </p>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-background/50 rounded-lg flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all duration-300 group"
                  >
                    <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-orbitron font-bold text-foreground mb-6">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => scrollToSection(link.href)}
                      className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-2 group"
                    >
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-orbitron font-bold text-foreground mb-6">
                Contact Info
              </h4>
              <ul className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <li key={index}>
                    <a
                      href={contact.href}
                      className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-3 group"
                    >
                      <contact.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                      {contact.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-lg font-orbitron font-bold text-foreground mb-6">
                Stay Updated
              </h4>
              <p className="text-sm text-muted-foreground font-mono mb-4">
                Get the latest updates about MEDUSA 2.0 and future CTF events.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
                <Button variant="cyber" size="sm" className="w-full">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm font-mono text-muted-foreground">
              © 2025 MEDUSA 2.0 CTF. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm font-mono text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Code of Conduct
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-cyber opacity-50" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
    </footer>
  );
};