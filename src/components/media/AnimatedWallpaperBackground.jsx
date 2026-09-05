import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedWallpaperBackground:
 * Renders the clean cinematic anime warrior wallpaper with:
 * 1. Hardware-accelerated slow Ken Burns breathing motion & subtle pan.
 * 2. High-performance, lightweight 60 FPS rain drizzle & mist particle canvas.
 * 3. Reactive mouse parallax.
 * 4. Dark cyber vignette for crisp text contrast.
 * Optimized for Chrome, Firefox, and Brave with near-zero CPU/GPU overhead.
 */
export function AnimatedWallpaperBackground({ mousePos = { x: 0, y: 0 } }) {
  const canvasRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Canvas particle rain & mist overlay (Only on Desktop for 0% battery/CPU drain on phones)
  useEffect(() => {
    // If mobile, do not run canvas animation loop to eliminate 100% of mobile frame drops and lag!
    if (window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // 40 gentle rain streaks (ultra-low CPU overhead)
    const raindrops = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 12 + Math.random() * 18,
      speed: 4 + Math.random() * 5,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    // 15 floating mist/fog particles
    const mistParticles = Array.from({ length: 15 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 40 + Math.random() * 70,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.2,
      opacity: 0.04 + Math.random() * 0.06,
    }));

    let lastTime = performance.now();

    const render = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Render rain
      ctx.strokeStyle = '#a5f3fc';
      ctx.lineWidth = 1;
      for (let i = 0; i < raindrops.length; i++) {
        const drop = raindrops[i];
        ctx.globalAlpha = drop.opacity;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 2, drop.y + drop.len);
        ctx.stroke();

        drop.y += drop.speed * (delta * 60);
        drop.x -= 0.5 * (delta * 60);

        if (drop.y > height) {
          drop.y = -drop.len;
          drop.x = Math.random() * (width + 50);
        }
      }

      // Render soft mist particles
      for (let i = 0; i < mistParticles.length; i++) {
        const m = mistParticles[i];
        ctx.globalAlpha = m.opacity;
        const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
        grad.addColorStop(0, 'rgba(165, 243, 252, 0.4)');
        grad.addColorStop(1, 'rgba(165, 243, 252, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();

        m.x += m.vx * (delta * 60);
        m.y += m.vy * (delta * 60);

        if (m.x < -m.radius) m.x = width + m.radius;
        if (m.x > width + m.radius) m.x = -m.radius;
        if (m.y < -m.radius) m.y = height + m.radius;
        if (m.y > height + m.radius) m.y = -m.radius;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Parallax translation (disabled on mobile)
  const offsetX = isMobile ? 0 : (mousePos.x || 0) * 12;
  const offsetY = isMobile ? 0 : (mousePos.y || 0) * 8;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030712]">
      {/* Anime Samurai Wallpaper Image with Ken Burns breathing animation */}
      <div
        className="absolute inset-[-4%] w-[108%] h-[108%] transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: isMobile ? 'scale(1.02)' : `translate3d(${-offsetX}px, ${offsetY}px, 0) scale(1.04)`,
        }}
      >
        <img
          src="/assets/images/samurai_bg.jpg"
          alt="Cinematic Anime Warrior Background"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.08] saturate-[1.1] transition-opacity duration-1000 ${
            isLoaded ? 'opacity-90' : 'opacity-0'
          }`}
          style={{
            animation: isMobile ? 'none' : 'kenBurnsSubtle 32s ease-in-out infinite alternate',
          }}
        />
      </div>

      {/* Lightweight 60 FPS Rain & Mist Particle Canvas (Desktop only) */}
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-70"
        />
      )}

      {/* Cyber Dark Gradient Vignette for perfect text contrast & UI readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/70 opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#030712_85%)] opacity-85" />
      <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[0.5px]" />
    </div>
  );
}

export default AnimatedWallpaperBackground;
