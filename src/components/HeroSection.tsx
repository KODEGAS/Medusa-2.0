import { useState, useEffect, memo, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { Separator } from "@radix-ui/react-context-menu";
import { useNavigate } from "react-router-dom";

// 3D Model imports
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
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
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const glitchChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const original = "MEDUSA 2.0";
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
      {/* Animated Grid Overlay */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      {/* Matrix Rain Effect */}
      <div className="absolute inset-0 matrix-rain opacity-20" />
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      {/* 3D Model above Main Heading (always show) */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div style={{ width: 560, height: 460, position: 'relative' }}>
            <Suspense fallback={null}>
              <Canvas camera={{ position: [0, -1.0, 5.1], fov: 60 }}>
                <pointLight position={[0, 0, -2]} intensity={2.5} color="#39FF14" distance={8} decay={2} />
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={0.7} />
                <Medusa3DModel onLoaded={() => setModelLoaded(true)} />
                <OrbitControls enablePan={false} enableZoom={false} />
              </Canvas>
            </Suspense>
            {/* Hologram effect below the model */}
            <div
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
            <style>{`
              @keyframes holoPulse {
                0% { opacity: 0.7; filter: blur(6px); }
                100% { opacity: 1; filter: blur(12px); }
              }
            `}</style>
          </div>
        </div>
        {/* Show the rest of the content only after model is loaded */}
        {modelLoaded && (
          <>
            {/* Main Heading */}
            <div>
              <h1 className="text-6xl md:text-8xl font-orbitron font-black text-transparent bg-gradient-neon bg-clip-text mb-4 glow-text" style={{ marginTop: '-68px' }}>
                {glitchText}
              </h1>
              <div className="text-xl md:text-2xl font-mono text-primary animate-fade-in" style={{ marginTop: '-13px' }}>
                <span className="text-accent">Inter-University </span>{' '}
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
              <Button variant="cyber" size="lg" className="text-lg px-8 py-6"
                onClick={() => navigate("/register")}
              >
                Register Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
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
            </div>
            <div className="mb-8" />
            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
                <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
});

export default HeroSection;
export { HeroSection };