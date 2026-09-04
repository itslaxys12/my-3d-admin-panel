import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position, scroll progress (0-1),
 * scroll direction, and velocity for 3D/CSS animations.
 */
export function useScrollAnimation() {
  const [scrollData, setScrollData] = useState({
    scrollY: 0,
    progress: 0,
    direction: 'down',
    isScrolling: false,
    velocity: 0,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let scrollTimeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = performance.now();
      const timeDelta = currentTime - lastTime || 16;
      const distance = currentScrollY - lastScrollY;
      const velocity = Math.abs(distance / timeDelta);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? Math.min(Math.max(currentScrollY / totalHeight, 0), 1) : 0;

      setScrollData({
        scrollY: currentScrollY,
        progress,
        direction: currentScrollY > lastScrollY ? 'down' : 'up',
        isScrolling: true,
        velocity,
      });

      lastScrollY = currentScrollY;
      lastTime = currentTime;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setScrollData((prev) => ({
          ...prev,
          isScrolling: false,
          velocity: 0,
        }));
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return scrollData;
}

export default useScrollAnimation;
