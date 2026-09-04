import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * HolographicCoin3D - Pure 60 FPS hardware-accelerated 3D Hologram Token
 * Renders glowing orbital cyber rings, spinning perspective disc,
 * and neon aura responsive to mouse tilt. Zero heavy WebGL overhead.
 */
export default function HolographicCoin3D({ symbol = 'QAI', name = 'Quantum AI', color = '#00ff9d', isBullish = true }) {
  const [rotateY, setRotateY] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let animationFrameId;
    let currentRotation = 0;

    const animateRotation = () => {
      currentRotation = (currentRotation + 0.75) % 360;
      setRotateY(currentRotation);
      animationFrameId = requestAnimationFrame(animateRotation);
    };

    animationFrameId = requestAnimationFrame(animateRotation);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -20;
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-56 flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950/90 via-[#070b19]/80 to-slate-950/90 border border-slate-800/80 select-none"
      style={{ perspective: 1000 }}
    >
      {/* Background Holographic Grid Scanner */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,157,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, ${color}20 1px, transparent 1px), linear-gradient(to bottom, ${color}20 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Floating 3D Token Container */}
      <div
        className="relative flex items-center justify-center transition-transform duration-200 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${mouseOffset.y}deg) rotateZ(${mouseOffset.x * 0.5}deg)`,
        }}
      >
        {/* Outer Orbit Ring 1 */}
        <div
          className="absolute w-44 h-44 rounded-full border border-dashed opacity-40 animate-[spin_12s_linear_infinite]"
          style={{ borderColor: color }}
        />

        {/* Outer Orbit Ring 2 (Counter-rotation) */}
        <div
          className="absolute w-36 h-36 rounded-full border border-dotted opacity-30 animate-[spin_8s_linear_infinite_reverse]"
          style={{ borderColor: color }}
        />

        {/* 3D Spinning Holographic Coin Cylinder */}
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center font-black text-xl font-mono tracking-widest shadow-2xl transition-all"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${rotateY}deg)`,
            background: `radial-gradient(circle at 35% 35%, ${color}33, #020617 80%)`,
            border: `2px solid ${color}`,
            boxShadow: `0 0 35px ${color}55, inset 0 0 20px ${color}33`,
            color: '#ffffff',
          }}
        >
          {/* Front Face Hologram Symbol */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center backface-hidden"
            style={{ textShadow: `0 0 12px ${color}` }}
          >
            <span className="text-lg font-extrabold tracking-wider">{symbol}</span>
            <span className="text-[8px] tracking-widest uppercase opacity-70 font-sans mt-0.5">MATRIX GEM</span>
          </div>

          {/* Back Face Hologram (Identical for seamless spin) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center backface-hidden"
            style={{
              transform: 'rotateY(180deg)',
              textShadow: `0 0 12px ${color}`,
            }}
          >
            <span className="text-lg font-extrabold tracking-wider">{symbol}</span>
            <span className="text-[8px] tracking-widest uppercase opacity-70 font-sans mt-0.5">MATRIX GEM</span>
          </div>
        </div>

        {/* Ambient Pulsing Holographic Floor Pedestal */}
        <div
          className="absolute -bottom-16 w-32 h-8 rounded-[100%] opacity-60 blur-[3px]"
          style={{
            background: `radial-gradient(ellipse at center, ${color}88 0%, transparent 80%)`,
            transform: 'rotateX(75deg)',
          }}
        />
      </div>

      {/* Cyber Corner Decals */}
      <div className="absolute top-2.5 left-3 text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>3D HOLO // {name}</span>
      </div>
      <div className="absolute bottom-2 right-3 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
        SCANNER ACTIVE 60 FPS
      </div>
    </div>
  );
}
