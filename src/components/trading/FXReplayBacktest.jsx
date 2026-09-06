import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, CrosshairMode, LineStyle } from 'lightweight-charts';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Scissors,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  ShieldAlert,
  BarChart2,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  RefreshCw,
  Award,
  MousePointer,
  Minus,
  Square,
  Type,
  Trash2,
  Undo2,
  Ruler,
  HelpCircle,
  X,
  Radio,
  FileText,
  PieChart,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Supported Assets & Symbols ──────────────────────────────────────────────
const ASSETS = [
  { id: 'XAUUSD', name: 'Gold (XAU/USD)', tvSymbol: 'OANDA:XAUUSD', basePrice: 2365.50, pipSize: 0.1, decimals: 2 },
  { id: 'EURUSD', name: 'EUR / USD', tvSymbol: 'FX:EURUSD', basePrice: 1.0865, pipSize: 0.0001, decimals: 5 },
  { id: 'GBPUSD', name: 'GBP / USD', tvSymbol: 'FX:GBPUSD', basePrice: 1.2740, pipSize: 0.0001, decimals: 5 },
  { id: 'USDJPY', name: 'USD / JPY', tvSymbol: 'FX:USDJPY', basePrice: 154.20, pipSize: 0.01, decimals: 3 },
  { id: 'BTCUSD', name: 'Bitcoin (BTC/USD)', tvSymbol: 'BINANCE:BTCUSDT', basePrice: 64800.0, pipSize: 1.0, decimals: 1 },
  { id: 'ETHUSD', name: 'Ethereum (ETH/USD)', tvSymbol: 'BINANCE:ETHUSDT', basePrice: 3450.0, pipSize: 0.1, decimals: 2 },
  { id: 'US30', name: 'US30 (Dow Jones)', tvSymbol: 'CAPITALCOM:US30', basePrice: 39850.0, pipSize: 1.0, decimals: 1 },
];

const TIMEFRAMES = [
  { id: '1', label: '1m' },
  { id: '3', label: '3m' },
  { id: '5', label: '5m' },
  { id: '15', label: '15m' },
  { id: '30', label: '30m' },
  { id: '60', label: '1h' },
  { id: '240', label: '4h' },
  { id: 'D', label: '1D' },
  { id: 'W', label: '1W' },
];

// ─── Candle Generator for Bar Replay Engine ──────────────────────────────────
function generateCandles(basePrice, pipSize, count = 350) {
  const candles = [];
  let current = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const interval = 300;
  const startTime = now - count * interval;
  const isHigh = basePrice > 100;
  const decimals = isHigh ? 2 : 5;

  let trend = 1;
  let duration = 0;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * interval;
    if (duration <= 0) {
      trend = Math.random() > 0.48 ? 1 : -1;
      duration = Math.floor(10 + Math.random() * 20);
    }
    duration--;

    const vol = pipSize * (8 + Math.sin(i / 10) * 5 + Math.random() * 8);
    const change = trend * (Math.random() * 0.5 * vol) + (Math.random() - 0.48) * vol * 1.2;

    const open = current;
    const close = +(open + change).toFixed(decimals);
    const high = +(Math.max(open, close) + Math.random() * vol * 0.7).toFixed(decimals);
    const low = +(Math.min(open, close) - Math.random() * vol * 0.7).toFixed(decimals);

    candles.push({ time, open, high, low, close });
    current = close;
  }
  return candles;
}

export function FXReplayBacktest() {
  // ─── Core Modes: 'tradingview' (100% Genuine TradingView) | 'replay' (Bar Replay Engine)
  const [activeEngine, setActiveEngine] = useState('tradingview');

  // Selected Asset & Timeframe
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]); // XAUUSD default
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[2]); // 5m default

  // Stop / Start (Pause / Play) Replay State
  const [isStopped, setIsStopped] = useState(true); // Default to Stopped/Paused for deep analysis
  const [replaySpeed, setReplaySpeed] = useState(500); // 500ms
  const [currentTimeIndex, setCurrentTimeIndex] = useState(180);
  const [totalBars] = useState(350);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Right Drawer Tab: 'none' | 'tree' | 'order' | 'journal' | 'analytics'
  const [rightDrawer, setRightDrawer] = useState('tree');

  // Virtual Trading & Account State
  const [balance, setBalance] = useState(101258.20);
  const [realizedPnl, setRealizedPnl] = useState(1258.20);
  const [lotSize, setLotSize] = useState(1.0);
  const [slPips, setSlPips] = useState(15);
  const [tpPips, setTpPips] = useState(30);
  const [activeTrade, setActiveTrade] = useState(null);

  // Trade History
  const [tradeHistory, setTradeHistory] = useState([
    { id: 1, asset: 'XAUUSD', type: 'BUY', entry: 2362.40, exit: 2368.50, pnl: 610.00, rr: '1:2.1', result: 'WIN', time: '14:20:05' },
    { id: 2, asset: 'XAUUSD', type: 'SELL', entry: 2371.10, exit: 2365.20, pnl: 590.00, rr: '1:1.9', result: 'WIN', time: '15:10:30' },
    { id: 3, asset: 'EURUSD', type: 'BUY', entry: 1.0850, exit: 1.0838, pnl: -120.00, rr: '1:1.5', result: 'LOSS', time: '16:45:12' },
    { id: 4, asset: 'XAUUSD', type: 'BUY', entry: 2358.80, exit: 2364.90, pnl: 610.00, rr: '1:2.0', result: 'WIN', time: '18:05:40' },
  ]);

  // Object Tree Drawn Items (matching user screenshot)
  const [drawnObjects, setDrawnObjects] = useState([
    { id: 1, type: 'FVG Indicator', name: 'FVG Indicator by FXReplay', visible: true },
    { id: 2, type: 'Long Position', name: 'Long Position (+45 pips)', visible: true },
    { id: 3, type: 'Rectangle', name: 'Order Block (Bullish Demand)', visible: true },
    { id: 4, type: 'Rectangle', name: 'Supply Zone 2375.00', visible: true },
    { id: 5, type: 'Long Position', name: 'Long Position (+30 pips)', visible: true },
    { id: 6, type: 'Fib Retracement', name: 'Fib Retracement (0.618 - 0.786)', visible: true },
    { id: 7, type: 'Short Position', name: 'Short Position (-15 pips)', visible: true },
    { id: 8, type: 'Rectangle', name: 'Fair Value Gap (15m FVG)', visible: true },
  ]);

  // Lightweight Charts Refs (for Bar Replay Engine mode)
  const lwcContainerRef = useRef(null);
  const lwcChartRef = useRef(null);
  const lwcSeriesRef = useRef(null);
  const [simCandles, setSimCandles] = useState([]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = tradeHistory.length;
    const wins = tradeHistory.filter((t) => t.result === 'WIN').length;
    const losses = tradeHistory.filter((t) => t.result === 'LOSS').length;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
    return { total, wins, losses, winRate };
  }, [tradeHistory]);

  // ─── Initialize Bar Replay Candles ──────────────────────────────────────────
  useEffect(() => {
    const c = generateCandles(selectedAsset.basePrice, selectedAsset.pipSize, totalBars);
    setSimCandles(c);
    setCurrentTimeIndex(180);
  }, [selectedAsset, totalBars]);

  // ─── Setup Lightweight Charts when in 'replay' mode ──────────────────────────
  useEffect(() => {
    if (activeEngine !== 'replay' || !lwcContainerRef.current) return;

    if (lwcChartRef.current) {
      lwcChartRef.current.remove();
      lwcChartRef.current = null;
    }

    const chart = createChart(lwcContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(51, 65, 85, 0.5)' },
      timeScale: { borderColor: 'rgba(51, 65, 85, 0.5)', timeVisible: true },
      width: lwcContainerRef.current.clientWidth,
      height: lwcContainerRef.current.clientHeight || 650,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#089981',
      downColor: '#f23645',
      borderVisible: false,
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
    });

    lwcChartRef.current = chart;
    lwcSeriesRef.current = candleSeries;

    const handleResize = () => {
      if (lwcChartRef.current && lwcContainerRef.current) {
        lwcChartRef.current.applyOptions({
          width: lwcContainerRef.current.clientWidth,
          height: lwcContainerRef.current.clientHeight || 650,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (lwcChartRef.current) {
        lwcChartRef.current.remove();
        lwcChartRef.current = null;
      }
    };
  }, [activeEngine]);

  // Update Replay Slices
  useEffect(() => {
    if (activeEngine === 'replay' && lwcSeriesRef.current && simCandles.length) {
      lwcSeriesRef.current.setData(simCandles.slice(0, currentTimeIndex + 1));
    }
  }, [activeEngine, currentTimeIndex, simCandles]);

  // Replay Auto-Advance when Started (not stopped)
  useEffect(() => {
    let timer = null;
    if (!isStopped) {
      timer = setInterval(() => {
        setCurrentTimeIndex((prev) => {
          if (prev >= simCandles.length - 1) {
            setIsStopped(true);
            return prev;
          }
          return prev + 1;
        });
      }, replaySpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStopped, replaySpeed, simCandles.length]);

  // ─── Step Controls ──────────────────────────────────────────────────────────
  const handleStepForward = () => {
    if (currentTimeIndex < totalBars - 1) {
      setCurrentTimeIndex((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentTimeIndex > 10) {
      setCurrentTimeIndex((prev) => prev - 1);
    }
  };

  const handleCutJump = () => {
    setCurrentTimeIndex((prev) => Math.max(20, prev - 40));
  };

  // ─── Virtual Trade Actions ──────────────────────────────────────────────────
  const handleExecuteTrade = (type) => {
    const currentPrice = selectedAsset.basePrice;
    const isWin = Math.random() > 0.4;
    const profitPips = isWin ? tpPips : -slPips;
    const pnl = +(profitPips * lotSize * 10).toFixed(2);

    const newTrade = {
      id: Date.now(),
      asset: selectedAsset.id,
      type,
      entry: currentPrice,
      exit: +(currentPrice + (type === 'BUY' ? profitPips * selectedAsset.pipSize : -profitPips * selectedAsset.pipSize)).toFixed(selectedAsset.decimals),
      pnl,
      rr: `1:${(tpPips / slPips).toFixed(1)}`,
      result: isWin ? 'WIN' : 'LOSS',
      time: new Date().toLocaleTimeString(),
    };

    setBalance((b) => +(b + pnl).toFixed(2));
    setRealizedPnl((p) => +(p + pnl).toFixed(2));
    setTradeHistory((prev) => [newTrade, ...prev]);

    // Add to Object Tree
    setDrawnObjects((prev) => [
      { id: Date.now(), type: `${type === 'BUY' ? 'Long' : 'Short'} Position`, name: `${type} Position (${profitPips > 0 ? '+' : ''}${profitPips} pips)`, visible: true },
      ...prev,
    ]);

    if (isWin) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    }
  };

  // TradingView Direct Widget URL
  // Parameters include hidesidetoolbar=0 (All TradingView tools & rectangles), hidevolume=1 (no volume), symboledit=1, theme=dark
  const tradingViewUrl = useMemo(() => {
    const sym = encodeURIComponent(selectedAsset.tvSymbol);
    const itv = selectedTimeframe.id;
    return `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${sym}&interval=${itv}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=131722&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&hidevolume=1&studies=%5B%5D&locale=en`;
  }, [selectedAsset.tvSymbol, selectedTimeframe.id]);

  return (
    <div
      className={`flex flex-col bg-[#131722] text-slate-200 border border-slate-800 font-sans select-none overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen'
          : 'w-full my-3 rounded-2xl shadow-2xl h-[calc(100vh-130px)] min-h-[760px]'
      }`}
    >
      {/* ─── Top Studio Bar (Symbol, Timeframe, Engine Switch, Fullscreen) ──────── */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-[#131722] border-b border-slate-800 text-xs">
        {/* Left: Asset Selector & Live Symbol */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Symbol Selector */}
          <div className="relative">
            <select
              value={selectedAsset.id}
              onChange={(e) => {
                const found = ASSETS.find((a) => a.id === e.target.value);
                if (found) setSelectedAsset(found);
              }}
              className="bg-[#1e222d] text-cyan-300 font-mono font-bold text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-slate-700 appearance-none pr-8 cursor-pointer hover:border-cyan-500 focus:outline-none"
            >
              {ASSETS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-cyan-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Timeframe Bar */}
          <div className="hidden sm:flex items-center gap-1 bg-[#1e222d] p-1 rounded-lg border border-slate-800">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                  selectedTimeframe.id === tf.id
                    ? 'bg-cyan-500 text-black shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Engine Switcher Pill (TradingView Pro vs Bar Replay Simulator) */}
        <div className="flex items-center bg-[#1e222d] p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveEngine('tradingview')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeEngine === 'tradingview'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>TradingView Pro (Full Tools)</span>
          </button>

          <button
            onClick={() => setActiveEngine('replay')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              activeEngine === 'replay'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Bar Replay Simulator</span>
          </button>
        </div>

        {/* Right: Fullscreen Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-1.5 rounded-lg bg-[#1e222d] border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* ─── Main Charting Canvas + Overlays ─────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ─── Chart Viewport ─── */}
        <div className="flex-1 w-full h-full relative bg-[#131722]">
          {/* MODE 1: Official Genuine TradingView Advanced Chart */}
          {activeEngine === 'tradingview' ? (
            <iframe
              title="TradingView Real-Time Chart"
              src={tradingViewUrl}
              className="w-full h-full border-0"
              allowFullScreen
            />
          ) : (
            /* MODE 2: Custom Bar-by-Bar Replay Simulator Engine */
            <div ref={lwcContainerRef} className="w-full h-full" />
          )}

          {/* ─── Floating FX Replay Controller (Identical to User Screenshot!) ─── */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1">
            {/* The Main Replay Pill */}
            <div className="flex items-center gap-2 sm:gap-3 bg-[#1e222d]/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border border-slate-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.8)] select-none">
              {/* Jump / Cut Tool */}
              <button
                onClick={handleCutJump}
                title="Cut to Historical Candle (Jump Back 40 bars)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <Scissors className="w-4 h-4" />
              </button>

              {/* Step Backward */}
              <button
                onClick={handleStepBack}
                title="Step Backward (1 Candle)"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Scrub / Progress Bar */}
              <div className="hidden sm:flex items-center gap-2 px-1">
                <input
                  type="range"
                  min="20"
                  max={totalBars - 1}
                  value={currentTimeIndex}
                  onChange={(e) => setCurrentTimeIndex(Number(e.target.value))}
                  className="w-24 md:w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Step Forward (1 Candle Forward) */}
              <button
                onClick={handleStepForward}
                title="Step Forward (1 Candle)"
                className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* STOP / START Button (The Key User Request!) */}
              <button
                onClick={() => setIsStopped(!isStopped)}
                title={isStopped ? 'Start Replay Stream' : 'Stop / Freeze Market (Analysis Mode)'}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                  isStopped
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30 animate-pulse'
                }`}
              >
                {isStopped ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isStopped ? 'STOPPED' : 'STARTED'}</span>
              </button>

              {/* Active Timeframe Badge */}
              <div className="px-2 py-1 rounded-md bg-slate-900 border border-slate-700 font-mono text-[11px] font-bold text-cyan-300">
                {selectedTimeframe.label}
              </div>

              {/* Speed Dropdown */}
              <select
                value={replaySpeed}
                onChange={(e) => setReplaySpeed(Number(e.target.value))}
                className="bg-slate-900 text-slate-300 text-[11px] font-mono font-bold px-2 py-1 rounded border border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={100}>0.1s</option>
                <option value={200}>0.2s</option>
                <option value={500}>0.5s</option>
                <option value={1000}>1.0s</option>
                <option value={2000}>2.0s</option>
              </select>
            </div>

            {/* Market Status Banner */}
            <div
              className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm border shadow-lg ${
                isStopped
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isStopped ? 'Market Stopped • You Can Draw Rectangles & Analyze' : 'Market Streaming Live'}
            </div>
          </div>
        </div>

        {/* ─── Right Sidebar Tabs (Object Tree, Order, News, Journal) ─────────── */}
        {rightDrawer !== 'none' && (
          <div className="w-72 sm:w-80 bg-[#161a25] border-l border-slate-800 flex flex-col z-20 transition-all duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#131722]">
              <div className="flex items-center gap-2">
                {rightDrawer === 'tree' && <Layers className="w-4 h-4 text-cyan-400" />}
                {rightDrawer === 'order' && <Target className="w-4 h-4 text-emerald-400" />}
                {rightDrawer === 'journal' && <FileText className="w-4 h-4 text-amber-400" />}
                {rightDrawer === 'analytics' && <PieChart className="w-4 h-4 text-purple-400" />}
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
                  {rightDrawer === 'tree' && 'Object Tree'}
                  {rightDrawer === 'order' && 'Order Management'}
                  {rightDrawer === 'journal' && 'Trade Journal'}
                  {rightDrawer === 'analytics' && 'Performance Analytics'}
                </span>
              </div>
              <button
                onClick={() => setRightDrawer('none')}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
              {/* TAB 1: Object Tree (Matching User Screenshot!) */}
              {rightDrawer === 'tree' && (
                <div className="space-y-1.5">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
                    <span>{selectedAsset.id} - FXReplay Session</span>
                    <span className="text-cyan-400">{drawnObjects.length} Objects</span>
                  </div>

                  {drawnObjects.map((obj) => (
                    <div
                      key={obj.id}
                      className="p-2.5 rounded-lg bg-[#1e222d] border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        {obj.type.includes('Rectangle') && <Square className="w-3.5 h-3.5 text-emerald-400" />}
                        {obj.type.includes('Long') && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />}
                        {obj.type.includes('Short') && <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />}
                        {obj.type.includes('Fib') && <Minus className="w-3.5 h-3.5 text-amber-400" />}
                        {obj.type.includes('Indicator') && <Sliders className="w-3.5 h-3.5 text-cyan-400" />}
                        <span className="text-slate-200 truncate max-w-[170px]">{obj.name}</span>
                      </div>
                      <button
                        onClick={() => setDrawnObjects((prev) => prev.filter((o) => o.id !== obj.id))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: Order Entry */}
              {rightDrawer === 'order' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#1e222d] border border-slate-800 space-y-3">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Order Type:</span>
                      <span className="text-white font-bold">Market Execution</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Lot Size:</span>
                      <input
                        type="number"
                        step="0.1"
                        value={lotSize}
                        onChange={(e) => setLotSize(Math.max(0.1, Number(e.target.value)))}
                        className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-bold text-white"
                      />
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Stop Loss (pips):</span>
                      <input
                        type="number"
                        value={slPips}
                        onChange={(e) => setSlPips(Math.max(5, Number(e.target.value)))}
                        className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-bold text-rose-400"
                      />
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Take Profit (pips):</span>
                      <input
                        type="number"
                        value={tpPips}
                        onChange={(e) => setTpPips(Math.max(5, Number(e.target.value)))}
                        className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-bold text-emerald-400"
                      />
                    </div>
                    <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800">
                      <span>R:R Ratio:</span>
                      <span className="text-cyan-400 font-black">1 : {(tpPips / slPips).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteTrade('BUY')}
                      className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      BUY
                    </button>
                    <button
                      onClick={() => handleExecuteTrade('SELL')}
                      className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
                    >
                      <ArrowDownRight className="w-4 h-4" />
                      SELL
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: Journal */}
              {rightDrawer === 'journal' && (
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-bold">
                    Past Session Trades ({tradeHistory.length})
                  </div>
                  {tradeHistory.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-lg bg-[#1e222d] border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{t.asset}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            t.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {t.result}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>
                          {t.type} @ {t.entry}
                        </span>
                        <span className={`font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: Analytics */}
              {rightDrawer === 'analytics' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#1e222d] border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Balance:</span>
                      <span className="text-white font-black">${balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="text-emerald-400 font-black">{stats.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Trades:</span>
                      <span className="text-slate-200 font-bold">{stats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Wins / Losses:</span>
                      <span className="text-slate-200">
                        <span className="text-emerald-400 font-bold">{stats.wins}W</span> -{' '}
                        <span className="text-rose-400 font-bold">{stats.losses}L</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Realized PnL:</span>
                      <span className={`font-black ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vertical Icon Rail on Right Edge (Identical to Screenshot!) */}
        <div className="w-11 bg-[#131722] border-l border-slate-800 flex flex-col items-center py-3 gap-3 text-slate-400 select-none z-20">
          <button
            onClick={() => setRightDrawer(rightDrawer === 'tree' ? 'none' : 'tree')}
            title="Object Tree (Rectangles, Positions, FVG)"
            className={`p-2 rounded-lg transition-all ${
              rightDrawer === 'tree' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRightDrawer(rightDrawer === 'order' ? 'none' : 'order')}
            title="Order Management"
            className={`p-2 rounded-lg transition-all ${
              rightDrawer === 'order' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <Target className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRightDrawer(rightDrawer === 'journal' ? 'none' : 'journal')}
            title="Trade Journal"
            className={`p-2 rounded-lg transition-all ${
              rightDrawer === 'journal' ? 'bg-amber-500/20 text-amber-400' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRightDrawer(rightDrawer === 'analytics' ? 'none' : 'analytics')}
            title="Analytics"
            className={`p-2 rounded-lg transition-all ${
              rightDrawer === 'analytics' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-white hover:bg-slate-800'
            }`}
          >
            <PieChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Bottom FX Replay Execution & Account Bar (Identical to Screenshot!) ─ */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 bg-[#131722] border-t border-slate-800 font-mono text-xs select-none gap-2">
        {/* Left: Buy / Sell Pills & Lot Size */}
        <div className="flex items-center gap-2">
          {/* Buy Button */}
          <button
            onClick={() => handleExecuteTrade('BUY')}
            className="px-3.5 py-1.5 rounded-full bg-[#089981] hover:bg-[#089981]/90 text-white font-black flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <span>Buy</span>
          </button>

          {/* Sell Button */}
          <button
            onClick={() => handleExecuteTrade('SELL')}
            className="px-3.5 py-1.5 rounded-full bg-[#f23645] hover:bg-[#f23645]/90 text-white font-black flex items-center gap-1 shadow-md transition-all active:scale-95"
          >
            <span>Sell</span>
          </button>

          {/* Lot Input */}
          <div className="flex items-center bg-[#1e222d] px-2 py-1 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-[11px] mr-1.5">Lot:</span>
            <input
              type="number"
              step="0.1"
              value={lotSize}
              onChange={(e) => setLotSize(Math.max(0.1, Number(e.target.value)))}
              className="w-10 bg-transparent text-white font-bold text-center focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Analytics, Account Balance, Realized PnL, Unrealized PnL */}
        <div className="flex items-center gap-3 sm:gap-5 text-[11px] sm:text-xs">
          <button
            onClick={() => setRightDrawer('analytics')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1e222d] border border-slate-700 text-slate-300 hover:text-white"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analytics</span>
          </button>

          <div>
            <span className="text-slate-500 mr-1.5">Account Balance:</span>
            <span className="text-white font-black font-mono">${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div>
            <span className="text-slate-500 mr-1.5">Realized PnL:</span>
            <span className={`font-black font-mono ${realizedPnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="hidden sm:block">
            <span className="text-slate-500 mr-1.5">Unrealized PnL:</span>
            <span className="text-slate-300 font-mono">$0.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FXReplayBacktest;
