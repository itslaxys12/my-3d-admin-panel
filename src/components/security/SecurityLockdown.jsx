import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, AlertTriangle, Terminal, RefreshCw, Radio } from 'lucide-react';

export function SecurityLockdown({ remainingSeconds, onUnlock }) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(0, Math.min(100, ((180 - remainingSeconds) / 180) * 100));

  return (
    <div className="fixed inset-0 z-[99999] bg-[#030106] text-slate-100 flex flex-col items-center justify-center p-6 overflow-hidden select-none font-mono">
      {/* Background Matrix Red Cyber Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.15)_0,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(244,63,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(244,63,94,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Cyber Glitch Scanlines */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[size:100%_4px] opacity-60" />

      {/* Main Lockdown Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative max-w-lg w-full rounded-3xl bg-slate-950/95 border-2 border-rose-500/80 p-8 shadow-[0_0_80px_rgba(244,63,94,0.4)] text-center space-y-6 backdrop-blur-2xl"
      >
        {/* Pulsing Warning Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-500/10 border-2 border-rose-500/60 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.5)]">
          <ShieldAlert className="w-10 h-10 animate-pulse" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-xs text-rose-300 mb-2 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>SECURITY LEVEL 5 PROTOCOL TRIGGERED</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-rose-100 tracking-wider">
            SYSTEM LOCKDOWN
          </h1>
          <p className="text-xs text-rose-300/80 mt-1">
            Unauthorized Inspect Element / Developer Tools Detected.
          </p>
        </div>

        {/* 3-Minute Live Countdown Timer */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-rose-500/40 space-y-3">
          <span className="text-[11px] text-slate-400 block">SECURITY BAN DURATION REMAINING</span>
          <div className="text-5xl sm:text-6xl font-black font-mono text-rose-400 tracking-tight drop-shadow-[0_0_20px_rgba(244,63,94,0.8)]">
            {formatTime(remainingSeconds)}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-1000 rounded-full shadow-[0_0_10px_#f43f5e]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block">Auto-unlocks when timer reaches 00:00</span>
        </div>

        {/* Incident Telemetry Details */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Incident ID:</span>
            <span className="text-rose-400 font-bold">INC-DEVTOOLS-BAN-3M</span>
          </div>
          <div className="flex justify-between">
            <span>Clearance State:</span>
            <span className="text-rose-400 font-bold">REVOKED (3 MINUTES)</span>
          </div>
          <div className="flex justify-between">
            <span>Action Required:</span>
            <span className="text-slate-300">Close DevTools & wait for timer.</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Refreshing the browser will not bypass the countdown. Attempting to inspect code repeatedly will refresh the 3-minute lock.
        </p>
      </motion.div>
    </div>
  );
}

export default SecurityLockdown;
