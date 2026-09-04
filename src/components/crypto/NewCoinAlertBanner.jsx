import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Radio, Bell, Flame, ArrowUpRight, Volume2, VolumeX, Clock, Zap } from 'lucide-react';
import { NEW_MOONSHOT_COINS } from '../../utils/cryptoData';

export default function NewCoinAlertBanner({ onSelectCoin }) {
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false); // Sound muted by default
  const [lastAlertTime, setLastAlertTime] = useState('Just Now');
  const audioContextRef = useRef(null);

  // Synthesize cyber radar ping sound using Web Audio API (only if user explicitly enables sound)
  const playCyberPing = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {
      // Silent catch
    }
  };

  // Cycle alert notifications every 6 seconds (100% silent)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAlertIndex((prev) => {
        const next = (prev + 1) % NEW_MOONSHOT_COINS.length;
        return next;
      });
      // Do not play sound automatically
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const currentAlert = NEW_MOONSHOT_COINS[activeAlertIndex];

  return (
    <div className="space-y-3 font-sans">
      {/* Real-time Ticker Stream Marquee */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-950/90 border border-emerald-500/30 p-2.5 flex items-center gap-3 backdrop-blur-xl shadow-[0_0_25px_rgba(0,255,157,0.12)]">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Radio className="w-3.5 h-3.5" />
          LIVE RADAR
        </div>

        {/* Marquee Ticker */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 text-xs font-mono">
          {NEW_MOONSHOT_COINS.map((coin) => (
            <button
              key={coin.id}
              onClick={() => onSelectCoin && onSelectCoin(coin)}
              className={`flex items-center gap-2 px-3 py-1 rounded-xl transition-all flex-shrink-0 border ${
                coin.isFeatured
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 text-slate-300 hover:border-slate-700'
              }`}
            >
              <span className="font-bold text-white">${coin.symbol}</span>
              <span className="text-emerald-400 font-bold">+{coin.change24h}%</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
                {coin.targetMultiplier}
              </span>
              {coin.isFeatured && (
                <span className="text-[9px] bg-emerald-400 text-black px-1.5 py-0.2 rounded font-black uppercase">
                  FLAGSHIP
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Sound Ping Toggle */}
        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled) playCyberPing();
          }}
          className={`p-2 rounded-xl border transition-all flex-shrink-0 ${
            soundEnabled
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(0,255,157,0.3)]'
              : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Cyber Radar Audio Ping: ON' : 'Audio Ping: OFF'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* High-Impact New Listing Alert Card */}
      {currentAlert && (
        <div
          className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-2xl shadow-xl transition-all duration-300 ${
            currentAlert.isFeatured
              ? 'bg-gradient-to-r from-emerald-950/70 via-slate-950/90 to-purple-950/70 border-emerald-500/50 shadow-[0_0_30px_rgba(0,255,157,0.2)]'
              : 'bg-gradient-to-r from-purple-950/60 via-slate-950/90 to-slate-950/80 border-purple-500/40'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-mono font-black text-sm shadow-xl flex-shrink-0 ${
                currentAlert.isFeatured
                  ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(0,255,157,0.4)]'
                  : 'bg-purple-500/20 border border-purple-400/40 text-purple-300'
              }`}
            >
              {currentAlert.isFeatured ? <Zap className="w-6 h-6 text-emerald-400 animate-pulse" /> : <Flame className="w-6 h-6 text-amber-400" />}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  NEW GEM ALERT
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  Arrival: <strong>{currentAlert.launchTime}</strong>
                </span>
                <span className="text-xs font-mono text-purple-400">
                  Network: <strong>{currentAlert.chain} ({currentAlert.dex})</strong>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 mt-1">
                <h3 className="text-base font-extrabold text-white font-heading">
                  {currentAlert.name} <span className="font-mono text-cyan-300">(${currentAlert.symbol})</span>
                </h3>
                <span className="text-sm font-mono font-black text-emerald-400">
                  +{currentAlert.change24h}%
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30">
                  Predicted Upside: {currentAlert.targetMultiplier} ({currentAlert.targetPrice})
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onSelectCoin && onSelectCoin(currentAlert)}
              className={`px-5 py-2.5 rounded-xl font-mono text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg ${
                currentAlert.isFeatured
                  ? 'bg-emerald-400 text-black hover:bg-emerald-300 shadow-[0_0_20px_rgba(0,255,157,0.5)]'
                  : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white hover:opacity-90 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              }`}
            >
              <span>Scan & Analyze</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
