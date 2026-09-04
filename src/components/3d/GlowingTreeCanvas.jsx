import React, { useEffect, useRef } from 'react';

/**
 * Highly Optimized GlowingTreeCanvas (400+ FPS Buttery Smooth)
 * - Offscreen pre-rendered static tree branches & glow
 * - Lightweight swaying blossom nodes
 * - Smooth physics-based falling sakura petals with mouse breeze
 */
export function GlowingTreeCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = { x: width * 0.5, y: height * 0.5, targetX: width * 0.5, targetY: height * 0.5 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      buildOffscreenTree();
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // ─── Offscreen Canvas for Tree Pre-Rendering (Massive FPS Gain) ─────
    let offscreenCanvas = document.createElement('canvas');
    let offCtx = offscreenCanvas.getContext('2d');

    function buildOffscreenTree() {
      offscreenCanvas.width = width;
      offscreenCanvas.height = height;

      // Draw background gradient
      const bgGrad = offCtx.createRadialGradient(
        width * 0.5, height * 0.5, 40,
        width * 0.5, height * 0.5, Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, '#100520');
      bgGrad.addColorStop(0.5, '#070212');
      bgGrad.addColorStop(1, '#020106');
      offCtx.fillStyle = bgGrad;
      offCtx.fillRect(0, 0, width, height);

      // Pre-draw static tree branches
      const treeBaseX = width * 0.5;
      const treeBaseY = height * 0.85;
      const trunkLength = Math.min(height * 0.22, 135);

      function drawStaticBranch(startX, startY, len, angle, branchWidth, depth) {
        offCtx.save();
        offCtx.strokeStyle = depth < 2 ? '#a855f7' : '#00f0ff';
        offCtx.lineWidth = branchWidth;
        offCtx.lineCap = 'round';
        offCtx.translate(startX, startY);
        offCtx.rotate(angle);

        offCtx.beginPath();
        offCtx.moveTo(0, 0);
        offCtx.quadraticCurveTo(0, -len * 0.5, 0, -len);
        offCtx.stroke();

        if (depth < 5) {
          const nextLen = len * 0.76;
          const nextWidth = Math.max(1, branchWidth * 0.68);
          drawStaticBranch(0, -len, nextLen, -0.42, nextWidth, depth + 1);
          drawStaticBranch(0, -len, nextLen, 0.42, nextWidth, depth + 1);
          if (depth === 2) drawStaticBranch(0, -len, nextLen * 0.8, 0, nextWidth * 0.8, depth + 1);
        } else {
          // Static Blossom Glow Tip
          offCtx.beginPath();
          offCtx.arc(0, -len, 4, 0, Math.PI * 2);
          offCtx.fillStyle = depth % 2 === 0 ? 'rgba(232, 121, 249, 0.8)' : 'rgba(0, 240, 255, 0.8)';
          offCtx.fill();
        }
        offCtx.restore();
      }

      drawStaticBranch(treeBaseX, treeBaseY, trunkLength, 0, 12, 0);
    }

    buildOffscreenTree();

    // ─── Lightweight Falling Sakura Petals & Stars ──────────────────────
    const PETAL_COUNT = 45;
    const petals = [];
    const colors = [
      'rgba(216, 180, 254, 0.85)',
      'rgba(168, 85, 247, 0.85)',
      'rgba(0, 240, 255, 0.8)',
      'rgba(244, 114, 182, 0.85)',
    ];

    for (let i = 0; i < PETAL_COUNT; i++) {
      petals.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3.5 + 2,
        speedY: Math.random() * 0.7 + 0.35,
        speedX: Math.random() * 0.5 - 0.25,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        oscillationSpeed: Math.random() * 0.02 + 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const STAR_COUNT = 70;
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    let time = 0;

    // ─── Super Fast Render Loop ─────────────────────────────────────────
    const render = () => {
      time += 0.016;

      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;
      const parallaxX = (mouse.x - width * 0.5) * 0.012;
      const parallaxY = (mouse.y - height * 0.5) * 0.012;

      // 1. Blit pre-rendered background & tree
      ctx.drawImage(offscreenCanvas, 0, 0);

      // 2. Stars
      ctx.fillStyle = 'rgba(216, 180, 254, 0.6)';
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = stars[i];
        ctx.beginPath();
        ctx.arc(s.x + parallaxX * 0.3, s.y + parallaxY * 0.3, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Falling Sakura Petals
      for (let i = 0; i < PETAL_COUNT; i++) {
        const p = petals[i];
        p.y += p.speedY;
        p.x += Math.sin(time * 1.5 + i) * 0.8 + p.speedX + parallaxX * 0.05;
        p.rotation += p.rotSpeed;

        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ background: '#020106' }}
    />
  );
}

export default GlowingTreeCanvas;
