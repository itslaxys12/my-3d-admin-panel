import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Radio,
  Globe,
  Film,
  RotateCcw
} from 'lucide-react';
import { EARTH_GEO_NODES } from '../../utils/constants';

/**
 * InteractiveEarth:
 * High-definition cinematic space & planet video player (Zero Lag, Edge-to-Edge Theater Mode).
 * Directly displays the user's requested video with click-to-play, audio controls,
 * and 1-click full screen without spinning obstruction.
 */
export function InteractiveEarth({
  height = '560px',
  showControls = true,
  title = '3D Universe & Planet Earth Cinematic Stream',
  videoSrc = '/assets/videos/earth_planet.mp4',
}) {
  const [activeNode, setActiveNode] = useState(EARTH_GEO_NODES[0]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showHud, setShowHud] = useState(true);

  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Sync volume with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setShowHud(true)}
      onMouseLeave={() => setShowHud(true)}
      className={`relative w-full rounded-2xl overflow-hidden bg-[#02040b] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.15)] flex flex-col justify-between select-none ${
        isFullscreen ? 'h-screen w-screen rounded-none border-none z-[99999]' : ''
      }`}
      style={{ minHeight: isFullscreen ? '100vh' : height }}
    >
      {/* Top Header HUD */}
      <div className={`relative z-20 p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${
        showHud ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shadow-[0_0_10px_#00ff9d]" />
          <span className="font-mono font-bold text-xs sm:text-sm text-cyan-300 tracking-wide">
            {title}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono hidden sm:inline">
            1080p Ultra HD
          </span>
        </div>

        {/* Quick HUD Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Unmute / Mute */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-semibold transition-all ${
              !isMuted
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_12px_rgba(0,255,157,0.3)]'
                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
            }`}
            title={isMuted ? 'সাউন্ড চালু করুন (Unmute)' : 'সাউন্ড বন্ধ করুন (Mute)'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Sound OFF' : 'Sound ON'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] text-xs font-mono transition-all"
            title="ফুলস্ক্রিন করুন (Fullscreen)"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Main Full-Size Cinematic Video Screen */}
      <div
        onClick={togglePlay}
        className="relative flex-1 w-full h-full flex items-center justify-center bg-black cursor-pointer overflow-hidden group"
      >
        {/* The Direct Video Stream (Smooth 60fps Zero-Lag H.264) */}
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          className="w-full h-full object-contain max-h-[85vh] transition-all transform-gpu"
        />

        {/* Center Play Indicator on Hover / Pause */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all z-10">
            <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-black flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.7)] animate-pulse">
              <Play className="w-8 h-8 ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Cyber Player Control Bar */}
      <div className={`relative z-20 p-3.5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent border-t border-slate-800/80 flex flex-col gap-2 transition-opacity duration-300 ${
        showHud ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Timeline Slider */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-cyan-300 font-bold">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
          <span className="text-slate-400">{formatTime(duration)}</span>
        </div>

        {/* Controls Row */}
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
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs"
              title="রিওয়াইন্ড (Replay from start)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-all"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
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
              className="w-16 sm:w-24 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />

            {/* Fullscreen Button in bar */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-all ml-1"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Focus Node telemetry strip */}
        {showControls && (
          <div className="flex items-center justify-between pt-1 text-[11px] font-mono border-t border-slate-800/80 text-slate-400 overflow-x-auto gap-2">
            <div className="flex items-center gap-1 shrink-0">
              <Radio className="w-3 h-3 text-cyan-400" />
              <span>Telemetry Node:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {EARTH_GEO_NODES.map((node) => (
                <button
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNode(node);
                  }}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    activeNode?.id === node.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-bold'
                      : 'hover:text-slate-200'
                  }`}
                >
                  {node.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <span className="text-emerald-400 font-bold shrink-0">● HD 60 FPS Video Stream</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default InteractiveEarth;
