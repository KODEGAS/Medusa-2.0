import { useEffect, useRef } from "react";

// Import partner logos from assets
import hashxLogo from "@/assets/partners/hashx.png";
import dailyLogo from "@/assets/partners/daily.png";
import nadulaLogo from "@/assets/partners/nadula.jpg";

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

  // Partners with image assets
  const partners = [
    { 
      name: "HashX", 
      logo: hashxLogo,
      fallback: "HX" 
    },
    { 
      name: "Daily Mirror", 
      logo: dailyLogo,
      fallback: "DM" 
    },
    { 
      name: "Nadula Wathurakumbura PhotoGraphy", 
      logo: nadulaLogo,
      fallback: "NW" 
    },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      
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
            {/* Duplicate the array to loop */}
            {[...partners, ...partners, ...partners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 holographic-card rounded-lg min-w-[200px] h-32 group hover:scale-105 transition-all duration-300 overflow-hidden relative"
              >
                {/* Logo as cover image */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-contain group-hover:scale-105 filter brightness-90 group-hover:brightness-110 transition-all duration-300"
                    onError={(e) => {
                      // Fallback to text logo if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallbackDiv = target.nextElementSibling as HTMLDivElement;
                      if (fallbackDiv) {
                        fallbackDiv.style.display = 'flex';
                      }
                    }}
                  />
                  {/* Fallback text logo (hidden by default) */}
                  <div 
                    className="absolute inset-0 bg-gradient-cyber rounded-lg hidden items-center justify-center text-2xl font-orbitron font-bold text-background"
                    style={{ display: 'none' }}
                  >
                    {partner.fallback}
                  </div>
                </div>
                
                {/* Partner name overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3">
                  <p className="text-xs font-mono text-white group-hover:text-primary transition-colors truncate">
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
  }

  export default PartnersSection;