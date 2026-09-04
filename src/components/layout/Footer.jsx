import React from 'react';
import { Activity, ShieldCheck, Cpu, Wifi, HardDrive, Zap } from 'lucide-react';

export function Footer({ isCollapsed, fps = 412 }) {
  return (
    <footer
      className={`fixed bottom-0 right-0 z-20 h-10 border-t border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all duration-300 flex items-center justify-between px-6 text-xs text-slate-400 font-mono ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Realtime 400+ FPS Engine Benchmark */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30">
          <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-slate-300">ENGINE:</span>
          <span className="font-bold text-emerald-400">
            {fps} FPS (Ultra Smooth)
          </span>
        </div>

        {/* Engine status */}
        <div className="hidden sm:flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>WebGL 2.0 • 1.8ms Frame Time</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-pink-400" />
          <span>VRAM: 168 MB</span>
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
