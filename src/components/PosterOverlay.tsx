import React from "react";
import poster from "../assets/poster.webp";

function randomChar() {
  const chars = '01ABCDEF';
  return chars[Math.floor(Math.random() * chars.length)];
}

function CodeRain() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId: number;
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      ctx.fillStyle = 'rgba(57,255,20,0.18)';
      for (let i = 0; i < columns; i++) {
        const text = randomChar();
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
        if (drops[i] * fontSize > canvas.height) {
          drops[i] = 0;
        }
      }
      animationId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={590}
      height={340}
      style={{
        position: 'absolute',
        left: 0, top: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
        opacity: 0.7,
        zIndex: 2
      }}
    />
  );
}

const PosterOverlay: React.FC = () => {
  // Responsive: Only set width/height inline for desktop, let CSS handle mobile
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches;
  const overlayStyle = {
    background: '#111',
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 3,
    position: 'absolute',
    left: 0, right: 0, bottom: 0, margin: 'auto',
    top: '0px',
    maxWidth: '90vw',
    borderRadius: 14,
    boxShadow: '0 2px 12px #000a',
    ...(isMobile ? {} : { width: 560, height: 340, top: '-40px' }),
  };
  return (
    <div
      className="poster-overlay-responsive"
  style={overlayStyle as React.CSSProperties}
    >
      <img
        src={poster}
        alt="Medusa Poster"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter: 'brightness(1.08) contrast(1.08)'
        }}
      />
      {/* Scanning Line */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, height: 4,
        top: 0,
        background: 'linear-gradient(90deg, transparent, #39FF14 60%, transparent)',
        opacity: 0.35,
        borderRadius: 2,
        animation: 'scanline 2.2s linear infinite'
      }} />
      {/* Code Rain */}
      <CodeRain />
      {/* Grid Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'repeating-linear-gradient(0deg, rgba(57,255,20,0.08) 0 1px, transparent 1px 32px), repeating-linear-gradient(90deg, rgba(57,255,20,0.08) 0 1px, transparent 1px 32px)',
        borderRadius: 24,
        pointerEvents: 'none',
        zIndex: 2
      }} />
      <style>{`
        @keyframes scanline {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default PosterOverlay;
