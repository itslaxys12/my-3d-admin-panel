import React from 'react';
import { Activity, ShieldCheck, Wifi, Zap } from 'lucide-react';

export function Footer({ isCollapsed, fps = 412 }) {
  return (
    <footer
      className={`fixed bottom-0 right-0 z-20 h-10 border-t border-cyan-500/20 bg-slate-950/45 backdrop-blur-xl transition-all duration-300 flex items-center justify-between px-3 sm:px-6 text-xs text-slate-400 font-mono left-0 ${
        isCollapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Realtime FPS & Ultra Smooth */}
        <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
          <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="font-bold text-emerald-400">
            {fps} FPS
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-300 font-semibold">
            Ultra Smooth
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Wifi className="w-3.5 h-3.5" />
          <span>Gateway: 14ms</span>
        </div>
        <span className="text-slate-500">|</span>
        <span className="text-cyan-400 font-semibold">Glitch Matrix v3.2</span>
      </div>
    </footer>
  );
}

export default Footer;
