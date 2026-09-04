import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

function FloatingCube({ position, color, rotationSpeed = 0.5, size = 0.8 }) {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * rotationSpeed;
      meshRef.current.rotation.y += delta * (rotationSpeed * 1.2);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2} position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function FloatingRing({ position, color }) {
  const ringRef = useRef();

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
      ringRef.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={1} floatIntensity={1.5} position={position}>
      <mesh ref={ringRef}>
        <torusGeometry args={[1.2, 0.08, 16, 64]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

export function FloatingElements({ className = 'h-48 w-full' }) {
  return (
    <div className={`relative overflow-hidden pointer-events-none ${className}`}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[-5, -5, -5]} intensity={1.2} color="#ff007f" />

        <FloatingCube position={[-2.2, 0.5, 0]} color="#00f0ff" size={0.7} rotationSpeed={0.6} />
        <FloatingCube position={[2.2, -0.4, 0]} color="#ff007f" size={0.6} rotationSpeed={0.4} />
        <FloatingRing position={[0, 0, -1]} color="#a855f7" />
      </Canvas>
    </div>
  );
}

export default FloatingElements;
