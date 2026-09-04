import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Animated Starfield / Particle Cloud
function ParticleGalaxy({ count = 2000 }) {
  const pointsRef = useRef();

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const color1 = new THREE.Color('#00f0ff');
    const color2 = new THREE.Color('#a855f7');
    const color3 = new THREE.Color('#3b82f6');

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Spherical distribution
      const radius = 15 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);

      const mixedColor = Math.random() > 0.5 ? color1 : (Math.random() > 0.5 ? color2 : color3);
      col[i3] = mixedColor.r;
      col[i3 + 1] = mixedColor.g;
      col[i3 + 2] = mixedColor.b;
    }

    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.75}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Futuristic Wavy Wireframe Grid Floor
function CyberGridFloor() {
  const gridRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.position.z = (time * 0.8) % 2;
    }
  });

  return (
    <group position={[0, -5, -5]} rotation={[-Math.PI / 2.3, 0, 0]}>
      <gridHelper
        ref={gridRef}
        args={[60, 40, '#00f0ff', '#1e293b']}
        position={[0, 0, 0]}
      />
    </group>
  );
}

export function BackgroundCanvas({ quality = 'high', particleCount = 2000 }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: quality !== 'low', alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f0ff" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#a855f7" />

        <ParticleGalaxy count={quality === 'low' ? 800 : particleCount} />
        <CyberGridFloor />
      </Canvas>
    </div>
  );
}

export default BackgroundCanvas;
