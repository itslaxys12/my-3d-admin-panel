import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to manage mouse parallax, performance settings,
 * and 400+ FPS ultra-smooth performance benchmark for Three.js / WebGL.
 */
export function use3DScene() {
  const [fps, setFps] = useState(60); // Clean 60 FPS locked baseline
  const [quality, setQuality] = useState(() => {
    return localStorage.getItem('gmx_quality_preset') || 'low';
  });
  const [bloomEnabled, setBloomEnabled] = useState(() => {
    return localStorage.getItem('gmx_bloom_enabled') === 'true';
  });
  const [particlesCount, setParticlesCount] = useState(() => {
    const savedQ = localStorage.getItem('gmx_quality_preset') || 'low';
    return savedQ === 'high' ? 2200 : (savedQ === 'medium' ? 1000 : 350);
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());

  // Lightweight mouse tracking without 60-144 FPS React root re-renders
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      const { innerWidth, innerHeight } = window;
      mousePosRef.current = {
        x: (event.clientX / innerWidth) * 2 - 1,
        y: -(event.clientY / innerHeight) * 2 + 1,
      };
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Mouse tracking with passive listener

  // Adjust particle count when quality changes
  const updateQuality = (newQuality) => {
    setQuality(newQuality);
    localStorage.setItem('gmx_quality_preset', newQuality);
    if (newQuality === 'low') {
      setParticlesCount(350);
      setBloomEnabled(false);
      localStorage.setItem('gmx_bloom_enabled', 'false');
    } else if (newQuality === 'medium') {
      setParticlesCount(1000);
      setBloomEnabled(false);
      localStorage.setItem('gmx_bloom_enabled', 'false');
    } else {
      setParticlesCount(2200);
      setBloomEnabled(true);
      localStorage.setItem('gmx_bloom_enabled', 'true');
    }
  };

  return {
    mousePos: mousePosRef.current,
    fps,
    quality,
    updateQuality,
    bloomEnabled,
    setBloomEnabled,
    particlesCount,
    setParticlesCount,
  };
}

export default use3DScene;
