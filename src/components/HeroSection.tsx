import { useState, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import medusaLogo from "@/assets/medusa-logo.jpg";
import heroBackground from "@/assets/hero-background.jpg";
import { Separator } from "@radix-ui/react-context-menu";

export const HeroSection = memo(() => {
  const [glitchText, setGlitchText] = useState("Medusa 2.0");

  useEffect(() => {
    const interval = setInterval(() => {
      const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const original = "Medusa 2.0";
      let glitched = "";

      for (let i = 0; i < original.length; i++) {
        if (Math.random() < 0.1) {
          glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
        } else {
          glitched += original[i];
        }
      }

      setGlitchText(glitched);

      setTimeout(() => setGlitchText(original), 100);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />

      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 matrix-rain opacity-20" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />

      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <img
              src={medusaLogo}
              alt="Medusa 2.0 Logo"
              className="w-48 h-32 object-contain filter drop-shadow-2xl"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-cyber opacity-50 mix-blend-overlay rounded-lg animate-pulse-glow" />
          </div>
        </div>

        {/* Main Heading */}
        <div className="mb-6">
          <h1 className="text-6xl md:text-8xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-4 glow-text">
            {glitchText}
          </h1>
          <div className="text-xl md:text-2xl font-mono text-primary animate-fade-in">
            <span className="text-accent">Inter-University</span>{" "}
            <span className="text-secondary">CTF Competition</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="mb-8">
          <p className="text-2xl md:text-4xl font-orbitron font-bold text-foreground mb-4 animate-float">
            Crack the Code. Rule the Game.
          </p>
          <p className="text-lg md:text-xl font-mono text-muted-foreground max-w-2xl mx-auto">
            The ultimate cybersecurity challenge where universities collide in digital warfare.
            Test your skills, defend your network, and emerge victorious.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="holographic-card p-6 rounded-lg">
            <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-orbitron font-bold text-primary">15+</div>
            <div className="text-sm font-mono text-muted-foreground">Universities</div>
          </div>
          <div className="holographic-card p-6 rounded-lg">
            <Zap className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-orbitron font-bold text-accent">LKR 160K+</div>
            <div className="text-sm font-mono text-muted-foreground">Prize Pool</div>
          </div>
          <div className="holographic-card p-6 rounded-lg">
            <div className="w-8 h-8 bg-gradient-cyber rounded-full mx-auto mb-3" />
            <div className="text-3xl font-orbitron font-bold text-secondary">24hrs</div>
            <div className="text-sm font-mono text-muted-foreground">Competition</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="cyber" size="lg" className="text-lg px-8 py-6">
            Register Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="neon" size="lg" className="text-lg px-8 py-6">
            View Timeline
          </Button>
        </div>
        <div className="mb-8" />
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
});