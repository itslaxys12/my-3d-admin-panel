import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Premium Frosted GlassCard Component with interactive 3D tilt & neon edge highlights.
 */
export function GlassCard({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  glowColor = 'cyan', // 'cyan' | 'purple' | 'pink' | 'green' | 'default'
  tiltEffect = true,
  className = '',
  headerClassName = '',
  contentClassName = '',
  onClick,
}) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const glowStyles = {
    cyan: 'border-cyan-500/20 hover:border-cyan-400/50 hover:shadow-[0_10px_35px_rgba(0,240,255,0.15)]',
    purple: 'border-purple-500/20 hover:border-purple-400/50 hover:shadow-[0_10px_35px_rgba(168,85,247,0.15)]',
    pink: 'border-pink-500/20 hover:border-pink-400/50 hover:shadow-[0_10px_35px_rgba(255,0,127,0.15)]',
    green: 'border-emerald-500/20 hover:border-emerald-400/50 hover:shadow-[0_10px_35px_rgba(0,255,157,0.15)]',
    default: 'border-slate-700/50 hover:border-slate-500/50 hover:shadow-lg',
  };

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
  const enableTilt = tiltEffect && !isTouchDevice;

  const handleMouseMove = (e) => {
    if (!enableTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -7;
    const rotY = ((x - centerX) / centerX) * 7;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    if (!enableTilt) return;
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: tiltEffect ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)` : 'none',
        transition: 'transform 0.15s ease-out, border-color 0.3s ease, box-shadow 0.3s ease',
      }}
      className={`relative overflow-hidden rounded-2xl bg-slate-900/65 backdrop-blur-xl border ${glowStyles[glowColor] || glowStyles.default} p-5 ${className}`}
    >
      {/* Dynamic Glare Reflection Overlay */}
      {tiltEffect && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.opacity}) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Card Header */}
      {(title || Icon || action) && (
        <div className={`flex items-center justify-between mb-4 ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Card Content */}
      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </motion.div>
  );
}

export default GlassCard;
