import { useEffect, useRef } from "react";

export const PartnersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, []);

  // Placeholder partners - you can replace with actual partner logos
  const partners = [
    { name: "TechCorp", logo: "TC" },
    { name: "CyberSec Solutions", logo: "CSS" },
    { name: "Digital Fortress", logo: "DF" },
    { name: "SecureNet", logo: "SN" },
    { name: "InfoShield", logo: "IS" },
    { name: "ByteGuard", logo: "BG" },
    { name: "CryptoLabs", logo: "CL" },
    { name: "NetDefender", logo: "ND" },
    { name: "DataVault", logo: "DV" },
    { name: "CodeBreaker", logo: "CB" },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-4 glow-text">
            OUR PARTNERS
          </h2>
          <div className="w-32 h-1 bg-gradient-cyber mx-auto rounded-full animate-pulse-glow" />
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto font-mono">
            Trusted by leading cybersecurity organizations and tech innovators
          </p>
        </div>

        {/* Auto-scrolling Partner Logos */}
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-hidden scroll-smooth"
            style={{ scrollBehavior: 'auto' }}
          >
            {/* Duplicate the array to create seamless loop */}
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 holographic-card p-8 rounded-lg min-w-[200px] h-32 flex items-center justify-center group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-cyber rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-orbitron font-bold text-background group-hover:animate-pulse-glow transition-all duration-300">
                    {partner.logo}
                  </div>
                  <p className="text-sm font-mono text-muted-foreground group-hover:text-primary transition-colors">
                    {partner.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Gradient overlays for fade effect */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
        </div>

        {/* Decorative Elements */}
        <div className="flex justify-center mt-12">
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};