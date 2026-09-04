import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

/**
 * Cyberpunk Glowing Animated Button with ripple clicks, laser beam sweep, and celebration options.
 */
export function AnimatedButton({
  children,
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'purple' | 'danger' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  triggerConfetti = false,
  disabled = false,
  className = '',
  ...props
}) {
  const [ripples, setRipples] = useState([]);
  const [isLaserShooting, setIsLaserShooting] = useState(false);

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-semibold shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] border border-cyan-300/40',
    purple:
      'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border border-purple-400/40',
    secondary:
      'bg-slate-800/80 text-slate-200 border border-slate-700/80 hover:bg-slate-700/80 hover:border-cyan-500/40 hover:text-cyan-300 shadow-md',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 text-white font-semibold shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.7)] border border-rose-400/40',
    ghost:
      'bg-transparent text-slate-300 hover:bg-slate-800/50 hover:text-cyan-400 border border-transparent hover:border-slate-700',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
  };

  const handleClick = (e) => {
    if (disabled) return;

    // Trigger Laser Line Sweep
    setIsLaserShooting(true);
    setTimeout(() => setIsLaserShooting(false), 700);

    // Trigger ripple
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };

    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (triggerConfetti) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00f0ff', '#a855f7', '#ff007f'],
      });
    }

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden inline-flex items-center justify-center transition-colors duration-200 ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {/* Laser line beam on click */}
      {isLaserShooting && <div className="animate-laser-line" />}

      {/* Ripple elements */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
          style={{
            top: ripple.y - 12,
            left: ripple.x - 12,
            width: 24,
            height: 24,
          }}
        />
      ))}

      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
    </motion.button>
  );
}

export default AnimatedButton;
