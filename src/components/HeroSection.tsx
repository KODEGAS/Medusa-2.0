import { useState, useEffect, memo, Suspense, lazy } from "react";
// Defer heavy imports until after LCP
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Dynamically import the 3D model canvas
const Medusa3DCanvas = lazy(() => import("./Medusa3DModel"));



const HeroSection = memo(() => {
  const [modelLoaded, setModelLoaded] = useState(false);
  const [glitchText, setGlitchText] = useState('MEDUSA 2.0');
  const [showHeavy, setShowHeavy] = useState(false);
  const [Button, setButton] = useState<any>(null);
  const [icons, setIcons] = useState<any>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Show static heading for LCP, then start glitch effect after 2s
    const original = "MEDUSA 2.0";
    setGlitchText(original);
    const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    let glitchInterval: NodeJS.Timeout;
    const startGlitch = () => {
      glitchInterval = setInterval(() => {
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
    };
    const glitchTimeout = setTimeout(() => {
      startGlitch();
      // After LCP, load heavy JS (icons, Button, router)
      setShowHeavy(true);
    }, 2000); // Wait 2s before glitching
    return () => {
      clearTimeout(glitchTimeout);
      if (glitchInterval) clearInterval(glitchInterval);
    };
  }, []);

  // Dynamically import heavy JS after LCP
  useEffect(() => {
    if (!showHeavy) return;
    Promise.all([
      import("@/components/ui/button"),
      import("lucide-react")
    ]).then(([buttonMod, iconsMod]) => {
      setButton(() => buttonMod.Button);
      setIcons({
        ArrowRight: iconsMod.ArrowRight,
        Shield: iconsMod.Shield,
        Zap: iconsMod.Zap,
      });
    });
  }, [showHeavy]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Strong black overlay for darker background */}
      <div className="absolute inset-0 bg-black opacity-80 z-0 pointer-events-none" />
      {/* Loader overlay while model is loading */}
      {!modelLoaded && (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto" />
          <p className="text-muted-foreground font-mono mt-6">Loading...</p>
        </div>
      )}
      {/* Matrix Rain Effect */}
  {/* <div className="absolute inset-0 matrix-rain opacity-20" /> */}
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      {/* 3D Model above Main Heading (always show) */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-2 sm:px-4">
        <div className="flex flex-col items-center justify-center">
          <div
            className="w-full flex justify-center"
            style={{ minHeight: 0 }}
          >
            <div
              className="relative"
              style={{
                width: '90vw',
                maxWidth: 560,
                height: '55vw',
                maxHeight: 460,
                minWidth: 220,
                minHeight: 180,
              }}
            >
              <Suspense fallback={null}>
                <Medusa3DCanvas onLoaded={() => setModelLoaded(true)} showPoster={!modelLoaded} />
              </Suspense>
              {/* Hologram effect below the model */}
              <div
                className="hidden sm:block"
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '55px',
                  transform: 'translateX(-50%)',
                  width: '260px',
                  height: '40px',
                  background: 'radial-gradient(ellipse at center, rgba(57,255,20,0.45) 0%, rgba(57,255,20,0.18) 60%, rgba(57,255,20,0.05) 100%)',
                  filter: 'blur(6px)',
                  opacity: 0.85,
                  zIndex: 2,
                  pointerEvents: 'none',
                  animation: 'holoPulse 2s infinite alternate',
                }}
              />
              <div
                className="block sm:hidden"
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '20px',
                  transform: 'translateX(-50%)',
                  width: '120px',
                  height: '20px',
                  background: 'radial-gradient(ellipse at center, rgba(57,255,20,0.35) 0%, rgba(57,255,20,0.12) 60%, rgba(57,255,20,0.03) 100%)',
                  filter: 'blur(4px)',
                  opacity: 0.7,
                  zIndex: 2,
                  pointerEvents: 'none',
                  animation: 'holoPulse 2s infinite alternate',
                }}
              />
              <style>{`
                @keyframes holoPulse {
                  0% { opacity: 0.7; filter: blur(6px); }
                  100% { opacity: 1; filter: blur(12px); }
                }
              `}</style>
            </div>
          </div>
        </div>
        {/* Main Heading and subtitle: always render for best LCP */}
        <div className="px-1">
          <h1
            className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-3 sm:mb-4 glow-text"
            style={{ marginTop: '-38px', lineHeight: 1.1, wordBreak: 'break-word' }}
          >
            {glitchText}
          </h1>
          <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-mono text-primary animate-fade-in" style={{ marginTop: '-8px' }}>
            <span className="text-accent">Inter-University </span>{' '}
            <span className="text-secondary">CTF Competition</span>
          </div>
        </div>
        {/* Show the rest of the content only after model is loaded */}
        {modelLoaded && (
          <>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-2xl sm:max-w-4xl mx-auto w-full">
              <div className="holographic-card p-6 rounded-lg">
                {showHeavy && icons.Shield ? (
                  <icons.Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                ) : (
                  <div className="w-8 h-8 mx-auto mb-3 bg-primary/30 rounded-full animate-pulse" />
                )}
                <div className="text-3xl font-orbitron font-bold text-primary">15+</div>
                <div className="text-sm font-mono text-muted-foreground">Universities</div>
              </div>
              <div className="holographic-card p-6 rounded-lg">
                {showHeavy && icons.Zap ? (
                  <icons.Zap className="w-8 h-8 text-accent mx-auto mb-3" />
                ) : (
                  <div className="w-8 h-8 mx-auto mb-3 bg-accent/30 rounded-full animate-pulse" />
                )}
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-1">
              {showHeavy && Button && icons.ArrowRight ? (
                <Button variant="cyber" size="lg" className="text-lg px-8 py-6"
                  onClick={() => navigate("/register")}
                >
                  Register Now
                </Button>
              ) : (
                <button className="text-lg px-8 py-6 rounded-lg bg-primary/60 text-white font-bold opacity-70 cursor-wait" disabled>
                  Register Now
                </button>
              )}
              {showHeavy && Button ? (
                <Button
                  variant="neon"
                  size="lg"
                  className="text-lg px-8 py-6 hover:text-white"
                  onClick={() => {
                    const el = document.getElementById("timeline-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  View Timeline
                </Button>
              ) : (
                <button className="text-lg px-8 py-6 rounded-lg bg-accent/60 text-white font-bold opacity-70 cursor-wait" disabled>
                  View Timeline
                </button>
              )}
            </div>
            <div className="mb-8" />
           
          </>
        )}
      </div>
    </section>
  );
});

export default HeroSection;
export { HeroSection };