import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Play, Pause, Music, Sliders, ExternalLink, Sparkles, X, Check } from 'lucide-react';

/**
 * BackgroundMusicPlayer:
 * Plays ambient welcome theme audio when users enter the website.
 * Allows owner to configure custom song links, adjust volume, or mute.
 */
export function BackgroundMusicPlayer({ isOwner = false }) {
  const [songUrl, setSongUrl] = useState(() => {
    return localStorage.getItem('gmx_bg_song_url') || '/assets/audio/love_me_not.mp3';
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('gmx_bg_song_vol');
    return saved ? parseFloat(saved) : 0.50;
  });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [userInteracted, setUserInteracted] = useState(false);
  const audioRef = useRef(null);

  const songTitle = songUrl.includes('love_me_not')
    ? 'Ravyn Lenae - Love Me Not'
    : 'Ambient Cyber Theme';

  // Auto-start on first user interaction anywhere on page (browser policy compliance)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!userInteracted) {
        setUserInteracted(true);
        if (audioRef.current && !isPlaying) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Autoplay blocked without user gesture
          });
        }
      }
    };

    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [userInteracted, isPlaying]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const handleSaveSongUrl = (targetUrl) => {
    const urlToUse = typeof targetUrl === 'string' ? targetUrl : newUrlInput.trim();
    if (!urlToUse) return;
    setSongUrl(urlToUse);
    localStorage.setItem('gmx_bg_song_url', urlToUse);
    setShowConfigModal(false);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 200);
  };

  return (
    <>
      {/* Hidden HTML5 Audio Element for Background Song */}
      <audio
        ref={audioRef}
        src={songUrl}
        loop
        playsInline
      />

      {/* Floating Cyber Audio Widget Pill */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 p-2 px-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,240,255,0.2)] text-xs font-mono">
        {/* Animated Waveform Equalizer */}
        <div className="flex items-center gap-0.5 h-4 w-4">
          <span className={`w-0.5 bg-cyan-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-4 animate-pulse' : 'h-1'}`} />
          <span className={`w-0.5 bg-emerald-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-3 animate-bounce' : 'h-1.5'}`} />
          <span className={`w-0.5 bg-purple-400 rounded-full transition-all duration-300 ${isPlaying ? 'h-4 animate-pulse' : 'h-1'}`} />
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:text-cyan-300 hover:border-cyan-400 transition-all"
          title={isPlaying ? 'Pause Background Song' : 'Play Background Song'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>

        {/* Mute/Unmute */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
        </button>

        {/* Mini Volume Slider */}
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
            localStorage.setItem('gmx_bg_song_vol', v.toString());
          }}
          className="w-14 sm:w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />

        {/* Dynamic Song Title Label */}
        <span className="text-[11px] text-slate-300 hidden sm:inline font-semibold max-w-[170px] truncate">
          {isPlaying ? `♪ ${songTitle}` : '♪ Audio Ready'}
        </span>

        {/* Owner Song Customizer Button */}
        {isOwner && (
          <button
            onClick={() => {
              setNewUrlInput(songUrl);
              setShowConfigModal(true);
            }}
            className="p-1 px-2 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/40 text-[10px] font-bold transition-all ml-1 shrink-0"
            title="Configure Background Song Link"
          >
            Change Song
          </button>
        )}
      </div>

      {/* Song Link Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-slate-950 border border-cyan-500/40 p-6 shadow-2xl space-y-4 font-mono text-xs text-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Music className="w-4 h-4 text-cyan-400" />
                  <span>Configure Background Soundtrack</span>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveSongUrl('/assets/audio/love_me_not.mp3')}
                    className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/40 text-left hover:bg-cyan-500/20 flex items-center justify-between transition-all"
                  >
                    <div>
                      <div className="text-cyan-300 font-bold">🎵 Ravyn Lenae - Love Me Not</div>
                      <div className="text-[10px] text-slate-400">High-Definition 192kbps Soundtrack</div>
                    </div>
                    <Check className="w-4 h-4 text-cyan-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveSongUrl('/assets/videos/earth_planet.mp4')}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-left hover:border-slate-500 transition-all"
                  >
                    <div className="text-slate-200 font-bold">🌌 Cyber Ambient Earth Theme</div>
                    <div className="text-[10px] text-slate-400">Atmospheric Sci-Fi Background Audio</div>
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveSongUrl(newUrlInput); }} className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Or Enter Custom Audio / Stream URL:</label>
                  <input
                    type="text"
                    value={newUrlInput}
                    onChange={(e) => setNewUrlInput(e.target.value)}
                    placeholder="https://... or /assets/audio/..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none text-xs"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Play Song</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BackgroundMusicPlayer;
