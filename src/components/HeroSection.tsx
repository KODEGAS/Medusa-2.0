import { useState, useEffect, memo, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import PosterOverlay from "./PosterOverlay";


// Dynamically import the 3D model canvas
const Medusa3DCanvas = lazy(() => import("./Medusa3DModel"));

// 3D Model imports
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef } from "react";

// 3D Model component
import * as THREE from "three";

// 3D Model component
const Medusa3DModel = ({ onLoaded }: { onLoaded?: () => void }) => {
  const gltf = useGLTF("/model.glb", true);
  const ref = useRef<THREE.Object3D>(null);
  const direction = useRef(1); // 1 for forward, -1 for backward
  useFrame((_, delta) => {
    if (ref.current) {
      // Rotate between 0 and ~2.44 radians (140deg) at a slower speed
      const maxRotation = (140 * Math.PI) / 180;
      ref.current.rotation.y += direction.current * delta * 0.005;
      if (ref.current.rotation.y >= maxRotation) {
        ref.current.rotation.y = maxRotation;
        direction.current = -1;
      } else if (ref.current.rotation.y <= 0) {
        ref.current.rotation.y = 0;
        direction.current = 1;
      }
    }
  });
  // Notify parent when loaded
  useEffect(() => {
    if (gltf && gltf.scene && onLoaded) {
      onLoaded();
    }
  }, [gltf, onLoaded]);
  return <primitive ref={ref} object={gltf.scene} scale={2.2} position={[0, 0.55, 0]} />;
};


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
  <section className="relative min-h-screen flex flex-col justify-start items-center overflow-hidden">
      {/* Strong black overlay for darker background */}
      <div className="absolute inset-0 bg-black opacity-80 z-0 pointer-events-none" />
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
              className="relative hero-3dmodel-responsive"
              style={{
                width: '90vw',
                maxWidth: 560,
                height: '55vw',
                maxHeight: 460,
                minWidth: 220,
                minHeight: 180,
              }}
            >
              {/* Always mount the 3D model, overlay poster absolutely until modelLoaded */}
              <Suspense fallback={null}>
                <Medusa3DCanvas onLoaded={() => setModelLoaded(true)} />
              </Suspense>
              {!modelLoaded && (
                <PosterOverlay />
              )}
              {/* Hologram effect below the model (single instance) */}
              <div
                className="hidden sm:block"
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: '70px',
                  transform: 'translateX(-50%)',
                  width: '260px',
                  height: '24px',
                  background: 'radial-gradient(ellipse at center, rgba(57,255,20,0.45) 0%, rgba(57,255,20,0.18) 60%, rgba(57,255,20,0.05) 100%)',
                  filter: 'blur(6px)',
                  opacity: 0.85,
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
            className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-3 sm:mb-4 glow-text hero-heading-responsive"
            style={{ marginTop: '-38px', lineHeight: 1.1, wordBreak: 'break-word' }}
          >
            {glitchText}
          </h1>
          <div className="text-base xs:text-lg sm:text-xl md:text-2xl font-mono text-primary animate-fade-in" style={{ marginTop: '-8px', marginBottom: '20px' }}>
            <span className="text-accent">Inter-Institutional </span>{' '}
            <span className="text-secondary">CTF Competition</span>
          </div>
        </div>
        {/* Tagline, Stats, and CTA Buttons always visible */}
        <div className="mb-8">
          <p className="text-2xl md:text-4xl font-orbitron font-bold text-foreground mb-4 animate-float">
            Crack the Code. Rule the Game.
          </p>
          <p className="text-lg md:text-xl font-mono text-muted-foreground max-w-2xl mx-auto">
            The ultimate cybersecurity challenge where universities collide in digital warfare.
            Test your skills, defend your network, and emerge victorious.
          </p>
        </div>
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
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-1">
          
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
      </div>
    </section>
  );
});

export default HeroSection;
export { HeroSection };