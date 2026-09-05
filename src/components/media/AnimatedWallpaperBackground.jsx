import React, { useEffect, useRef, useState } from 'react';

export const WALLPAPER_LIST = [
  {
    id: 'large-cherry-blossom-tree',
    title: 'Sakura Blossom Tree',
    category: 'Anime Nature',
    video: '/assets/wallpapers/large-cherry-blossom-tree.mp4',
    image: '/assets/wallpapers/large-cherry-blossom-tree.jpg',
  },
  {
    id: 'tokyo-midnight-rain',
    title: 'Tokyo Midnight Rain',
    category: 'Anime Rain',
    video: '/assets/wallpapers/tokyo-midnight-rain.mp4',
    image: '/assets/wallpapers/tokyo-midnight-rain.jpg',
  },
  {
    id: 'twilight-at-mount-fuji',
    title: 'Twilight at Mount Fuji',
    category: 'Sunset Nature',
    video: '/assets/wallpapers/twilight-at-mount-fuji.mp4',
    image: '/assets/wallpapers/twilight-at-mount-fuji.jpg',
  },
  {
    id: 'orange-train-at-sunset',
    title: 'Orange Train at Sunset',
    category: 'Anime Sunset',
    video: '/assets/wallpapers/orange-train-at-sunset.mp4',
    image: '/assets/wallpapers/orange-train-at-sunset.jpg',
  },
  {
    id: 'rainy-forest',
    title: 'Peaceful Rainy Forest',
    category: 'Green Nature',
    video: '/assets/wallpapers/rainy-forest.mp4',
    image: '/assets/wallpapers/rainy-forest.jpg',
  },
  {
    id: 'snowfall-in-forest',
    title: 'Snowfall in Forest',
    category: 'Winter Nature',
    video: '/assets/wallpapers/snowfall-in-forest.mp4',
    image: '/assets/wallpapers/snowfall-in-forest.jpg',
  },
  {
    id: 'mist-over-the-pines',
    title: 'Mist Over the Pines',
    category: 'Misty Mountains',
    video: '/assets/wallpapers/mist-over-the-pines.mp4',
    image: '/assets/wallpapers/mist-over-the-pines.jpg',
  },
];

export function AnimatedWallpaperBackground({ mousePos = { x: 0, y: 0 } }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [activeWallpaperId, setActiveWallpaperId] = useState(() => {
    return localStorage.getItem('gmx_active_wallpaper') || 'large-cherry-blossom-tree';
  });
  const [isVideoReady, setIsVideoReady] = useState(false);

  const activeWallpaper =
    WALLPAPER_LIST.find((w) => w.id === activeWallpaperId) || WALLPAPER_LIST[0];

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.detail) {
        setActiveWallpaperId(e.detail);
        setIsVideoReady(false);
      }
    };
    window.addEventListener('gmx_wallpaper_changed', handleStorage);
    return () => window.removeEventListener('gmx_wallpaper_changed', handleStorage);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Canvas particle rain & mist overlay
  useEffect(() => {
    if (isMobile) return;

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

    // 35 gentle atmospheric particles
    const particles = Array.from({ length: 35 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: 10 + Math.random() * 15,
      speed: 2 + Math.random() * 3,
      opacity: 0.12 + Math.random() * 0.2,
    }));

    let lastTime = performance.now();

    const render = (now) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = '#67e8f9';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 1.5, p.y + p.len);
        ctx.stroke();

        p.y += p.speed * (delta * 60);
        p.x -= 0.3 * (delta * 60);

        if (p.y > height) {
          p.y = -p.len;
          p.x = Math.random() * (width + 40);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  const offsetX = isMobile ? 0 : (mousePos.x || 0) * 10;
  const offsetY = isMobile ? 0 : (mousePos.y || 0) * 6;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#02040a]">
      {/* Container with Ken Burns & Parallax */}
      <div
        className="absolute inset-[-4%] w-[108%] h-[108%] transition-transform duration-700 ease-out will-change-transform"
        style={{
          transform: isMobile ? 'scale(1.02)' : `translate3d(${-offsetX}px, ${offsetY}px, 0) scale(1.03)`,
        }}
      >
        {/* Animated 60 FPS Video Loop */}
        <video
          ref={videoRef}
          key={activeWallpaper.video}
          src={activeWallpaper.video}
          poster={activeWallpaper.image}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoReady(true)}
          className={`w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.08] saturate-[1.12] transition-opacity duration-1000 ${
            isVideoReady ? 'opacity-90' : 'opacity-40'
          }`}
          style={{
            animation: isMobile ? 'none' : 'kenBurnsSubtle 35s ease-in-out infinite alternate',
          }}
        />

        {/* Fallback HD Image Poster if Video Still Buffering */}
        {!isVideoReady && (
          <img
            src={activeWallpaper.image}
            alt={activeWallpaper.title}
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.70] contrast-[1.08] saturate-[1.12]"
          />
        )}
      </div>

      {/* Gentle Particle Overlay */}
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-60"
        />
      )}

      {/* Cyber Subtle Dark Vignette & Mesh Tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#02040a]/90 via-transparent to-[#02040a]/75 opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#02040a_90%)] opacity-75" />
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[0.3px]" />
    </div>
  );
}

export default AnimatedWallpaperBackground;
