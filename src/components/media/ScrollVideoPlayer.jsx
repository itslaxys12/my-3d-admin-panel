import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import GlassCard from '../UI/GlassCard';

/**
 * ScrollVideoPlayer:
 * Ultra-smooth, high-framerate media playback synchronized with viewport scroll depth
 * and 1-click full screen capability with audio controls.
 */
export function ScrollVideoPlayer({
  videoSrc = '/assets/videos/earth_planet.mp4',
  title = '3D Planet Earth & Universe Hologram Stream',
  subtitle = 'Playback velocity, orbital perspective, and frame scrubbing synchronized with viewport scroll depth',
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [scrollSync, setScrollSync] = useState(true);
  const [scrubProgress, setScrubProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState('00:00');
  const [durationStr, setDurationStr] = useState('00:00');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleTimeUpdate = () => {
    const vid = videoRef.current;
    if (!vid || !vid.duration) return;
    setCurrentTimeStr(formatTime(vid.currentTime));
    setDurationStr(formatTime(vid.duration));
    if (!scrollSync) {
      setScrubProgress(vid.currentTime / vid.duration);
    }
  };

  // Scroll Sync Listener
  useEffect(() => {
    if (!scrollSync) return;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Progress inside viewport (0 when entering bottom, 1 when exiting top)
      const visibleRange = windowHeight + rect.height;
      const currentPos = windowHeight - rect.top;
      const progress = Math.min(Math.max(currentPos / visibleRange, 0), 1);

      setScrubProgress(progress);

      if (videoRef.current && videoRef.current.duration) {
        videoRef.current.currentTime = progress * videoRef.current.duration;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollSync]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;

    if (isPlaying) {
      vid.pause();
      setIsPlaying(false);
    } else {
      vid.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setScrollSync(false);
    setScrubProgress(val);
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = val * videoRef.current.duration;
    }
  };

  return (
    <GlassCard
      title={title}
      subtitle={subtitle}
      glowColor="cyan"
      className="w-full"
    >
      <div
        ref={containerRef}
        className={`relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#02050f] flex flex-col items-center justify-between shadow-[0_0_50px_rgba(0,240,255,0.15)] ${
          isFullscreen ? 'h-screen w-screen rounded-none z-[99999]' : 'aspect-video'
        }`}
      >
        {/* Top Header HUD Bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>FRAME SCRUB: {Math.round(scrubProgress * 100)}%</span>
            <span className="text-slate-500 hidden sm:inline">• 1080p Stream</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScrollSync((prev) => !prev)}
              className={`px-3 py-1 rounded-xl text-xs font-mono border backdrop-blur-md transition-all ${
                scrollSync
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-950/80 border-slate-700 text-slate-400'
              }`}
            >
              {scrollSync ? '● Scroll Sync: ON' : '○ Scroll Sync: OFF'}
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 text-xs font-mono transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Video Viewport: Click anywhere to Play/Pause */}
        <div
          onClick={togglePlay}
          className="relative w-full h-full flex-1 flex items-center justify-center cursor-pointer bg-black"
        >
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-contain max-h-[85vh] transform-gpu"
          />

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10">
              <div className="w-16 h-16 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.8)] animate-pulse">
                <Play className="w-8 h-8 ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Cyber Control Bar */}
        <div className="relative z-20 w-full p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent flex flex-col gap-2">
          {/* Timeline Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-cyan-300 font-bold">{currentTimeStr}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.002"
              value={scrubProgress}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <span className="text-[11px] font-mono text-slate-400">{durationStr}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all text-xs font-mono flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setScrubProgress(0);
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                title="Reset Position"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-xl border transition-colors ${
                  !isMuted
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  setIsMuted(false);
                }}
                className="w-16 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-all"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default ScrollVideoPlayer;
