import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCw, Eye, Palette, Sparkles as SparklesIcon, Globe } from 'lucide-react';
import InteractiveEarth from './InteractiveEarth';

// 3D Animated Core Mesh
function MeshCore({ geometryType = 'Icosahedron', color = '#00f0ff', wireframe = false, isHovered, setIsHovered }) {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * (isHovered ? 0.6 : 0.25);
      meshRef.current.rotation.y += delta * (isHovered ? 0.8 : 0.35);
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.4;
    }
  });

  const renderGeometry = () => {
    switch (geometryType) {
      case 'TorusKnot':
        return <torusKnotGeometry args={[1.2, 0.4, 128, 32]} />;
      case 'Octahedron':
        return <octahedronGeometry args={[1.7, 0]} />;
      case 'Dodecahedron':
        return <dodecahedronGeometry args={[1.6, 0]} />;
      case 'Icosahedron':
      default:
        return <icosahedronGeometry args={[1.7, 2]} />;
    }
  };

  return (
    <group>
      {/* Outer Floating Geometric Core */}
      <Float speed={2} rotationIntensity={1} floatIntensity={1.5}>
        <mesh
          ref={meshRef}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
          scale={isHovered ? 1.08 : 1}
        >
          {renderGeometry()}
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isHovered ? 0.6 : 0.25}
            roughness={0.2}
            metalness={0.8}
            wireframe={wireframe}
          />
        </mesh>
      </Float>

      {/* Inner Glowing Plasma Sphere */}
      <mesh ref={innerRef} scale={0.7}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color="#ff007f"
          speed={3}
          distort={0.4}
          radius={1}
          emissive="#a855f7"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Sparkling particle field surrounding the core */}
      <Sparkles count={40} scale={5} size={3} speed={0.4} color={color} />
    </group>
  );
}

export function InteractiveModel({
  initialGeometry = 'Earth',
  initialColor = '#00f0ff',
  height = '420px',
  showControls = true,
}) {
  const [geometry, setGeometry] = useState(initialGeometry);
  const [color, setColor] = useState(initialColor);
  const [wireframe, setWireframe] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const colors = ['#00f0ff', '#a855f7', '#ff007f', '#00ff9d', '#eab308'];
  const geometries = ['Earth', 'Icosahedron', 'TorusKnot', 'Octahedron', 'Dodecahedron'];

  if (geometry === 'Earth') {
    return <InteractiveEarth height={height} showControls={showControls} />;
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950/70 border border-cyan-500/20 backdrop-blur-xl shadow-2xl">
      {/* Three.js Interactive Canvas */}
      <div style={{ height }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-10, -10, -5]} intensity={2} color={color} />
          
          <MeshCore
            geometryType={geometry}
            color={color}
            wireframe={wireframe}
            isHovered={isHovered}
            setIsHovered={setIsHovered}
          />

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={3}
            maxDistance={8}
            autoRotate={!isHovered}
            autoRotateSpeed={1.5}
          />
        </Canvas>
      </div>

      {/* Interactive Overlay HUD Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-xs">
          {/* Geometry Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> Shape:
            </span>
            {geometries.map((geo) => (
              <button
                key={geo}
                onClick={() => setGeometry(geo)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  geometry === geo
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {geo}
              </button>
            ))}
          </div>

          {/* Color & Wireframe Toggles */}
          <div className="flex items-center gap-3">
            {/* Color Swatches */}
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c}
                />
              ))}
            </div>

            {/* Wireframe Button */}
            <button
              onClick={() => setWireframe((prev) => !prev)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                wireframe
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Wireframe</span>
            </button>
          </div>
        </div>
      )}

      {/* Info Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-xs text-cyan-300 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="font-mono font-medium">WebGL Core • Drag to Rotate</span>
      </div>
    </div>
  );
}

export default InteractiveModel;
