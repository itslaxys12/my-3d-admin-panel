import React from 'react';
import { X, Check, Sparkles, Image, Play } from 'lucide-react';
import { WALLPAPER_LIST } from './AnimatedWallpaperBackground';

export function WallpaperSwitcherModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const currentId = localStorage.getItem('gmx_active_wallpaper') || 'large-cherry-blossom-tree';

  const selectWallpaper = (id) => {
    localStorage.setItem('gmx_active_wallpaper', id);
    window.dispatchEvent(new CustomEvent('gmx_wallpaper_changed', { detail: id }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-950/90 border border-emerald-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,255,157,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading tracking-wide">
                Anime & Nature Live Wallpapers (MotionBGS)
              </h2>
              <p className="text-xs text-slate-400">
                Choose from 7 HD 60 FPS animated moving wallpapers with real-time video looping
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallpaper Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WALLPAPER_LIST.map((wp) => {
            const isSelected = wp.id === currentId;
            return (
              <div
                key={wp.id}
                onClick={() => selectWallpaper(wp.id)}
                className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 transform hover:scale-[1.02] ${
                  isSelected
                    ? 'border-emerald-400 shadow-[0_0_20px_rgba(0,255,157,0.4)] ring-2 ring-emerald-400/50'
                    : 'border-slate-800 hover:border-cyan-500/50 hover:shadow-lg'
                }`}
              >
                {/* Image Poster preview */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={wp.image}
                    alt={wp.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-black/60 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                    {wp.category}
                  </span>

                  {/* Active Badge */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500 text-black flex items-center gap-1 shadow-lg">
                      <Check className="w-3 h-3 stroke-[3]" /> Active
                    </span>
                  )}

                  {/* Video Play indicator */}
                  <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Play className="w-3 h-3 fill-emerald-400" />
                  </div>
                </div>

                {/* Footer Label */}
                <div className="p-3 bg-slate-900/90 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {wp.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">60 FPS</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>✨ Wallpapers are cached locally for zero internet lag.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(0,255,157,0.3)]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default WallpaperSwitcherModal;
