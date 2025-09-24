import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere: React.FC = () => {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      sphereRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d')!;
    
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(0.5, '#00FFC2');
    gradient.addColorStop(1, '#A671E9');
    
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        map={gradientTexture}
        distort={0.6}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={0.8}
      />
    </Sphere>
  );
};

const ParticleField: React.FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(1000 * 3);
    
    for (let i = 0; i < 1000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial
        color="#4A90E2"
        size={0.05}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const ThreeBackground: React.FC = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      zIndex: -1,
      background: 'radial-gradient(circle at 50% 50%, rgba(74, 144, 226, 0.1) 0%, rgba(13, 17, 23, 1) 70%)'
    }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#4A90E2" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00FFC2" />
        
        <AnimatedSphere />
        <ParticleField />
        
        <fog attach="fog" args={['#0D1117', 5, 15]} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground;