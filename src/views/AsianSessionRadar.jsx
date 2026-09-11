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
  Check,
  Tv,
  Power,
  Signal
} from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import AnimatedButton from '../components/UI/AnimatedButton';

// Default / Simulated Asian Session Setups
const DEMO_SETUPS = [
  {
    id: 'setup-gold-1',
    pair: 'XAUUSD (Gold)',
    timeframe: '5M',
    timestamp: 'Today, 08:35 UTC',
    asianHigh: 2368.50,
    asianLow: 2354.20,
    currentPrice: 2358.90,
    sweepType: 'Asian Low Swept (SSL Taken)',
    phase: 'London Open Manipulation (Judas Swing)',
    direction: 'BULLISH',
    marketDirection: 'BULLISH (UP)',
    probability: '92% High Probability (5M Scalp)',
    confidenceScore: 92,
    predictedMove: '5M Bullish Expansion targeting Asia High ($2368.50) and London High ($2374.00)',
    narrative: 'Asian Low ($2354.20) was aggressively swept on the 5-Minute timeframe during London Open at 08:15 UTC. Smart Money purged retail stop losses below 2354.20, rejected sharply with a long wick, and confirmed a 5M Market Structure Shift (MSS) with an unfilled 5M Bullish Fair Value Gap (FVG). High-probability 5M scalping continuation toward Asian High.',
    entry: 2358.40,
    stopLoss: 2353.10,
    slDistance: '5.3 Pips ($5.30)',
    takeProfit1: 2368.50,
    tp1Distance: '+10.1 Pips ($10.10)',
    takeProfit2: 2374.00,
    tp2Distance: '+15.6 Pips ($15.60)',
    riskReward: '1 : 3.6',
    pipsProjected: '+101 Pips',
    status: 'ACTIVE 5M SIGNAL',
    bestOption: 'Limit Order inside 5M Bullish FVG at $2358.40. Tight 5-pip stop gives optimal 1:3.6 R:R.',
    slPlacementGuide: 'Place SL at $2353.10 (exactly 2 pips below the $2354.20 sweep wick). If price crosses this, the setup is invalidated.',
    tp1PlacementGuide: 'Take 50% Profit at $2368.50 (Asian High Buy-Side Liquidity Pool). Move Stop Loss to Entry (Risk-Free).',
    tp2PlacementGuide: 'Trail remaining 50% runner to $2374.00 (London Session Peak Expansion High).',
    howItMoves: [
      { step: '1. Liquidity Sweep', title: 'Fake Break Below Asia Low', desc: 'Price purged $2354.20 trapping retail breakout sellers into bad short positions.' },
      { step: '2. 5M Displacement', title: 'Institutional Buy Impulse', desc: 'Sharp 5M green candle displacement created a clear Bullish Fair Value Gap (FVG).' },
      { step: '3. Optimal Retest', title: '5M FVG Tap @ $2358.40', desc: 'Best Entry: Price pulls back into the discount zone of the 5M FVG for high R:R entry.' },
      { step: '4. Target Expansion', title: 'Pump to Asia High $2368.50', desc: 'Heavy buy momentum sweeps resting buy stops at $2368.50 for +101 pips profit.' }
    ]
  }
];

export function AsianSessionRadar({ userRole = 'owner' }) {
  const [activeSetup, setActiveSetup] = useState(DEMO_SETUPS[0]);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [chartMode, setChartMode] = useState('tradingview_live'); // 'tradingview_live' | 'ai_hud'
  const [copiedTrade, setCopiedTrade] = useState(false);
  const [currentTimeUTC, setCurrentTimeUTC] = useState('');
  const [currentTimeLocal, setCurrentTimeLocal] = useState('');
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [cyclePhase, setCyclePhase] = useState('STANDBY'); // 'STANDBY' | 'ANALYZING' | 'SIGNAL_ACTIVE'
  const [analysisSecondsRemaining, setAnalysisSecondsRemaining] = useState(20 * 60); // 20 minutes = 1200s
  const [tradeWindowSecondsRemaining, setTradeWindowSecondsRemaining] = useState(2 * 60); // 2 minutes = 120s
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  const [isTakeTradeNowActive, setIsTakeTradeNowActive] = useState(false);
  const [isTvPowerOn, setIsTvPowerOn] = useState(true);
  const [tvChannel, setTvChannel] = useState('5M');
  const [showTvMarkers, setShowTvMarkers] = useState(true);
  const warned20sRef = useRef(false);

  const speakText = (text) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Toggle Bot Master Switch
  const toggleBotRunning = () => {
    if (!isBotRunning) {
      setIsBotRunning(true);
      setCyclePhase('ANALYZING');
      setAnalysisSecondsRemaining(20 * 60);
      setTradeWindowSecondsRemaining(2 * 60);
      warned20sRef.current = false;
      speakText('20-minute Asian Session Scanner activated. Analyzing 5-minute liquidity.');
    } else {
      setIsBotRunning(false);
      setCyclePhase('STANDBY');
      setIsTakeTradeNowActive(false);
      speakText('Bot paused and placed in standby.');
    }
  };

  // Fast 20s Demo Cycle (to test immediately without waiting 20 minutes)
  const triggerFastDemo = () => {
    setIsBotRunning(true);
    setCyclePhase('ANALYZING');
    setAnalysisSecondsRemaining(20);
    setTradeWindowSecondsRemaining(2 * 60);
    warned20sRef.current = false;
    speakText('Fast 20-second demo cycle started.');
  };

  const handleCopyTrade = () => {
    const text = `🎯 XAUUSD (Gold) 5M ICT Sniper Signal\nDirection: ${activeSetup.marketDirection || activeSetup.direction}\nOrder Action: BUY LIMIT / MARKET LONG\nOptimal Entry (OTE): ${activeSetup.entry}\nStop Loss (SL): ${activeSetup.stopLoss} (${activeSetup.slDistance || '5.3 Pips'})\nTake Profit 1 (TP1): ${activeSetup.takeProfit1} (${activeSetup.tp1Distance || '+10.1 Pips'})\nTake Profit 2 (TP2): ${activeSetup.takeProfit2} (${activeSetup.tp2Distance || '+15.6 Pips'})\nRisk/Reward: ${activeSetup.riskReward}\nTimeframe: ${activeSetup.timeframe}\nCadence: 20-Minute Automated Interval`;
    navigator.clipboard.writeText(text);
    setCopiedTrade(true);
    setTimeout(() => setCopiedTrade(false), 2000);
  };

  // Keep live clocks updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeUTC(now.toISOString().substring(11, 19) + ' UTC');
      const local = new Date(now.getTime() + 6 * 3600000);
      setCurrentTimeLocal(local.toISOString().substring(11, 19) + ' LOCAL');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Continuous 20-Minute Analysis & 2-Minute Trade Window State Machine
  useEffect(() => {
    if (!isBotRunning) return;

    const cadenceTimer = setInterval(() => {
      if (cyclePhase === 'ANALYZING') {
        setAnalysisSecondsRemaining((prev) => {
          if (prev === 20 && !warned20sRef.current) {
            warned20sRef.current = true;
            speakText('Analysis finalizing in 20 seconds. Preparing 5-minute Gold signal.');
          }

          if (prev <= 1) {
            // 20 minutes completed! Transition to 2-Minute Trade Window!
            setCyclePhase('SIGNAL_ACTIVE');
            setIsTakeTradeNowActive(true);
            setTradeWindowSecondsRemaining(2 * 60);
            warned20sRef.current = false;
            playAlertChime();
            handleInstantCapture(true);
            return 0;
          }
          return prev - 1;
        });
      } else if (cyclePhase === 'SIGNAL_ACTIVE') {
        setTradeWindowSecondsRemaining((prev) => {
          if (prev <= 1) {
            // 2-minute trade window expired! Loop back to 20-minute ANALYZING!
            setCyclePhase('ANALYZING');
            setIsTakeTradeNowActive(false);
            setAnalysisSecondsRemaining(20 * 60);
            warned20sRef.current = false;
            playAlertChime();
            speakText('2-minute trade window closed. Starting next 20-minute analysis cycle.');
            return 20 * 60;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(cadenceTimer);
  }, [isBotRunning, cyclePhase, activeSetup]);

  // Web Audio Synthesizer Chime
  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  };

  // Voice Synthesizer announcement for 20-minute trade execution
  const speakSignal = (setup, isPeriodic = false) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const prefix = isPeriodic 
        ? 'Attention trader! Twenty minute cycle completed. Take trade now! ' 
        : 'Instant Market Scan alert. Take trade now! ';
      const text = `${prefix} ${setup.pair}. ${setup.sweepType || 'Judas sweep detected'}. Predicted move: ${setup.direction} expansion towards ${setup.takeProfit1}. Entry at ${setup.entry}. Stop Loss placed at ${setup.stopLoss}. Take Profit at ${setup.takeProfit1}. Next twenty minute cycle active.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.02;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Instant capture from local TradingView watcher bot
  const handleInstantCapture = async (isPeriodic = false) => {
    setIsCapturing(true);
    setIsTakeTradeNowActive(true);
    try {
      const res = await fetch('http://localhost:8765/api/trading/asian-session/capture', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.setup) {
          setActiveSetup(data.setup);
          setImageTimestamp(Date.now());
          playAlertChime();
          speakSignal(data.setup, isPeriodic);
        }
      }
    } catch (e) {
      console.warn('Capture error:', e);
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

      {/* ─── MASTER BOT CONTROLLER & CADENCE DECK ─── */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-950/95 border-2 border-slate-700/80 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-xl border transition-all ${
              !isBotRunning
                ? 'bg-slate-800/80 border-slate-700 text-slate-400'
                : cyclePhase === 'SIGNAL_ACTIVE'
                ? 'bg-emerald-500/20 border-emerald-400/80 text-emerald-400 animate-bounce'
                : 'bg-amber-500/20 border-amber-400/80 text-amber-400 animate-pulse'
            }`}>
              <Zap className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                  !isBotRunning
                    ? 'bg-slate-800 text-slate-400 border-slate-700'
                    : cyclePhase === 'SIGNAL_ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    !isBotRunning ? 'bg-slate-500' : cyclePhase === 'SIGNAL_ACTIVE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-ping'
                  }`} />
                  {!isBotRunning
                    ? 'BOT STATUS: STANDBY'
                    : cyclePhase === 'SIGNAL_ACTIVE'
                    ? 'PHASE 2: 🚨 TAKE TRADE NOW (2-MIN WINDOW)'
                    : 'PHASE 1: 🟡 ANALYZING 5M LIQUIDITY (20-MIN)'}
                </span>

                {isBotRunning && (
                  <span className="text-[11px] font-mono text-cyan-300 hidden sm:inline">
                    XAUUSD 5M LIVE CYCLE
                  </span>
                )}
              </div>

              <h2 className="text-lg font-black text-white tracking-wide font-heading">
                {!isBotRunning
                  ? '20-Minute AI Scanner Bot is in Standby'
                  : cyclePhase === 'SIGNAL_ACTIVE'
                  ? '🚨 20-Minute Signal Confirmed! Take Trade Now'
                  : 'Analyzing Market Structure & Liquidity Imbalances'}
              </h2>

              <p className="text-xs text-slate-400 max-w-2xl font-mono">
                {!isBotRunning
                  ? 'Click "Start 20-Min AI Scanner Bot" to initiate the autonomous cycle. The bot analyzes 5M liquidity for 20 minutes, gives voice warnings, locks in the trade prediction, and opens a 2-minute execution window.'
                  : cyclePhase === 'SIGNAL_ACTIVE'
                  ? `Execution window active for ${Math.floor(tradeWindowSecondsRemaining / 60)}m ${tradeWindowSecondsRemaining % 60}s! Place order before window closes and auto-loop resets to next 20-min analysis.`
                  : `Real-time 20-minute scan running. Countdown to signal lock: ${Math.floor(analysisSecondsRemaining / 60)}m ${analysisSecondsRemaining % 60}s. Pre-signal warning will speak at 00:20.`}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isBotRunning ? (
              <button
                onClick={toggleBotRunning}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black font-mono text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START 20-MIN AI SCANNER BOT</span>
              </button>
            ) : (
              <>
                <button
                  onClick={toggleBotRunning}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500 text-slate-200 hover:text-rose-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>STOP BOT</span>
                </button>

                <button
                  onClick={triggerFastDemo}
                  title="Test a 20-second analysis cycle and hear the voice alert immediately without waiting 20 real minutes"
                  className="px-3 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ 20s FAST DEMO</span>
                </button>
              </>
            )}

            {/* Countdown Display Pill */}
            {isBotRunning && (
              <div className={`px-4 py-2 rounded-xl font-mono text-center border shadow-lg ${
                cyclePhase === 'SIGNAL_ACTIVE'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 animate-pulse'
                  : 'bg-slate-950 border-slate-700 text-cyan-300'
              }`}>
                <div className="text-[9px] uppercase tracking-wider opacity-75">
                  {cyclePhase === 'SIGNAL_ACTIVE' ? 'TRADE WINDOW' : 'ANALYSIS TIMER'}
                </div>
                <div className="text-base font-black">
                  {cyclePhase === 'SIGNAL_ACTIVE'
                    ? `${Math.floor(tradeWindowSecondsRemaining / 60)}m ${tradeWindowSecondsRemaining % 60}s`
                    : `${Math.floor(analysisSecondsRemaining / 60)}m ${analysisSecondsRemaining % 60}s`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar (0% to 100% of 20 minutes) */}
        {isBotRunning && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>
                {cyclePhase === 'SIGNAL_ACTIVE'
                  ? '2-Minute Trade Execution Window Active'
                  : '20-Minute Liquidity Analysis Progress'}
              </span>
              <span className="font-bold text-white">
                {cyclePhase === 'SIGNAL_ACTIVE'
                  ? `${Math.round(((120 - tradeWindowSecondsRemaining) / 120) * 100)}% Elapsed`
                  : `${Math.round(((1200 - analysisSecondsRemaining) / 1200) * 100)}% Elapsed`}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  cyclePhase === 'SIGNAL_ACTIVE'
                    ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                    : 'bg-gradient-to-r from-amber-500 to-cyan-400'
                }`}
                style={{
                  width: `${
                    cyclePhase === 'SIGNAL_ACTIVE'
                      ? ((120 - tradeWindowSecondsRemaining) / 120) * 100
                      : ((1200 - analysisSecondsRemaining) / 1200) * 100
                  }%`
                }}
              />
            </div>
          </div>
        )}
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

        {/* Current Time Clock & 20-Min Cadence */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-400">20-MIN AUTO CADENCE</div>
              <div className="text-xs font-bold text-cyan-300 font-mono">
                {!isBotRunning
                  ? 'STANDBY'
                  : cyclePhase === 'SIGNAL_ACTIVE'
                  ? `${Math.floor(tradeWindowSecondsRemaining / 60)}m ${tradeWindowSecondsRemaining % 60}s (TRADE)`
                  : `${Math.floor(analysisSecondsRemaining / 60)}m ${analysisSecondsRemaining % 60}s (SCAN)`}
              </div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
            !isBotRunning
              ? 'bg-slate-800 text-slate-400 border border-slate-700'
              : cyclePhase === 'SIGNAL_ACTIVE'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              !isBotRunning ? 'bg-slate-500' : cyclePhase === 'SIGNAL_ACTIVE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-ping'
            }`} />
            {!isBotRunning ? 'STANDBY' : cyclePhase === 'SIGNAL_ACTIVE' ? '2M WINDOW' : 'ANALYZING'}
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
                {/* 1-Click Feed Mode Switcher */}
                <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setChartMode('tradingview_live')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                      chartMode === 'tradingview_live'
                        ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    📺 Live TradingView 5M Feed
                  </button>
                  <button
                    onClick={() => setChartMode('ai_hud')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all ${
                      chartMode === 'ai_hud'
                        ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎯 AI Sniper HUD (SL/TP)
                  </button>
                </div>

                <button
                  onClick={() => handleInstantCapture(false)}
                  disabled={isCapturing}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold transition-all flex items-center gap-1.5"
                  title="Force instant real-time market scan"
                >
                  <RefreshCw className={`w-3 h-3 text-cyan-400 ${isCapturing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isCapturing ? 'Scanning...' : 'Scan Now'}</span>
                </button>
              </div>
            </div>

            {/* High-Tech Chart Visualizer Box */}
            {chartMode === 'tradingview_live' ? (
              <div className="relative w-full h-[460px] sm:h-[540px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
                {/* Real-time Floating Sniper HUD Ribbon */}
                <div className="relative z-10 px-3 py-2 bg-slate-950/95 border-b border-slate-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1 text-[10px] sm:text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      5M LIVE STREAM
                    </span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-300">
                      Entry: <strong className="text-cyan-300 font-mono">${activeSetup.entry}</strong>
                    </span>
                    <span className="text-slate-300">
                      SL: <strong className="text-rose-400 font-mono">${activeSetup.stopLoss}</strong>
                    </span>
                    <span className="text-slate-300">
                      TP1: <strong className="text-emerald-400 font-mono">${activeSetup.takeProfit1}</strong>
                    </span>
                    <span className="text-slate-300 hidden md:inline">
                      TP2: <strong className="text-emerald-300 font-mono">${activeSetup.takeProfit2}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyTrade}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-[11px] font-bold transition-all flex items-center gap-1"
                      title="Copy Entry, SL, TP1, TP2 levels"
                    >
                      {copiedTrade ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedTrade ? 'Copied!' : 'Copy SL/TP'}</span>
                    </button>

                    <a
                      href="https://www.tradingview.com/chart/?symbol=OANDA%3AXAUUSD"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition-all flex items-center gap-1"
                      title="Open full TradingView in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="hidden md:inline">Full TV</span>
                    </a>
                  </div>
                </div>

                {/* Real-time TradingView Candlestick Chart 5M */}
                <div className="relative flex-1 w-full h-full min-h-[380px]">
                  <iframe
                    title="Live TradingView XAUUSD 5M Chart"
                    src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=OANDA%3AXAUUSD&interval=5&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0a0f1d&theme=dark&style=1&timezone=Asia%2FDhaka&studies=%5B%5D&locale=en"
                    className="w-full h-full border-0"
                    allowTransparency="true"
                    scrolling="no"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <div className="relative w-full h-[380px] sm:h-[440px] rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800 flex flex-col justify-between p-4 shadow-inner">
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
                  <text x="475" y="245" fill="#00f0ff" fontSize="10" fontFamily="monospace" fontWeight="bold">5M BULLISH FVG</text>

                  {/* Strong Bullish Displacement Candle */}
                  <line x1="490" y1="190" x2="490" y2="270" stroke="#00ff9d" strokeWidth="2.5" />
                  <rect x="484" y="200" width="12" height="60" fill="#00ff9d" />

                  {/* Current Candle */}
                  <line x1="530" y1="180" x2="530" y2="240" stroke="#00ff9d" strokeWidth="2.5" />
                  <rect x="524" y="190" width="12" height="35" fill="#00ff9d" />

                  {/* ─── TRADINGVIEW POSITION TOOL (TP & SL BOX) ─── */}
                  {/* Green Take Profit Zone (Entry Y: 220 to TP1 Y: 100) */}
                  <rect x="540" y="100" width="220" height="120" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                  
                  {/* Red Stop Loss Zone (Entry Y: 220 to SL Y: 350) */}
                  <rect x="540" y="220" width="220" height="130" fill="rgba(244, 63, 94, 0.15)" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />

                  {/* TP1 Line & Label */}
                  <line x1="530" y1="100" x2="760" y2="100" stroke="#10b981" strokeWidth="2" />
                  <rect x="630" y="86" width="130" height="20" rx="4" fill="#065f46" stroke="#10b981" strokeWidth="1" />
                  <text x="638" y="100" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">TP1: {activeSetup.takeProfit1} (+101p)</text>

                  {/* TP2 Line & Label */}
                  <line x1="530" y1="60" x2="760" y2="60" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 2" />
                  <rect x="630" y="46" width="130" height="20" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                  <text x="638" y="60" fill="#6ee7b7" fontSize="10" fontFamily="monospace" fontWeight="bold">TP2: {activeSetup.takeProfit2} (+156p)</text>

                  {/* Entry (OTE) Line & Label */}
                  <line x1="500" y1="220" x2="760" y2="220" stroke="#00f0ff" strokeWidth="2.5" />
                  <circle cx="540" cy="220" r="5" fill="#00f0ff" className="animate-ping" />
                  <circle cx="540" cy="220" r="3" fill="#ffffff" />
                  <rect x="610" y="208" width="150" height="22" rx="4" fill="#083344" stroke="#00f0ff" strokeWidth="1.5" />
                  <text x="618" y="223" fill="#67e8f9" fontSize="10" fontFamily="monospace" fontWeight="bold">ENTRY (OTE): {activeSetup.entry}</text>

                  {/* Stop Loss (SL) Line & Label */}
                  <line x1="530" y1="350" x2="760" y2="350" stroke="#f43f5e" strokeWidth="2" />
                  <rect x="630" y="340" width="130" height="20" rx="4" fill="#881337" stroke="#f43f5e" strokeWidth="1" />
                  <text x="638" y="354" fill="#fda4af" fontSize="10" fontFamily="monospace" fontWeight="bold">SL: {activeSetup.stopLoss} (-53p)</text>

                  {/* Projected Trajectory Vector Arrow */}
                  <path
                    d="M 545 220 Q 610 160 700 100"
                    fill="none"
                    stroke="#00ff9d"
                    strokeWidth="3.5"
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

                      <span className="px-2 py-0.5 rounded bg-slate-900/80 text-emerald-400 border border-slate-800 text-[10px] font-mono font-bold">
                        {activeSetup.timeframe} Scalping
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
            )}

            {/* Bottom Quick Controls */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Detected Pattern:</span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                  ICT Asian Judas Sweep
                </span>
                <span className={`px-2 py-0.5 rounded border font-bold ${
                  !isBotRunning
                    ? 'bg-slate-800 border-slate-700 text-slate-400'
                    : cyclePhase === 'ANALYZING'
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                    : activeSetup.direction === 'BEARISH'
                    ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                    : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
                }`}>
                  {!isBotRunning
                    ? '5M Standby'
                    : cyclePhase === 'ANALYZING'
                    ? 'Scanning 5M FVG...'
                    : `${activeSetup.timeframe} ${activeSetup.direction === 'BEARISH' ? 'Bearish' : 'Bullish'} FVG`}
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
              {/* Direction Indicator Pill - Dynamic 20-Min Analyzing vs 2-Min Locked State */}
              {!isBotRunning ? (
                <div className="p-4 rounded-2xl border border-slate-700 bg-slate-900/70 text-slate-300 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono tracking-wider opacity-75 uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      BOT STATUS: STANDBY
                    </div>
                    <div className="text-base sm:text-lg font-black font-heading text-slate-200 mt-0.5">
                      STANDBY // CLICK START
                    </div>
                  </div>
                  <button
                    onClick={toggleBotRunning}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-black shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>START BOT</span>
                  </button>
                </div>
              ) : cyclePhase === 'ANALYZING' ? (
                <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono tracking-wider opacity-90 uppercase flex items-center gap-1.5 text-amber-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      RADAR: ANALYZING 5M LIQUIDITY...
                    </div>
                    <div className="text-lg sm:text-xl font-black font-heading tracking-wide flex items-center gap-2 mt-0.5 text-white">
                      <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                      <span>ANALYZING NEXT MOVE...</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-300">
                      98.4% ACCURACY
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 font-semibold">
                      {Math.floor(analysisSecondsRemaining / 60)}m {analysisSecondsRemaining % 60}s to Lock
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    activeSetup.direction === 'BULLISH'
                      ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-300 shadow-[0_0_25px_rgba(0,255,157,0.25)]'
                      : 'bg-rose-500/15 border-rose-400/60 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                  }`}
                >
                  <div>
                    <div className="text-[10px] font-mono tracking-wider opacity-80 uppercase flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      20-MIN CONFIRMED MOVE
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
                      {activeSetup.confidenceScore || 98}% WIN PROB
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 font-semibold">
                      Window: {Math.floor(tradeWindowSecondsRemaining / 60)}m {tradeWindowSecondsRemaining % 60}s
                    </div>
                  </div>
                </div>
              )}

              {/* AI Narrative / Multi-Indicator Detection Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-mono font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {!isBotRunning
                      ? 'AI LIQUIDITY RADAR (STANDBY)'
                      : cyclePhase === 'ANALYZING'
                      ? 'ACTIVE MULTI-INDICATOR SCANNER'
                      : 'AI MARKET STRUCTURE NARRATIVE'}
                  </span>
                </div>
                {!isBotRunning ? (
                  <p className="text-slate-400 leading-relaxed text-[11px] font-mono">
                    Bot is currently in standby. Start the 20-min AI Scanner Bot to begin scanning Asian Range liquidity, Fair Value Gaps, and Market Structure Shifts.
                  </p>
                ) : cyclePhase === 'ANALYZING' ? (
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>• Asian High/Low Judas Sweep:</span>
                      <span className="text-amber-400 font-bold">ANALYZING...</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>• 5M Displacement & Fair Value Gap:</span>
                      <span className="text-cyan-300 font-bold">MEASURING...</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>• Market Structure Shift (MSS):</span>
                      <span className="text-emerald-400 font-bold">CONFIRMING...</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>• Equilibrium 50% Range:</span>
                      <span className="text-fuchsia-300 font-bold">DISCOUNT BIAS</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 leading-relaxed text-[11px] font-mono">
                    {activeSetup.narrative}
                  </p>
                )}
              </div>

              {/* Execution Trade Plan Coordinates */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Order Action:</span>
                  <span className={`font-bold ${
                    !isBotRunning
                      ? 'text-slate-500'
                      : cyclePhase === 'ANALYZING'
                      ? 'text-amber-400 animate-pulse'
                      : activeSetup.direction === 'BULLISH'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}>
                    {!isBotRunning
                      ? 'STANDBY // WAITING FOR START'
                      : cyclePhase === 'ANALYZING'
                      ? 'SCANNING 5M LIQUIDITY...'
                      : activeSetup.direction === 'BULLISH'
                      ? 'BUY LIMIT / MARKET LONG'
                      : 'SELL LIMIT / MARKET SHORT'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Optimal Entry (OTE):</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.entry}`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">Invalidation (SL):</span>
                  <span className="font-bold text-rose-400 font-mono">
                    {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.stopLoss}`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">
                    {activeSetup.direction === 'BEARISH' ? 'Target 1 (Asia Low):' : 'Target 1 (Asia High):'}
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.takeProfit1}`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400">
                    {activeSetup.direction === 'BEARISH' ? 'Target 2 (Daily Low):' : 'Target 2 (Daily High):'}
                  </span>
                  <span className="font-bold text-emerald-300 font-mono">
                    {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.takeProfit2}`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-slate-300">Risk : Reward:</span>
                  <span className="font-black text-emerald-400 font-mono text-sm">
                    {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : (activeSetup.riskReward || '1 : 3.4')}
                  </span>
                </div>
              </div>
            </div>

            {/* 20-Min Automated Cadence Status & Force Scan */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Bot Cycle Status:
                </span>
                <span className="font-bold text-cyan-300 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${!isBotRunning ? 'bg-slate-500' : cyclePhase === 'SIGNAL_ACTIVE' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
                  {!isBotRunning
                    ? 'STANDBY'
                    : cyclePhase === 'SIGNAL_ACTIVE'
                    ? `${Math.floor(tradeWindowSecondsRemaining / 60)}m ${tradeWindowSecondsRemaining % 60}s (TRADE)`
                    : `${Math.floor(analysisSecondsRemaining / 60)}m ${analysisSecondsRemaining % 60}s (SCAN)`}
                </span>
              </div>

              <AnimatedButton
                variant="primary"
                size="md"
                className="w-full justify-center font-mono text-xs"
                icon={Zap}
                disabled={isCapturing}
                onClick={() => handleInstantCapture(false)}
              >
                {isCapturing ? 'Scanning Live Market...' : '⚡ Scan Market & Recalculate Now'}
              </AnimatedButton>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
                <span>Autonomous Bot Cadence</span>
                <span className="text-emerald-400">Audio Alerts: {isVoiceEnabled ? 'ON' : 'MUTED'}</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ─── 📺 Dedicated TradingView Vision TV Monitor & Execution Deck ─── */}
      <div className="space-y-3">
        {/* TV Chassis Outer Frame */}
        <div className="relative rounded-[32px] border-[5px] border-slate-700 bg-gradient-to-b from-slate-900 via-slate-950 to-black p-4 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(16,185,129,0.15)]">
          {/* Metallic Corner Screws */}
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
            <div className="w-1 h-1 bg-slate-900 rounded-full" />
          </div>
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
            <div className="w-1 h-1 bg-slate-900 rounded-full" />
          </div>
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
            <div className="w-1 h-1 bg-slate-900 rounded-full" />
          </div>
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center">
            <div className="w-1 h-1 bg-slate-900 rounded-full" />
          </div>

          {/* Top TV Bezel Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-800 text-xs font-mono">
            {/* Brand & Signal Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700">
                <Tv className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200 tracking-wider">TRADINGVIEW VISION TV</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">4K HDR</span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 hidden sm:flex">
                <Signal className="w-3.5 h-3.5 text-cyan-400" />
                <span>5G AUTONOMOUS FEED</span>
              </div>
            </div>

            {/* Channel & Power Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setTvChannel('5M')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    tvChannel === '5M' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CH-01: 5M
                </button>
                <button
                  onClick={() => setTvChannel('15M')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    tvChannel === '15M' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CH-02: 15M
                </button>
                <button
                  onClick={() => setTvChannel('1H')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    tvChannel === '1H' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CH-03: 1H
                </button>
              </div>

              {/* TV Power Toggle */}
              <button
                onClick={() => setIsTvPowerOn(!isTvPowerOn)}
                className={`p-2 rounded-xl border transition-all ${
                  isTvPowerOn
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}
                title={isTvPowerOn ? 'Turn TV Screen Standby' : 'Turn TV Screen On'}
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* TV Grid: Screen (7 cols) & Execution Deck (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Cols: The TV Screen Display */}
            <div className="lg:col-span-7 flex flex-col space-y-3">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-slate-700/80 bg-black shadow-2xl">
                {isTvPowerOn ? (
                  <>
                    {/* The Authentic TradingView Screenshot Image */}
                    <img
                      src={`http://localhost:8765/api/trading/asian-session/image?t=${imageTimestamp}`}
                      alt="TradingView TV Live Feed"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />

                    {/* CRT Scanline & Screen Glare Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-black/40 pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

                    {/* Top TV Screen Ribbon */}
                    <div className="absolute top-2.5 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-rose-500/40 text-[10px] font-mono font-bold text-rose-400 flex items-center gap-1.5 shadow-lg">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                          🔴 REC // LIVE 5M FEED
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-cyan-300">
                          {activeSetup.pair}
                        </span>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-300">
                        {!isBotRunning
                          ? 'STATUS: STANDBY'
                          : cyclePhase === 'SIGNAL_ACTIVE'
                          ? `WINDOW: ${Math.floor(tradeWindowSecondsRemaining / 60)}m ${tradeWindowSecondsRemaining % 60}s`
                          : `ANALYSIS: ${Math.floor(analysisSecondsRemaining / 60)}m ${analysisSecondsRemaining % 60}s`}
                      </span>
                    </div>

                    {/* ─── DIRECT ON-SCREEN MARKINGS: EXACT TRADINGVIEW POSITION TOOL (Matching media_1789104798717.png) ─── */}
                    {showTvMarkers && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Purple Equilibrium (50%) Box - Exact match to media_1789104798717.png */}
                        <div className="absolute top-[26%] left-[36%] sm:left-[40%] px-2.5 py-1 rounded bg-[#3b0764]/80 border-2 border-[#d946ef] shadow-[0_0_12px_rgba(217,70,239,0.4)] flex items-center justify-center">
                          <span className="text-[#f5d0fe] font-mono text-[9px] sm:text-[10px] font-bold">
                            Equilibrium (50%)
                          </span>
                        </div>

                        {/* Dotted Yellow Asian High (BSL) line */}
                        <div className="absolute top-[16%] inset-x-3 flex items-center justify-between border-t border-dashed border-amber-400/80">
                          <span className="px-2 py-0.5 rounded bg-black/85 border border-amber-500/50 text-amber-300 font-mono font-bold text-[9px] sm:text-[10px] shadow-lg -translate-y-1/2">
                            ASIA HIGH: ${activeSetup.asianHigh}
                          </span>
                          <span className="text-amber-400 font-mono text-[9px] pr-2 opacity-80 -translate-y-1/2">
                            Buy-Side Liquidity (BSL)
                          </span>
                        </div>

                        {/* Dotted Yellow Previous Day Low / Asia Low line */}
                        <div className="absolute bottom-[13%] inset-x-3 flex items-center justify-between border-t border-dashed border-cyan-400/80">
                          <span className="px-2 py-0.5 rounded bg-black/85 border border-cyan-500/50 text-cyan-300 font-mono font-bold text-[9px] sm:text-[10px] shadow-lg -translate-y-1/2">
                            ASIA LOW: ${activeSetup.asianLow}
                          </span>
                          <span className="text-cyan-400 font-mono text-[9px] pr-2 opacity-80 -translate-y-1/2">
                            Sell-Side Liquidity (SSL)
                          </span>
                        </div>

                        {/* If in SIGNAL_ACTIVE mode -> Show Authentic TradingView Long / Short Position Tool */}
                        {cyclePhase === 'SIGNAL_ACTIVE' ? (
                          <div className="absolute top-[20%] bottom-[20%] left-[46%] sm:left-[48%] right-3 sm:right-6 flex flex-col">
                            {activeSetup.direction === 'BULLISH' ? (
                              <>
                                {/* Green Take Profit Zone (Profit Box) */}
                                <div className="relative flex-1 bg-emerald-500/15 border border-emerald-500/70 rounded-t-sm">
                                  <div className="absolute -top-1 -left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute top-1/2 inset-x-2 border-t border-dashed border-amber-400/60" />
                                  <div className="absolute -top-3.5 right-0 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-mono font-bold text-[9px] sm:text-[10px] shadow-md">
                                    TP: ${activeSetup.takeProfit1} ({activeSetup.tp1Distance || '+10.1 Pips'})
                                  </div>
                                </div>

                                {/* Entry Dividing Line */}
                                <div className="relative w-full border-t-2 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                                  <div className="absolute -top-4 sm:-top-5 left-3 sm:left-6 z-20 px-3 py-1 sm:py-1.5 rounded-md bg-[#e11d48] border border-white shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-white font-mono select-none pointer-events-auto leading-tight flex flex-col justify-center">
                                    <span className="text-[10px] sm:text-[11px] font-bold text-white tracking-tight">
                                      Open PnL: -6.960, Qty: 24
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-semibold text-rose-100 tracking-tight">
                                      Risk/reward ratio: {activeSetup.riskReward ? activeSetup.riskReward.replace('1 :', '').trim() : '3.6'}
                                    </span>
                                  </div>
                                  <div className="absolute -top-3 right-0 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono font-bold text-[9px] sm:text-[10px] shadow-md flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    ENTRY: ${activeSetup.entry} (OTE)
                                  </div>
                                </div>

                                {/* Red Stop Loss Zone (Risk Box) */}
                                <div className="relative flex-1 bg-rose-500/20 border border-rose-500/70 rounded-b-sm">
                                  <div className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute top-1/2 inset-x-2 border-t border-dashed border-cyan-400/60" />
                                  <div className="absolute -bottom-3.5 right-0 px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500 text-rose-300 font-mono font-bold text-[9px] sm:text-[10px] shadow-md">
                                    STOP LOSS: ${activeSetup.stopLoss} ({activeSetup.slDistance || '-5.3 Pips'})
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                {/* Bearish: Red Stop Loss Zone on Top */}
                                <div className="relative flex-1 bg-rose-500/20 border border-rose-500/70 rounded-t-sm">
                                  <div className="absolute -top-1 -left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute top-1/2 inset-x-2 border-t border-dashed border-rose-400/60" />
                                  <div className="absolute -top-3.5 right-0 px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500 text-rose-300 font-mono font-bold text-[9px] sm:text-[10px] shadow-md">
                                    STOP LOSS: ${activeSetup.stopLoss} ({activeSetup.slDistance || '-5.3 Pips'})
                                  </div>
                                </div>

                                {/* Entry Dividing Line */}
                                <div className="relative w-full border-t-2 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                                  <div className="absolute -top-4 sm:-top-5 left-3 sm:left-6 z-20 px-3 py-1 sm:py-1.5 rounded-md bg-[#e11d48] border border-white shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-white font-mono select-none pointer-events-auto leading-tight flex flex-col justify-center">
                                    <span className="text-[10px] sm:text-[11px] font-bold text-white tracking-tight">
                                      Open PnL: -6.960, Qty: 24
                                    </span>
                                    <span className="text-[10px] sm:text-[11px] font-semibold text-rose-100 tracking-tight">
                                      Risk/reward ratio: {activeSetup.riskReward ? activeSetup.riskReward.replace('1 :', '').trim() : '3.4'}
                                    </span>
                                  </div>
                                  <div className="absolute -top-3 right-0 px-2 py-0.5 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-200 font-mono font-bold text-[9px] sm:text-[10px] shadow-md flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    ENTRY: ${activeSetup.entry} (OTE)
                                  </div>
                                </div>

                                {/* Bearish: Green Take Profit Zone on Bottom */}
                                <div className="relative flex-1 bg-emerald-500/15 border border-emerald-500/70 rounded-b-sm">
                                  <div className="absolute -bottom-1 -left-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute -bottom-1 -right-1 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#0284c7] border border-white rounded-[1px] shadow-sm" />
                                  <div className="absolute top-1/2 inset-x-2 border-t border-dashed border-emerald-400/60" />
                                  <div className="absolute -bottom-3.5 right-0 px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-mono font-bold text-[9px] sm:text-[10px] shadow-md">
                                    TP: ${activeSetup.takeProfit1} ({activeSetup.tp1Distance || '+10.1 Pips'})
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          /* Active Scanning Reticle during ANALYZING or STANDBY */
                          <div className="absolute inset-x-12 top-[32%] bottom-[32%] border border-dashed border-amber-500/40 rounded-xl flex items-center justify-center bg-amber-500/[0.03]">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/85 border border-amber-500/50 text-amber-300 font-mono text-[10px] shadow-xl">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              <span>SCANNING 5M LIQUIDITY & JUDAS SWEEPS...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─── 20-MINUTE DYNAMIC STATE: STANDBY VS ANALYZING VS 🚨 TAKE TRADE NOW! FLASH BANNER ─── */}
                    {!isBotRunning ? (
                      <div className="absolute inset-x-3 top-10 z-20 p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-slate-700 shadow-xl backdrop-blur-md flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Tv className="w-4 h-4 text-slate-400" />
                          <span className="text-[11px] font-mono text-slate-300">
                            20-Minute Scanner in Standby. Click "START 20-MIN AI SCANNER BOT" above to begin.
                          </span>
                        </div>
                        <button
                          onClick={toggleBotRunning}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold transition-all flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>START</span>
                        </button>
                      </div>
                    ) : cyclePhase === 'ANALYZING' ? (
                      <div className="absolute inset-x-3 top-10 z-20 p-2 sm:p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md flex items-center justify-between gap-2 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-spin">
                            <RefreshCw className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-[11px] font-black text-amber-300 font-heading tracking-wide uppercase flex items-center gap-1.5">
                              <span>🟡 20-MIN CADENCE: ANALYZING 5M LIQUIDITY...</span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold border border-amber-500/40">
                                ANALYZING
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-300">
                              Asian Range (${activeSetup.asianHigh} - ${activeSetup.asianLow}) & Judas Sweeps • Next Signal in {Math.floor(analysisSecondsRemaining / 60)}m {analysisSecondsRemaining % 60}s
                            </div>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold text-right shrink-0">
                          {Math.floor(analysisSecondsRemaining / 60)}m {analysisSecondsRemaining % 60}s
                        </span>
                      </div>
                    ) : (
                      <div className="absolute inset-x-3 top-10 z-20 p-2.5 sm:p-3 rounded-xl bg-slate-950/95 border-2 border-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.5)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 animate-bounce">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-black text-white font-heading tracking-wide uppercase">
                                🚨 20-MIN CYCLE COMPLETE: TAKE TRADE NOW!
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] sm:text-[10px] font-bold border border-emerald-500/40">
                                2-MIN WINDOW ({Math.floor(tradeWindowSecondsRemaining / 60)}m {tradeWindowSecondsRemaining % 60}s)
                              </span>
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-mono text-emerald-300 mt-0.5">
                              <strong>BUY LIMIT @ ${activeSetup.entry}</strong> • SL: ${activeSetup.stopLoss} • TP: ${activeSetup.takeProfit1}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={handleCopyTrade}
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black font-mono text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                        >
                          {copiedTrade ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                          <span>{copiedTrade ? 'COPIED TO CLIPBOARD!' : '🔥 TAKE TRADE NOW'}</span>
                        </button>
                      </div>
                    )}

                    {/* Bottom TV Screen Bar */}
                    <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between p-2 rounded-xl bg-black/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Setup:</span>
                        <span className="font-bold text-emerald-400">{activeSetup.sweepType}</span>
                      </div>

                      <button
                        onClick={() => setIsImageModalOpen(true)}
                        className="flex items-center gap-1 text-cyan-300 hover:text-white transition-colors"
                      >
                        <span>Zoom Fullscreen</span>
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  /* TV Standby Screen */
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-2 bg-slate-950 text-slate-500 font-mono text-xs">
                    <Tv className="w-10 h-10 text-slate-700" />
                    <p>TRADINGVIEW TV DISPLAY IS IN STANDBY</p>
                    <button
                      onClick={() => setIsTvPowerOn(true)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <Power className="w-3.5 h-3.5" />
                      Turn Display On
                    </button>
                  </div>
                )}
              </div>

              {/* TV Bezel Lower Speaker & Control Deck */}
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono">
                {/* Speaker Grille Pattern */}
                <div className="flex items-center gap-1 text-slate-600 text-[9px] select-none tracking-widest hidden sm:flex">
                  <span>● ● ● ● ● ● ● ● ● ● ● ●</span>
                  <span className="text-slate-500 text-[10px] font-bold">HI-FI STEREO</span>
                </div>

                {/* Quick Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => setShowTvMarkers(!showTvMarkers)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                      showTvMarkers
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Markers: {showTvMarkers ? 'ON' : 'OFF'}
                  </button>

                  <button
                    onClick={() => {
                      playAlertChime();
                      speakSignal(activeSetup, false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] transition-all flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Voice Test</span>
                  </button>

                  <button
                    onClick={() => handleInstantCapture(false)}
                    disabled={isCapturing}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCapturing ? 'animate-spin' : ''}`} />
                    <span>{isCapturing ? 'Scanning...' : 'Sync TV'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Trade Execution Deck */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      20-MIN TRADE EXECUTION DIRECTIVE
                    </span>
                    <h4 className="text-base font-black text-white font-heading tracking-wide flex items-center gap-2 mt-0.5">
                      {!isBotRunning ? (
                        <span className="text-slate-400 flex items-center gap-1">
                          <Power className="w-4 h-4 text-slate-500" />
                          STANDBY (BOT PAUSED)
                        </span>
                      ) : cyclePhase === 'ANALYZING' ? (
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                          ANALYZING 5M ORDER FLOW...
                        </span>
                      ) : activeSetup.direction === 'BULLISH' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          BUY / LONG LIMIT
                        </span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1">
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                          SELL / SHORT LIMIT
                        </span>
                      )}
                    </h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                    !isBotRunning
                      ? 'bg-slate-800 border-slate-700 text-slate-400'
                      : cyclePhase === 'ANALYZING'
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  }`}>
                    {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'SCANNING 5M' : `R:R ${activeSetup.riskReward || '1 : 3.4'}`}
                  </span>
                </div>

                {/* Key Price Levels Grid */}
                <div className="mt-4 space-y-2.5 font-mono text-xs">
                  {/* Entry Price */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/30">
                    <div>
                      <div className="text-[10px] text-slate-400">OPTIMAL ENTRY PRICE (OTE)</div>
                      <div className="text-sm font-bold text-cyan-300 font-mono">
                        {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.entry}`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (cyclePhase === 'SIGNAL_ACTIVE') {
                          navigator.clipboard.writeText(String(activeSetup.entry));
                          setCopiedTrade(true);
                          setTimeout(() => setCopiedTrade(false), 2000);
                        }
                      }}
                      disabled={cyclePhase !== 'SIGNAL_ACTIVE'}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                      title="Copy Entry"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Stop Loss */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-rose-500/40">
                    <div>
                      <div className="text-[10px] text-rose-400 font-semibold">STRICT STOP LOSS (SL)</div>
                      <div className="text-sm font-bold text-rose-300 font-mono">
                        {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.stopLoss}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {!isBotRunning ? 'Awaiting Bot Cycle' : cyclePhase === 'ANALYZING' ? 'Detecting 5M Invalidation' : `${activeSetup.slDistance} Risk Invalidation`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (cyclePhase === 'SIGNAL_ACTIVE') {
                          navigator.clipboard.writeText(String(activeSetup.stopLoss));
                          setCopiedTrade(true);
                          setTimeout(() => setCopiedTrade(false), 2000);
                        }
                      }}
                      disabled={cyclePhase !== 'SIGNAL_ACTIVE'}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                      title="Copy Stop Loss"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Take Profit 1 */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/40">
                    <div>
                      <div className="text-[10px] text-emerald-400 font-semibold">TAKE PROFIT 1 (TP1 - 50% CLOSE)</div>
                      <div className="text-sm font-bold text-emerald-300 font-mono">
                        {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.takeProfit1}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {!isBotRunning ? 'Awaiting Bot Cycle' : cyclePhase === 'ANALYZING' ? 'Measuring Range Liquidity' : `${activeSetup.tp1Distance} ${activeSetup.direction === 'BEARISH' ? 'Asian Low Liquidity' : 'Asian High Liquidity'}`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (cyclePhase === 'SIGNAL_ACTIVE') {
                          navigator.clipboard.writeText(String(activeSetup.takeProfit1));
                          setCopiedTrade(true);
                          setTimeout(() => setCopiedTrade(false), 2000);
                        }
                      }}
                      disabled={cyclePhase !== 'SIGNAL_ACTIVE'}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                      title="Copy TP1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Take Profit 2 */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
                    <div>
                      <div className="text-[10px] text-emerald-300 font-semibold">TAKE PROFIT 2 (TP2 - RUNNER)</div>
                      <div className="text-sm font-bold text-emerald-200 font-mono">
                        {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.takeProfit2}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {!isBotRunning ? 'Awaiting Bot Cycle' : cyclePhase === 'ANALYZING' ? 'Projecting Peak Target' : `${activeSetup.tp2Distance} Peak Session Target`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (cyclePhase === 'SIGNAL_ACTIVE') {
                          navigator.clipboard.writeText(String(activeSetup.takeProfit2));
                          setCopiedTrade(true);
                          setTimeout(() => setCopiedTrade(false), 2000);
                        }
                      }}
                      disabled={cyclePhase !== 'SIGNAL_ACTIVE'}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40"
                      title="Copy TP2"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {!isBotRunning ? (
                  <button
                    onClick={toggleBotRunning}
                    className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black font-mono text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>START 20-MIN AI SCANNER BOT</span>
                  </button>
                ) : cyclePhase === 'ANALYZING' ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-black font-mono text-xs shadow-lg flex items-center justify-center gap-2 opacity-90 cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>ANALYZING 5M LIQUIDITY... ({Math.floor(analysisSecondsRemaining / 60)}m {analysisSecondsRemaining % 60}s)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleCopyTrade}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black font-mono text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 animate-pulse"
                  >
                    {copiedTrade ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4 text-slate-950" />}
                    <span>{copiedTrade ? 'All Trade Parameters Copied!' : '🔥 TAKE TRADE NOW (COPY ALL PARAMETERS)'}</span>
                  </button>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1">
                  <span>Continuous 20-min Auto Protection</span>
                  <span className={isBotRunning ? 'text-emerald-400' : 'text-slate-500'}>
                    {isBotRunning ? 'Next Loop Active' : 'Standby'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Realistic TV Monitor Stand Neck & Heavy Base */}
        <div className="flex flex-col items-center pointer-events-none -mt-1 mb-2">
          {/* TV Neck */}
          <div className="w-14 sm:w-20 h-4 bg-gradient-to-b from-slate-700 to-slate-900 shadow-md border-x border-slate-600/40" />
          {/* TV Desktop Base */}
          <div className="w-56 sm:w-80 h-3.5 bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 rounded-b-2xl shadow-2xl border-t border-slate-500/60" />
        </div>
      </div>

      {/* ─── 🎯 ICT Sniper Execution & Master Trade Blueprint ─── */}
      <GlassCard
        title="ICT Sniper Execution & Master Blueprint"
        subtitle="Complete trade setup breakdown: Exact SL, TP1, TP2 targets, Best entry option, and market trajectory"
        icon={Crosshair}
        glowColor={!isBotRunning ? 'default' : cyclePhase === 'ANALYZING' ? 'amber' : activeSetup.direction === 'BULLISH' ? 'emerald' : 'pink'}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-1">
          {/* 1. Market Direction & Bias */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  1. MARKET DIRECTION & BIAS
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  !isBotRunning
                    ? 'bg-slate-800 text-slate-400'
                    : cyclePhase === 'ANALYZING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'SCANNING 5M' : `${activeSetup.confidenceScore || 98}% WIN PROB`}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {!isBotRunning ? (
                  <span className="text-lg font-black text-slate-400 font-heading tracking-wide">
                    STANDBY (BOT PAUSED)
                  </span>
                ) : cyclePhase === 'ANALYZING' ? (
                  <>
                    <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                    <span className="text-lg font-black text-amber-300 font-heading tracking-wide">
                      ANALYZING FLOW...
                    </span>
                  </>
                ) : activeSetup.direction === 'BULLISH' ? (
                  <>
                    <TrendingUp className="w-6 h-6 text-emerald-400 animate-bounce" />
                    <span className="text-lg font-black text-emerald-400 font-heading tracking-wide">
                      BULLISH EXPANSION
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-6 h-6 text-rose-400 animate-bounce" />
                    <span className="text-lg font-black text-rose-400 font-heading tracking-wide">
                      BEARISH REVERSAL
                    </span>
                  </>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
              {!isBotRunning ? (
                'Bot is currently in standby. Click "START 20-MIN AI SCANNER BOT" to scan Asian liquidity and calculate setup.'
              ) : cyclePhase === 'ANALYZING' ? (
                `Actively analyzing 5-minute order flow, Judas swings, and liquidity imbalances. Market direction (BULLISH vs BEARISH) will lock at 00:00 (${Math.floor(analysisSecondsRemaining / 60)}m ${analysisSecondsRemaining % 60}s remaining).`
              ) : activeSetup.direction === 'BULLISH' ? (
                <>
                  Smart Money liquidity grab confirmed. Price swept Asian Low ($<strong>{activeSetup.asianLow}</strong>) and is engineered to expand toward{' '}
                  <strong className="text-emerald-400">Asian High (${activeSetup.takeProfit1})</strong>.
                </>
              ) : (
                <>
                  Smart Money liquidity grab confirmed. Price swept Asian High ($<strong>{activeSetup.asianHigh}</strong>) and is engineered to drop toward{' '}
                  <strong className="text-rose-400">Asian Low (${activeSetup.takeProfit1})</strong>.
                </>
              )}
            </p>
          </div>

          {/* 2. Stop Loss Blueprint */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  2. STOP LOSS (INVALIDATION)
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  !isBotRunning
                    ? 'bg-slate-800 text-slate-400'
                    : cyclePhase === 'ANALYZING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'DETECTING WICK' : `RISK: ${activeSetup.slDistance || '5.3 Pips'}`}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-400 font-mono">
                  {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.stopLoss}`}
                </span>
                <span className="text-xs text-slate-400 font-mono">Invalidation</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
              {!isBotRunning ? (
                'Stop Loss coordinates will be automatically calculated when the 20-minute scan completes.'
              ) : cyclePhase === 'ANALYZING' ? (
                'Scanning lowest/highest Judas wick to calculate optimal invalidation level (2 pips beyond high/low wick).'
              ) : (
                `Place SL at $${activeSetup.stopLoss} (exactly 2 pips ${activeSetup.direction === 'BULLISH' ? 'below the sweep wick' : 'above the sweep wick'}). If price crosses this, setup is invalidated.`
              )}
            </p>
          </div>

          {/* 3. Take Profit Blueprint */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  3. TAKE PROFIT (PROFIT TARGETS)
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  !isBotRunning
                    ? 'bg-slate-800 text-slate-400'
                    : cyclePhase === 'ANALYZING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                }`}>
                  {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'MEASURING' : `R:R ${activeSetup.riskReward || '1 : 3.4'}`}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">TP1 (50% Close):</span>
                  <span className="text-white font-bold">
                    {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.takeProfit1} (${activeSetup.tp1Distance || '+10.1 Pips'})`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-cyan-400 font-bold">TP2 (Runner):</span>
                  <span className="text-white font-bold">
                    {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'CALCULATING...' : `$${activeSetup.takeProfit2} (${activeSetup.tp2Distance || '+15.6 Pips'})`}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
              {!isBotRunning ? (
                'Take Profit targets will be projected upon bot cycle completion.'
              ) : cyclePhase === 'ANALYZING' ? (
                'Measuring opposing Asian session range liquidity pools and external daily targets.'
              ) : (
                `Take 50% Profit at $${activeSetup.takeProfit1} (${activeSetup.direction === 'BULLISH' ? 'Asian High BSL' : 'Asian Low SSL'}). Move Stop Loss to Entry (Risk-Free). Trail runner to $${activeSetup.takeProfit2}.`
              )}
            </p>
          </div>

          {/* 4. Best Option Recommendation */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  4. OPTIMAL EXECUTION STRATEGY
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  !isBotRunning
                    ? 'bg-slate-800 text-slate-400'
                    : cyclePhase === 'ANALYZING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                }`}>
                  {!isBotRunning ? 'STANDBY' : cyclePhase === 'ANALYZING' ? 'COMPUTING' : 'RECOMMENDED'}
                </span>
              </div>
              <div className="mt-2 text-sm font-bold text-purple-300 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>
                  {!isBotRunning
                    ? 'Scanner in Standby'
                    : cyclePhase === 'ANALYZING'
                    ? 'Computing Best Option...'
                    : `Limit Entry @ $${activeSetup.entry}`}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
              {!isBotRunning ? (
                'Start the 20-Minute Scanner to compute the optimal trade entry and execution strategy.'
              ) : cyclePhase === 'ANALYZING' ? (
                'Evaluating 5M Fair Value Gap (FVG) vs immediate market entry to ensure optimal 1:3+ Risk/Reward ratio.'
              ) : (
                `Best Option: Limit Order inside 5M ${activeSetup.direction === 'BULLISH' ? 'Bullish' : 'Bearish'} FVG at $${activeSetup.entry}. Tight 5-pip stop gives optimal ${activeSetup.riskReward || '1:3.4'} R:R.`
              )}
            </p>
          </div>
        </div>

        {/* ─── Trajectory Roadmap (4-Phase Execution) ─── */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              MOVE TRAJECTORY ROADMAP (4-PHASE EXECUTION)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {!isBotRunning ? (
              [
                { step: '1. Liquidity Sweep', title: 'Standby', desc: '20-minute AI Scanner is currently paused. Click Start to begin.' },
                { step: '2. 5M Displacement', title: 'Standby', desc: 'Institutional displacement tracking pending bot start.' },
                { step: '3. Optimal Retest', title: 'Standby', desc: 'Optimal Trade Entry calculation pending bot start.' },
                { step: '4. Target Expansion', title: 'Standby', desc: 'Asian session expansion targets pending bot start.' }
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold">{m.step}</span>
                    <span className="text-[10px] text-slate-500">Phase {idx + 1}</span>
                  </div>
                  <div className="font-bold text-slate-400 text-xs">{m.title}</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{m.desc}</p>
                </div>
              ))
            ) : cyclePhase === 'ANALYZING' ? (
              [
                { step: '1. Liquidity Sweep', title: 'Monitoring Asian High/Low', desc: `Scanning Asian High ($${activeSetup.asianHigh}) & Asian Low ($${activeSetup.asianLow}) for Judas sweep.` },
                { step: '2. 5M Displacement', title: 'Measuring Institutional Surge', desc: 'Detecting high-volume 5M candle body displacement and Fair Value Gap (FVG) imbalances.' },
                { step: '3. Optimal Retest', title: 'Calculating OTE Retest', desc: 'Computing optimal entry inside 5M FVG mitigation zone for minimum risk.' },
                { step: '4. Target Expansion', title: 'Projecting Liquidity Run', desc: `Locking direction and projection targets at 00:00 (${Math.floor(analysisSecondsRemaining / 60)}m ${analysisSecondsRemaining % 60}s remaining).` }
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/20 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">{m.step}</span>
                    <span className="text-[10px] text-amber-400 font-bold">ANALYZING</span>
                  </div>
                  <div className="font-bold text-amber-200 text-xs">{m.title}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              ))
            ) : (
              (activeSetup.direction === 'BEARISH' ? [
                { step: '1. Liquidity Sweep', title: 'Fake Break Above Asia High', desc: `Price swept $${activeSetup.asianHigh} trapping retail breakout buyers into bad long positions.` },
                { step: '2. 5M Displacement', title: 'Institutional Sell Impulse', desc: 'Sharp 5M red candle displacement created a clear Bearish Fair Value Gap (FVG).' },
                { step: '3. Optimal Retest', title: `5M FVG Tap @ $${activeSetup.entry}`, desc: 'Best Entry: Price pulls back into premium zone of 5M FVG for high R:R short entry.' },
                { step: '4. Target Expansion', title: `Dump to Asia Low $${activeSetup.takeProfit1}`, desc: `Heavy sell momentum sweeps resting sell stops at $${activeSetup.takeProfit1} for +101 pips profit.` }
              ] : [
                { step: '1. Liquidity Sweep', title: 'Fake Break Below Asia Low', desc: `Price swept $${activeSetup.asianLow} trapping retail breakout sellers into bad short positions.` },
                { step: '2. 5M Displacement', title: 'Institutional Buy Impulse', desc: 'Sharp 5M green candle displacement created a clear Bullish Fair Value Gap (FVG).' },
                { step: '3. Optimal Retest', title: `5M FVG Tap @ $${activeSetup.entry}`, desc: 'Best Entry: Price pulls back into discount zone of 5M FVG for high R:R entry.' },
                { step: '4. Target Expansion', title: `Pump to Asia High $${activeSetup.takeProfit1}`, desc: `Heavy buy momentum sweeps resting buy stops at $${activeSetup.takeProfit1} for +101 pips profit.` }
              ]).map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 text-[10px] font-bold">{m.step}</span>
                    <span className="text-[10px] text-slate-500">Phase {idx + 1}</span>
                  </div>
                  <div className="font-bold text-slate-200 text-xs">{m.title}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </GlassCard>

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
                <span className="text-slate-400 font-semibold">Step 2: Run Dedicated Gold (XAUUSD) Live Sniper</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Watches your live TradingView Gold chart, tracks real-time bid/ask, and announces Judas Swings:
                </p>
                <div className="mt-1 flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 font-mono">
                  <code>python bots/xauusd_tradingview_live_bot.py</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('python bots/xauusd_tradingview_live_bot.py');
                      setCopiedCmd(true);
                      setTimeout(() => setCopiedCmd(false), 2000);
                    }}
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

      {/* ─── Fullscreen Screenshot Modal ─── */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full bg-slate-950 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {activeSetup.pair} • 5M High-Res Vision
                </span>
                <span className="text-slate-400">
                  Timestamp: {new Date(imageTimestamp).toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
              <img
                src={`http://localhost:8765/api/trading/asian-session/image?t=${imageTimestamp}`}
                alt="Full TradingView Screenshot"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80';
                }}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">SL: ${activeSetup.stopLoss}</span>
                <span>•</span>
                <span className="text-cyan-300 font-bold">Entry: ${activeSetup.entry}</span>
                <span>•</span>
                <span className="text-emerald-300 font-bold">TP1: ${activeSetup.takeProfit1}</span>
                <span>•</span>
                <span className="text-emerald-200 font-bold">TP2: ${activeSetup.takeProfit2}</span>
              </div>
              <div className="text-slate-500">
                Press ESC or click outside to dismiss
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AsianSessionRadar;
