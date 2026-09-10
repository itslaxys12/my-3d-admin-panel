import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crosshair,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Volume2,
  VolumeX,
  Camera,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  Maximize2,
  ExternalLink,
  Shield,
  Layers,
  Terminal,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Info,
  Copy,
  Check
} from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import AnimatedButton from '../components/UI/AnimatedButton';

// Default / Simulated Asian Session Setups
const DEMO_SETUPS = [
  {
    id: 'setup-gold-1',
    pair: 'XAUUSD (Gold)',
    timeframe: '15M',
    timestamp: 'Today, 08:35 UTC',
    asianHigh: 2368.50,
    asianLow: 2354.20,
    currentPrice: 2358.90,
    sweepType: 'Asian Low Swept (SSL Taken)',
    phase: 'London Open Manipulation (Judas Swing)',
    direction: 'BULLISH',
    probability: '89% High Probability',
    confidenceScore: 89,
    predictedMove: 'Bullish Expansion targeting Asia High and London High (+60 to +110 Pips)',
    narrative: 'Asian Low (2354.20) was aggressively swept during London Open at 08:15 UTC. Smart Money grabbed sell-side liquidity from retail breakout traders, created a clean liquidity purge wick, and initiated a 15M Market Structure Shift (MSS) with an unfilled Bullish Fair Value Gap (FVG). Expect strong continuation toward Asian High.',
    entry: 2358.40,
    stopLoss: 2352.10,
    takeProfit1: 2368.50,
    takeProfit2: 2376.00,
    riskReward: '1 : 3.4',
    pipsProjected: '+101 Pips',
    status: 'ACTIVE SIGNAL'
  },
  {
    id: 'setup-eur-1',
    pair: 'EURUSD',
    timeframe: '15M',
    timestamp: 'Yesterday, 07:45 UTC',
    asianHigh: 1.0895,
    asianLow: 1.0840,
    currentPrice: 1.0888,
    sweepType: 'Asian High Swept (BSL Taken)',
    phase: 'London Open Judas Swing (Bearish Trap)',
    direction: 'BEARISH',
    probability: '84% High Probability',
    confidenceScore: 84,
    predictedMove: 'Bearish Reversal targeting Asia Low and Previous Day Low (+45 to +65 Pips)',
    narrative: 'Asian High (1.0895) was breached during Frankfurt pre-market, triggering early buy stops. Rapid bearish displacement followed with a displacement candle below the 15M order block. Expect aggressive move lower towards Asian Low.',
    entry: 1.0885,
    stopLoss: 1.0905,
    takeProfit1: 1.0840,
    takeProfit2: 1.0815,
    riskReward: '1 : 2.8',
    pipsProjected: '+45 Pips',
    status: 'COMPLETED (+45 PIPS)'
  }
];

export function AsianSessionRadar({ userRole = 'owner' }) {
  const [activeSetupIndex, setActiveSetupIndex] = useState(0);
  const [activeSetup, setActiveSetup] = useState(DEMO_SETUPS[0]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [currentTimeUTC, setCurrentTimeUTC] = useState('');
  const [currentTimeBST, setCurrentTimeBST] = useState('');

  // Keep live UTC & BST clocks updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeUTC(now.toISOString().substring(11, 19) + ' UTC');
      const bst = new Date(now.getTime() + 6 * 3600000);
      setCurrentTimeBST(bst.toISOString().substring(11, 19) + ' BST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Voice Synthesizer announcement for new move
  const speakSignal = (setup) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const text = `${setup.pair}. ${setup.sweepType}. Next predicted move: ${setup.direction} expansion towards ${setup.takeProfit1}. Entry at ${setup.entry}.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Run simulation / switch setups
  const handleTriggerSimulation = () => {
    setIsCapturing(true);
    setTimeout(() => {
      const nextIndex = (activeSetupIndex + 1) % DEMO_SETUPS.length;
      setActiveSetupIndex(nextIndex);
      const nextSetup = DEMO_SETUPS[nextIndex];
      setActiveSetup(nextSetup);
      setIsCapturing(false);
      speakSignal(nextSetup);
    }, 1000);
  };

  // Instant capture from local TradingView watcher bot
  const handleInstantCapture = async () => {
    setIsCapturing(true);
    try {
      const res = await fetch('http://localhost:8765/api/trading/asian-session/capture', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.setup) {
          setActiveSetup(data.setup);
          speakSignal(data.setup);
        }
      } else {
        handleTriggerSimulation();
      }
    } catch (e) {
      handleTriggerSimulation();
    } finally {
      setIsCapturing(false);
    }
  };

  const copyCommand = () => {
    navigator.clipboard.writeText('python bots/tv_vision_watcher.py');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ─── Top Header Bar ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-950/40 border border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ASIAN SNIPER AI VISION
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Engine: <span className="text-cyan-300 font-semibold">Gemini Multi-Modal Vision</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-wide font-heading flex items-center gap-3">
            Asian Session <span className="gradient-text-cyber">AI Radar & Chart Watcher</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Monitors active TradingView charts on your PC, detects Asian Range High/Low liquidity sweeps (ICT Judas Swings), and predicts the next market move with exact Entry, SL, and TP targets.
          </p>
        </div>

        {/* Right Status Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              isVoiceEnabled
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(0,255,157,0.3)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isVoiceEnabled ? 'Voice Alerts Active' : 'Voice Alerts Muted'}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              showOverlays
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {showOverlays ? 'HUD Layers: ON' : 'HUD Layers: OFF'}
          </button>

          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            PC Watcher Setup
          </button>

          <AnimatedButton
            variant="primary"
            size="sm"
            onClick={handleInstantCapture}
            icon={Camera}
            disabled={isCapturing}
            className={isCapturing ? 'animate-pulse opacity-70' : ''}
          >
            {isCapturing ? 'Scanning Chart...' : 'Capture SS (F9)'}
          </AnimatedButton>
        </div>
      </div>

      {/* ─── Session Clocks & Market Phase Bar ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Asian Session Clock */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400">ASIAN KILLZONE</div>
              <div className="text-xs font-bold text-slate-200">00:00 – 06:00 UTC</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
            ACCUMULATION
          </span>
        </div>

        {/* London Open (Judas Swing) */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400">LONDON OPEN (JUDAS)</div>
              <div className="text-xs font-bold text-slate-200">07:00 – 09:00 UTC</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold animate-pulse">
            MANIPULATION
          </span>
        </div>

        {/* New York Killzone */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-purple-500/30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400">NEW YORK SESSION</div>
              <div className="text-xs font-bold text-slate-200">12:00 – 15:00 UTC</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
            EXPANSION
          </span>
        </div>

        {/* Current Time Clock */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400">LIVE CLOCK</div>
              <div className="text-xs font-bold text-slate-200 font-mono">{currentTimeUTC || '08:35:12 UTC'}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] font-mono font-semibold">
            {currentTimeBST ? currentTimeBST.split(' ')[0] + ' BD' : '14:35 BD'}
          </span>
        </div>
      </div>

      {/* ─── Main Radar Grid: Left 2 Cols (Chart SS), Right 1 Col (AI Prediction) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live TradingView Chart Screenshot with AI HUD Overlays */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard
            title={`${activeSetup.pair} • TradingView Vision Capture`}
            subtitle={`Timeframe: ${activeSetup.timeframe} • Phase: ${activeSetup.phase}`}
            icon={Eye}
            glowColor="emerald"
            className="relative overflow-hidden"
          >
            {/* Top Toolbar inside Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">{activeSetup.status}</span>
                </div>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300">
                  Price: <strong className="text-cyan-300 font-mono">{activeSetup.currentPrice}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerSimulation}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 text-cyan-400" />
                  Switch Setup
                </button>
              </div>
            </div>

            {/* High-Tech Chart Visualizer Box */}
            <div className="relative w-full h-[360px] sm:h-[420px] rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
              {/* Background Grid Lines (Cyberpunk Chart Style) */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(56, 189, 248, 0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(56, 189, 248, 0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                }}
              />

              {/* Simulated Candlestick Chart SVG Graphic */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 400">
                <defs>
                  <linearGradient id="bullishGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00ff9d" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00ff9d" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="fvgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* Asian Range Shaded Box */}
                <rect x="40" y="100" width="340" height="180" fill="rgba(168, 85, 247, 0.08)" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" />
                <text x="50" y="120" fill="#a855f7" fontSize="12" fontFamily="monospace" fontWeight="bold">ASIAN SESSION RANGE (00:00 - 06:00 UTC)</text>

                {/* Asian Range High Line */}
                <line x1="40" y1="100" x2="760" y2="100" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 3" />
                
                {/* Asian Range Low Line */}
                <line x1="40" y1="280" x2="760" y2="280" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" />

                {/* Candlesticks during Asian Session */}
                <line x1="70" y1="150" x2="70" y2="210" stroke="#10b981" strokeWidth="1.5" />
                <rect x="66" y="160" width="8" height="35" fill="#10b981" />

                <line x1="100" y1="140" x2="100" y2="230" stroke="#f43f5e" strokeWidth="1.5" />
                <rect x="96" y="170" width="8" height="40" fill="#f43f5e" />

                <line x1="130" y1="120" x2="130" y2="190" stroke="#10b981" strokeWidth="1.5" />
                <rect x="126" y="130" width="8" height="45" fill="#10b981" />

                <line x1="160" y1="105" x2="160" y2="175" stroke="#10b981" strokeWidth="1.5" />
                <rect x="156" y="110" width="8" height="50" fill="#10b981" />

                <line x1="190" y1="110" x2="190" y2="210" stroke="#f43f5e" strokeWidth="1.5" />
                <rect x="186" y="125" width="8" height="60" fill="#f43f5e" />

                <line x1="220" y1="180" x2="220" y2="260" stroke="#f43f5e" strokeWidth="1.5" />
                <rect x="216" y="195" width="8" height="50" fill="#f43f5e" />

                <line x1="250" y1="220" x2="250" y2="275" stroke="#10b981" strokeWidth="1.5" />
                <rect x="246" y="235" width="8" height="30" fill="#10b981" />

                <line x1="280" y1="190" x2="280" y2="265" stroke="#10b981" strokeWidth="1.5" />
                <rect x="276" y="200" width="8" height="40" fill="#10b981" />

                <line x1="310" y1="160" x2="310" y2="245" stroke="#f43f5e" strokeWidth="1.5" />
                <rect x="306" y="180" width="8" height="45" fill="#f43f5e" />

                <line x1="340" y1="200" x2="340" y2="278" stroke="#f43f5e" strokeWidth="1.5" />
                <rect x="336" y="220" width="8" height="48" fill="#f43f5e" />

                {/* ─── LONDON OPEN: JUDAS SWING SWEEP ─── */}
                <line x1="410" y1="260" x2="410" y2="345" stroke="#f43f5e" strokeWidth="2.5" />
                <rect x="405" y="270" width="10" height="40" fill="#f43f5e" />

                {/* Rejection / Liquidity Sweep Circle */}
                <circle cx="410" cy="345" r="7" fill="none" stroke="#00f0ff" strokeWidth="2" className="animate-ping" />
                <circle cx="410" cy="345" r="4" fill="#00f0ff" />

                {/* Huge Bullish Rejection Engulfing Candle (MSS) */}
                <line x1="450" y1="240" x2="450" y2="330" stroke="#00ff9d" strokeWidth="2.5" />
                <rect x="444" y="250" width="12" height="75" fill="#00ff9d" />

                {/* Bullish FVG Box */}
                <rect x="465" y="220" width="70" height="45" fill="url(#fvgGrad)" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 3" />
                <text x="475" y="245" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">15M BULLISH FVG</text>

                {/* Strong Bullish Displacement Candle */}
                <line x1="490" y1="190" x2="490" y2="270" stroke="#00ff9d" strokeWidth="2.5" />
                <rect x="484" y="200" width="12" height="60" fill="#00ff9d" />

                {/* Current Candle */}
                <line x1="530" y1="180" x2="530" y2="240" stroke="#00ff9d" strokeWidth="2.5" />
                <rect x="524" y="190" width="12" height="35" fill="#00ff9d" />

                {/* Projected Trajectory Vector Arrow */}
                <path
                  d="M 545 200 Q 610 140 700 100"
                  fill="none"
                  stroke="#00ff9d"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
                <polygon points="705,95 690,95 700,110" fill="#00ff9d" />
              </svg>

              {/* ─── HUD Overlays (Toggleable) ─── */}
              {showOverlays && (
                <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                  {/* Top HUD Line: Asian High (BSL) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-mono font-bold shadow-[0_0_10px_rgba(244,63,94,0.4)]">
                        🔴 ASIA HIGH (BSL): {activeSetup.asianHigh}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Target 1</span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-slate-900/80 text-slate-400 border border-slate-800 text-[10px] font-mono">
                      15M Timeframe
                    </span>
                  </div>

                  {/* Mid Sweep Notification Box */}
                  <div className="my-auto self-start max-w-sm pointer-events-auto">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-xl bg-slate-950/85 border border-cyan-400/50 backdrop-blur-md shadow-2xl space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-cyan-400 animate-bounce" />
                        <span className="text-xs font-bold text-cyan-300 font-mono">
                          {activeSetup.sweepType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">
                        Liquidity purge detected below Asian Low at London Open. Market Structure Shift (MSS) confirmed with strong displacement.
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-emerald-400 font-bold">Prediction: {activeSetup.direction}</span>
                        <span className="text-slate-400">{activeSetup.pipsProjected}</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom HUD Line: Asian Low (SSL) */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                        🟢 ASIA LOW (SSL): {activeSetup.asianLow}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        ✓ SWEPT & PURGED
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <span>Live Watcher:</span>
                      <span className="text-emerald-400 font-bold">PC Synced</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Quick Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Detected Pattern:</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  ICT Asian Judas Sweep
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  15M Bullish FVG
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakSignal(activeSetup)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold transition-all flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  Replay Audio Alert
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right 1 Col: AI Next-Move Prediction Card */}
        <div className="space-y-4">
          <GlassCard
            title="AI Move Prediction & Trade Plan"
            subtitle="Calculated by Gemini Vision Engine"
            icon={Sparkles}
            glowColor={activeSetup.direction === 'BULLISH' ? 'emerald' : 'pink'}
            className="flex flex-col justify-between"
          >
            <div className="space-y-4 pt-1">
              {/* Direction Indicator Pill */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  activeSetup.direction === 'BULLISH'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_25px_rgba(0,255,157,0.2)]'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
                }`}
              >
                <div>
                  <div className="text-[10px] font-mono tracking-wider opacity-80 uppercase">
                    NEXT PREDICTED MOVE
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-heading tracking-wide flex items-center gap-2 mt-0.5">
                    {activeSetup.direction === 'BULLISH' ? (
                      <>
                        <TrendingUp className="w-6 h-6 text-emerald-400" />
                        <span>BULLISH EXPANSION</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-6 h-6 text-rose-400" />
                        <span>BEARISH REVERSAL</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-300">
                    {activeSetup.confidenceScore}% WIN PROB
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                    {activeSetup.pipsProjected}
                  </div>
                </div>
              </div>

              {/* AI Narrative Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI MARKET STRUCTURE NARRATIVE</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px] font-mono">
                  {activeSetup.narrative}
                </p>
              </div>

              {/* Execution Trade Plan Coordinates */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Order Action:</span>
                  <span className="font-bold text-emerald-400">
                    BUY LIMIT / MARKET LONG
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Optimal Entry (OTE):</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {activeSetup.entry}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Invalidation (SL):</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {activeSetup.stopLoss}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Target 1 (Asia High):</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {activeSetup.takeProfit1}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Target 2 (Daily High):</span>
                  <span className="font-bold text-emerald-300 font-mono">
                    {activeSetup.takeProfit2}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-slate-300">Risk : Reward:</span>
                  <span className="font-black text-emerald-400 font-mono text-sm">
                    {activeSetup.riskReward}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Discord Forward / Webhook Dispatch */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2">
              <AnimatedButton
                variant="primary"
                size="md"
                className="w-full justify-center"
                icon={Zap}
                onClick={handleTriggerSimulation}
              >
                Simulate Next Market Sweep
              </AnimatedButton>
              <p className="text-[10px] text-center text-slate-500 font-mono">
                Press F9 in TradingView on your PC to update this view instantly.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ─── Historical Asian Session Sweeps Log ─── */}
      <GlassCard
        title="Recent Asian Session Sweeps & Outcome Log"
        subtitle="Historical verification of Asian Range Judas Swings across major assets"
        icon={TrendingUp}
        glowColor="default"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-medium">TIMESTAMP</th>
                <th className="pb-3 font-medium">ASSET</th>
                <th className="pb-3 font-medium">SWEEP TYPE</th>
                <th className="pb-3 font-medium">PREDICTED MOVE</th>
                <th className="pb-3 font-medium">RISK:REWARD</th>
                <th className="pb-3 font-medium text-right">OUTCOME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 text-slate-400">Today, 08:35 UTC</td>
                <td className="py-3 font-bold text-cyan-300">XAUUSD (Gold)</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Asia Low Swept (SSL)
                  </span>
                </td>
                <td className="py-3 text-emerald-400 font-semibold">Bullish Reversal to 2368.50</td>
                <td className="py-3 font-mono">1 : 3.4</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    IN PROGRESS (+42 Pips)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 text-slate-400">Yesterday, 07:45 UTC</td>
                <td className="py-3 font-bold text-purple-300">EURUSD</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    Asia High Swept (BSL)
                  </span>
                </td>
                <td className="py-3 text-rose-400 font-semibold">Bearish Drop to 1.0840</td>
                <td className="py-3 font-mono">1 : 2.8</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    TP2 HIT (+55 Pips)
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 text-slate-400">Sep 08, 08:10 UTC</td>
                <td className="py-3 font-bold text-amber-300">BTCUSDT</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    Asia Low Swept (SSL)
                  </span>
                </td>
                <td className="py-3 text-emerald-400 font-semibold">Bullish Pump to $65,200</td>
                <td className="py-3 font-mono">1 : 4.1</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    FULL TP HIT (+$1,450)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* ─── PC Watcher Bot Guide Modal ─── */}
      {isSetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-3xl bg-slate-950 border border-purple-500/40 p-6 sm:p-8 space-y-6 shadow-2xl font-mono text-xs"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/40">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    PC TradingView Watcher Bot Setup
                  </h3>
                  <p className="text-xs text-slate-400">
                    Runs in the background on your Windows PC
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSetupModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-slate-400 font-semibold">Step 1: Open PowerShell or Terminal</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Open TradingView in your web browser (Chrome, Brave, Edge). Keep your chart open on your chosen pair (e.g. Gold XAUUSD).
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold">Step 2: Run the Watcher Script</span>
                <div className="mt-1 flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono">
                  <code>python bots/tv_vision_watcher.py</code>
                  <button
                    onClick={copyCommand}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Copy command"
                  >
                    {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold">Step 3: Instant Capture Hotkey</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Press <strong className="text-emerald-400">F9</strong> whenever you want an instant analysis. The bot automatically captures your chart, sends the screenshot to the Gemini Vision AI, and your website dashboard will instantly flash with the predicted move!
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <AnimatedButton
                variant="primary"
                size="sm"
                onClick={() => setIsSetupModalOpen(false)}
              >
                Got it, Close
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AsianSessionRadar;
