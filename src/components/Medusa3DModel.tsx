import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { Object3D, MathUtils } from "three";

import poster from "../assets/poster.webp";

const Medusa3DModel = ({ onLoaded, showPoster }: { onLoaded?: () => void; showPoster?: boolean }) => {
  const gltf = useGLTF("/model-optimized.glb", true);
  const ref = useRef<Object3D>(null);
  const direction = useRef(1); // 1 for forward, -1 for backward
  useFrame((_, delta) => {
    if (ref.current) {
  const maxRotation = MathUtils.degToRad(140);
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
  useEffect(() => {
    if (gltf && gltf.scene && onLoaded) {
      onLoaded();
    }
  }, [gltf, onLoaded]);
  if (showPoster) {
    // Show poster image as fallback
    return (
      <Html center style={{ pointerEvents: 'none' }}>
        <img src={poster} alt="Medusa Poster" style={{ width: 240, maxWidth: '80vw', borderRadius: 16, boxShadow: '0 4px 32px #0008' }} />
      </Html>
    );
  }
  return <primitive ref={ref} object={gltf.scene} scale={2.2} position={[0, 0.55, 0]} />;
};


const Medusa3DCanvas = ({ onLoaded, showPoster = false }: { onLoaded?: () => void; showPoster?: boolean }) => (
  <Canvas camera={{ position: [0, -1.0, 5.1], fov: 60 }}>
    <pointLight position={[0, 0, -2]} intensity={2.5} color="#39FF14" distance={8} decay={2} />
    <ambientLight intensity={0.8} />
    <directionalLight position={[5, 5, 5]} intensity={0.7} />
    <Medusa3DModel onLoaded={onLoaded} showPoster={showPoster} />
    <OrbitControls enablePan={false} enableZoom={false} />
  </Canvas>
);

export default Medusa3DCanvas;
