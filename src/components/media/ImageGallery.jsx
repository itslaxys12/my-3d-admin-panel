import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ExternalLink, Sparkles, Filter, Check, Image as ImageIcon, Copy, RefreshCw } from 'lucide-react';
import { GALLERY_ITEMS } from '../../utils/constants';
import GlassCard from '../UI/GlassCard';
import AnimatedButton from '../UI/AnimatedButton';
import confetti from 'canvas-confetti';

export function ImageGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeImage, setActiveImage] = useState(null);
  const [activeBg, setActiveBg] = useState(() => localStorage.getItem('gmx_active_background') || '');
  const [copiedPromptId, setCopiedPromptId] = useState(null);

  const categories = ['All', 'GMX Brand', 'Dark Anime', 'Spider Cyber', '3D Planet'];

  const filteredItems =
    selectedCategory === 'All'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === selectedCategory);

  const handleDeployTexture = (item, e) => {
    if (e) e.stopPropagation();
    localStorage.setItem('gmx_active_background', item.url);
    setActiveBg(item.url);
    window.dispatchEvent(new CustomEvent('gmx-background-change', { detail: item.url }));

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00ff9d', '#00f0ff', '#a855f7'],
    });
  };

  const handleResetBackground = () => {
    localStorage.removeItem('gmx_active_background');
    setActiveBg('');
    window.dispatchEvent(new CustomEvent('gmx-background-change', { detail: '' }));
  };

  const copyPrompt = (item, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(item.prompt || item.description);
    setCopiedPromptId(item.id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* Category Filter Pills & Reset Background Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold font-mono text-slate-300">Filter By Layer:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(0,255,157,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {activeBg && (
          <button
            onClick={handleResetBackground}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-xs font-mono text-rose-300 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Default Galaxy</span>
          </button>
        )}
      </div>

      {/* 3D Perspective Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => {
            const isDeployed = activeBg === item.url;
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                key={item.id}
              >
                <GlassCard
                  glowColor={isDeployed ? 'emerald' : idx % 2 === 0 ? 'cyan' : 'purple'}
                  tiltEffect={true}
                  className={`group cursor-pointer p-4 overflow-hidden h-full flex flex-col justify-between transition-all ${
                    isDeployed ? 'ring-2 ring-emerald-400 shadow-[0_0_30px_rgba(0,255,157,0.35)]' : ''
                  }`}
                  onClick={() => setActiveImage(item)}
                >
                  {/* Image Container with futuristic overlay */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-slate-800 group-hover:border-emerald-500/40 transition-colors bg-black">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                    <div className="absolute top-2 right-2 p-1.5 rounded-xl bg-slate-900/80 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                      <Maximize2 className="w-4 h-4 text-emerald-400" />
                    </div>

                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono text-emerald-300 font-bold">
                      {item.tag}
                    </span>

                    {isDeployed && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950 text-[10px] font-mono font-black shadow-lg">
                        ● ACTIVE BG
                      </span>
                    )}
                  </div>

                  {/* Content info & AI Prompt */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors font-heading">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-sans">{item.description}</p>
                    </div>

                    {/* AI Prompt Snippet */}
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 font-bold">AI ART PROMPT:</span>
                        <button
                          onClick={(e) => copyPrompt(item, e)}
                          className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          {copiedPromptId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPromptId === item.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 line-clamp-2 italic">
                        "{item.prompt}"
                      </p>
                    </div>

                    {/* Deploy As Background Button */}
                    <button
                      onClick={(e) => handleDeployTexture(item, e)}
                      className={`w-full py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                        isDeployed
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,157,0.3)]'
                          : 'bg-slate-900 hover:bg-emerald-400 hover:text-slate-950 border border-slate-800 hover:border-emerald-300 text-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isDeployed ? 'Active Global 3D Texture' : 'Deploy As Background'}</span>
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Hologram Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl"
            onClick={() => setActiveImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full rounded-3xl overflow-hidden bg-slate-950 border-2 border-emerald-500/50 shadow-[0_0_60px_rgba(0,255,157,0.3)]"
            >
              <div className="relative aspect-video bg-black">
                <img
                  src={activeImage.url}
                  alt={activeImage.title}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setActiveImage(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 bg-slate-950 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold">
                        {activeImage.category}
                      </span>
                      <h3 className="text-xl font-bold text-slate-100 font-heading">{activeImage.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-sans">{activeImage.description}</p>
                  </div>

                  <button
                    onClick={(e) => { handleDeployTexture(activeImage, e); setActiveImage(null); }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:opacity-90 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_20px_rgba(0,255,157,0.4)] flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Deploy As 3D Background</span>
                  </button>
                </div>

                {/* Full Prompt Display */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-bold">FULL AI GENERATION PROMPT:</span>
                    <button
                      onClick={(e) => copyPrompt(activeImage, e)}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold"
                    >
                      {copiedPromptId === activeImage.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPromptId === activeImage.id ? 'Copied Prompt' : 'Copy Prompt'}</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-emerald-300/90 leading-relaxed">
                    {activeImage.prompt}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ImageGallery;
