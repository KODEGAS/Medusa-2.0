import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Users, Trophy, Clock } from "lucide-react";
import { useScrollAnimation, useStaggeredAnimation } from "@/hooks/useScrollAnimation";

const highlights = [
  {
    icon: Terminal,
    title: "Advanced CTF Challenges",
    description: "Web exploitation, cryptography, reverse engineering, and more",
    color: "text-primary",
    gradient: "from-primary/20 to-primary/5"
  },
  {
    icon: Users,
    title: "Inter-University Scale",
    description: "Teams from 50+ universities competing nationwide",
    color: "text-secondary",
    gradient: "from-secondary/20 to-secondary/5"
  },
  {
    icon: Trophy,
    title: "Massive Prize Pool",
    description: "LKR 70,000+ in prizes and recognition for winners",
    color: "text-accent",
    gradient: "from-accent/20 to-accent/5"
  },
  {
    icon: Clock,
    title: "48-Hour Marathon",
    description: "Non-stop cybersecurity challenges and learning",
    color: "text-primary",
    gradient: "from-primary/20 to-primary/5"
  }
];

export const AboutSection = () => {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ delay: 200 });
  const { setRef: cardRef, visibleItems: cardsVisible } = useStaggeredAnimation(highlights.length, 150);
  const { ref: categoriesRef, isVisible: categoriesVisible } = useScrollAnimation({ delay: 400 });

  return (
    <section className="py-20 px-4 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 cyber-grid opacity-10" />
      
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
        <h2 className="text-5xl md:text-6xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-6 glow-text">
            About the Competition
          </h2>
          <p className="text-xl font-mono text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Medusa 2.0 is the ultimate cybersecurity battleground where the brightest minds
            from universities across the nation compete in advanced Capture The Flag challenges.
            This year, we are excited to introduce ICS pentesting, integrating <span className="font-bold">ICS Pentesting</span> into the competition for the first time.
          </p>
        </div>

        {/* 3D Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            const isFlipped = flippedCard === index;
            
            return (
              <div
                key={index}
                  ref={cardRef(index)}
                className={`group perspective-1000 cursor-pointer transition-all duration-800 ${
                  cardsVisible[index] ? 'animate-cyber-reveal' : 'scroll-hidden-cyber'
                }`}
                onMouseEnter={() => setFlippedCard(index)}
                onMouseLeave={() => setFlippedCard(null)}
              >
                <div className={`relative w-full h-80 transition-transform duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                  {/* Front of card */}
                  <Card className={`absolute inset-0 holographic-card backface-hidden bg-gradient-to-br ${highlight.gradient} border-border/50`}>
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto mb-4 ${highlight.color} flex items-center justify-center rounded-full bg-background/20 animate-pulse-glow`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="font-orbitron text-xl text-foreground">
                        {highlight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="font-mono text-muted-foreground leading-relaxed">
                        {highlight.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Back of card */}
                  <Card className={`absolute inset-0 holographic-card backface-hidden rotate-y-180 bg-gradient-to-br ${highlight.gradient} border-border/50`}>
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                      <div className={`text-6xl font-orbitron font-black ${highlight.color} text-center mb-4 glow-text animate-pulse`}>
                        {index === 0 && "100+"}
                        {index === 1 && "15+"}
                        {index === 2 && "160K+"}
                        {index === 3 && "24H"}
                      </div>
                      <p className="font-mono text-sm text-muted-foreground text-center">
                        {index === 0 && "Unique challenges across multiple categories"}
                        {index === 1 && "Universities participating nationwide"}
                        {index === 2 && "Total prize money and scholarships"}
                        {index === 3 && "Hours of non-stop cyber warfare"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>

        {/* Competition Categories */}
                <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/50">


          <h3 className="text-3xl font-orbitron font-bold text-center mb-8 text-primary">
            Challenge Categories
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Web Exploitation",
              "Hardware Exploitation",
              "Mobile Exploitation",
              "Cryptography", 
              "Reverse Engineering",
              "Binary Exploitation",
              "Forensics",
              "OSINT",
              "Steganography",
              "Network Security"
            ].map((category, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="text-lg px-6 py-3 font-mono hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:shadow-neon cursor-pointer"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};