import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Crosshair,
  Minus,
  Square,
  Type,
  Trash2,
  Undo2,
  Compass,
  Ruler,
  HelpCircle,
  X,
  FileText,
  PieChart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Supported Assets & Starting Data Configuration ──────────────────────────
const ASSETS = [
  { id: 'XAUUSD', name: 'Gold (XAU/USD)', basePrice: 2365.50, pipSize: 0.1, spread: 0.2, decimals: 2 },
  { id: 'EURUSD', name: 'EUR / USD', basePrice: 1.0865, pipSize: 0.0001, spread: 0.0001, decimals: 5 },
  { id: 'GBPUSD', name: 'GBP / USD', basePrice: 1.2740, pipSize: 0.0001, spread: 0.0001, decimals: 5 },
  { id: 'USDJPY', name: 'USD / JPY', basePrice: 154.20, pipSize: 0.01, spread: 0.01, decimals: 3 },
  { id: 'BTCUSD', name: 'Bitcoin (BTC/USD)', basePrice: 64800.0, pipSize: 1.0, spread: 5.0, decimals: 1 },
  { id: 'ETHUSD', name: 'Ethereum (ETH/USD)', basePrice: 3450.0, pipSize: 0.1, spread: 0.5, decimals: 2 },
  { id: 'US30', name: 'US30 (Dow Jones)', basePrice: 39850.0, pipSize: 1.0, spread: 2.0, decimals: 1 },
];

const TIMEFRAMES = [
  { id: '1m', label: '1m', seconds: 60 },
  { id: '3m', label: '3m', seconds: 180 },
  { id: '5m', label: '5m', seconds: 300 },
  { id: '15m', label: '15m', seconds: 900 },
  { id: '30m', label: '30m', seconds: 1800 },
  { id: '1h', label: '1H', seconds: 3600 },
  { id: '4h', label: '4H', seconds: 14400 },
  { id: '1d', label: '1D', seconds: 86400 },
];

const SPEED_OPTIONS = [
  { label: '0.1s', value: 100 },
  { label: '0.2s', value: 200 },
  { label: '0.5s', value: 500 },
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
];

const ZONE_COLORS = [
  { id: 'emerald', hex: '#089981', label: 'Demand / Bullish OB' },
  { id: 'rose', hex: '#f23645', label: 'Supply / Bearish OB' },
  { id: 'cyan', hex: '#00f0ff', label: 'Fair Value Gap (FVG)' },
  { id: 'purple', hex: '#a855f7', label: 'Liquidity Pool' },
  { id: 'amber', hex: '#f59e0b', label: 'Breaker Block' },
];

// ─── Realistic Candle Generator ──────────────────────────────────────────────
function generateCandles(basePrice, pipSize, count = 450) {
  const candles = [];
  let current = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const interval = 300; // 5m
  const startTime = now - count * interval;
  const isHigh = basePrice > 100;
  const decimals = isHigh ? 2 : 5;

  let trend = 1;
  let trendDuration = 0;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * interval;
    if (trendDuration <= 0) {
      trend = Math.random() > 0.48 ? 1 : -1;
      trendDuration = Math.floor(10 + Math.random() * 25);
    }
    trendDuration--;

    const baseVol = pipSize * (8 + Math.sin(i / 10) * 6 + Math.random() * 9);
    const change = trend * (Math.random() * 0.55 * baseVol) + (Math.random() - 0.48) * baseVol * 1.3;

    const open = current;
    const close = +(open + change).toFixed(decimals);
    const high = +(Math.max(open, close) + Math.random() * baseVol * 0.75).toFixed(decimals);
    const low = +(Math.min(open, close) - Math.random() * baseVol * 0.75).toFixed(decimals);

    candles.push({ time, open, high, low, close });
    current = close;
  }
  return candles;
}

// ─── Technical Indicator Calculations ────────────────────────────────────────
function calculateEMA(data, period) {
  if (!data || data.length === 0) return [];
  const k = 2 / (period + 1);
  const ema = [];
  let prev = data[0]?.close || 0;
  const isHigh = (data[0]?.close || 0) > 100;

  for (let i = 0; i < data.length; i++) {
    const c = data[i].close;
    prev = i === 0 ? c : c * k + prev * (1 - k);
    ema.push({
      time: data[i].time,
      value: +prev.toFixed(isHigh ? 2 : 5),
    });
  }
  return ema;
}

function calculateBollingerBands(data, period = 20, mult = 2) {
  if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
  const upper = [];
  const middle = [];
  const lower = [];
  const isHigh = (data[0]?.close || 0) > 100;
  const dec = isHigh ? 2 : 5;

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sma = slice.reduce((a, b) => a + b.close, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b.close - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    const time = data[i].time;

    upper.push({ time, value: +(sma + mult * stdDev).toFixed(dec) });
    middle.push({ time, value: +sma.toFixed(dec) });
    lower.push({ time, value: +(sma - mult * stdDev).toFixed(dec) });
  }
  return { upper, middle, lower };
}

function calculateSupertrend(data, period = 10, mult = 3) {
  if (!data || data.length < period + 1) return [];
  const tr = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) tr.push(data[i].high - data[i].low);
    else {
      tr.push(Math.max(
        data[i].high - data[i].low,
        Math.abs(data[i].high - data[i - 1].close),
        Math.abs(data[i].low - data[i - 1].close)
      ));
    }
  }

  const atr = [];
  let sum = tr.slice(0, period).reduce((a, b) => a + b, 0);
  atr[period - 1] = sum / period;
  for (let i = period; i < data.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
  }

  const res = [];
  let trend = 1;
  let prevUp = 0;
  let prevLow = 0;
  const isHigh = (data[0]?.close || 0) > 100;
  const dec = isHigh ? 2 : 5;

  for (let i = period - 1; i < data.length; i++) {
    const hl2 = (data[i].high + data[i].low) / 2;
    const curAtr = atr[i] || 0.01;
    let up = hl2 + mult * curAtr;
    let low = hl2 - mult * curAtr;

    if (i > period - 1) {
      if (low < prevLow && data[i - 1].close > prevLow) low = prevLow;
      if (up > prevUp && data[i - 1].close < prevUp) up = prevUp;
    }

    if (trend === 1 && data[i].close < low) trend = -1;
    else if (trend === -1 && data[i].close > up) trend = 1;

    const val = trend === 1 ? low : up;
    res.push({
      time: data[i].time,
      value: +val.toFixed(dec),
      color: trend === 1 ? '#089981' : '#f23645',
    });

    prevUp = up;
    prevLow = low;
  }
  return res;
}

function calculateRSI(data, period = 14) {
  if (!data || data.length < period + 1) return [];
  const rsi = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const d = data[i].close - data[i - 1].close;
    if (d >= 0) gains += d;
    else losses -= d;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const d = data[i].close - data[i - 1].close;
    if (d >= 0) {
      avgGain = (avgGain * (period - 1) + d) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - d) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiVal = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);
    rsi.push({ time: data[i].time, value: +rsiVal.toFixed(2) });
  }
  return rsi;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function FXReplayBacktest() {
  const rootContainerRef = useRef(null);
  const chartContainerRef = useRef(null);
  const rsiContainerRef = useRef(null);
  const svgRef = useRef(null);

  // Chart References
  const chartRef = useRef(null);
  const rsiChartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const ema20SeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);
  const ema200SeriesRef = useRef(null);
  const bbUpperRef = useRef(null);
  const bbMiddleRef = useRef(null);
  const bbLowerRef = useRef(null);
  const supertrendRef = useRef(null);
  const rsiSeriesRef = useRef(null);

  // Active Trade Lines on Chart
  const entryLineRef = useRef(null);
  const slLineRef = useRef(null);
  const tpLineRef = useRef(null);

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Asset & Timeframe
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[2]); // 5m

  // Replay State (The Core Backtesting Engine!)
  const [allCandles, setAllCandles] = useState([]);
  const [replayIndex, setReplayIndex] = useState(180);
  const [isStopped, setIsStopped] = useState(true); // Default to Stopped/Paused
  const [replaySpeed, setReplaySpeed] = useState(500); // 500ms

  // Indicator Toggles (Visible in Top Bar!)
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showSupertrend, setShowSupertrend] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // ─── Left Drawing Tools State (TradingView Style) ───────────────────────────
  // Tools: 'cursor', 'rectangle', 'trendline', 'horizontal', 'fib', 'long_pos', 'short_pos', 'text', 'ruler'
  const [activeTool, setActiveTool] = useState('cursor');
  const [selectedColor, setSelectedColor] = useState('#089981');
  const [selectedLabel, setSelectedLabel] = useState('Order Block');
  const [drawings, setDrawings] = useState([
    { id: 1, type: 'rectangle', startX: 180, startY: 140, currentX: 360, currentY: 210, color: '#089981', label: 'Demand Zone (Bullish OB)' },
    { id: 2, type: 'horizontal', y: 310, color: '#f23645', label: 'Resistance 2,374.50' },
  ]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredDrawingId, setHoveredDrawingId] = useState(null);

  // ─── Right Drawer & Panels ──────────────────────────────────────────────────
  const [rightPanel, setRightPanel] = useState('tree'); // 'tree', 'order', 'journal', 'analytics', 'none'

  // Virtual Trading & Balance HUD
  const [balance, setBalance] = useState(101258.20);
  const [realizedPnl, setRealizedPnl] = useState(1258.20);
  const [lotSize, setLotSize] = useState(1.0);
  const [slPips, setSlPips] = useState(15);
  const [tpPips, setTpPips] = useState(30);
  const [activeTrade, setActiveTrade] = useState(null);

  // Trade History
  const [tradeHistory, setTradeHistory] = useState([
    { id: 1, asset: 'XAUUSD', type: 'BUY', entry: 2362.40, exit: 2368.50, pnl: 610.00, rr: '1:2.0', result: 'WIN', time: '14:20:00' },
    { id: 2, asset: 'XAUUSD', type: 'SELL', entry: 2371.10, exit: 2365.20, pnl: 590.00, rr: '1:1.9', result: 'WIN', time: '15:10:00' },
    { id: 3, asset: 'EURUSD', type: 'BUY', entry: 1.0850, exit: 1.0838, pnl: -120.00, rr: '1:1.5', result: 'LOSS', time: '16:45:00' },
    { id: 4, asset: 'XAUUSD', type: 'BUY', entry: 2358.80, exit: 2364.90, pnl: 610.00, rr: '1:2.0', result: 'WIN', time: '18:05:00' },
  ]);

  const stats = useMemo(() => {
    const total = tradeHistory.length;
    const wins = tradeHistory.filter((t) => t.result === 'WIN').length;
    const losses = tradeHistory.filter((t) => t.result === 'LOSS').length;
    const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
    return { total, wins, losses, winRate };
  }, [tradeHistory]);

  // ─── Initialize Candles when Asset Changes ─────────────────────────────────
  useEffect(() => {
    const candles = generateCandles(selectedAsset.basePrice, selectedAsset.pipSize, 450);
    setAllCandles(candles);
    setReplayIndex(180);
    setIsStopped(true);
    setActiveTrade(null);
  }, [selectedAsset]);

  // ─── Setup Native Lightweight-Charts Engine ─────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    if (rsiChartRef.current) {
      rsiChartRef.current.remove();
      rsiChartRef.current = null;
    }

    const width = chartContainerRef.current.clientWidth || 1000;
    const height = chartContainerRef.current.clientHeight || (isFullscreen ? window.innerHeight - 130 : 650);

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        scaleMargins: { top: 0.08, bottom: 0.12 },
      },
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
      width,
      height: showRSI ? height - 120 : height,
    });

    // Pure Candlestick Series (NO VOLUME HISTOGRAM)
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#089981',
      downColor: '#f23645',
      borderVisible: false,
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
    });

    // Indicators Series on Chart
    const ema20 = chart.addLineSeries({ color: '#00f0ff', lineWidth: 1.5, title: 'EMA 20' });
    const ema50 = chart.addLineSeries({ color: '#a855f7', lineWidth: 1.5, title: 'EMA 50' });
    const ema200 = chart.addLineSeries({ color: '#f59e0b', lineWidth: 2, title: 'EMA 200' });
    const bbUp = chart.addLineSeries({ color: 'rgba(56, 189, 248, 0.8)', lineWidth: 1, title: 'BB Upper' });
    const bbMid = chart.addLineSeries({ color: 'rgba(148, 163, 184, 0.6)', lineWidth: 1, lineStyle: LineStyle.Dotted, title: 'BB Basis' });
    const bbLow = chart.addLineSeries({ color: 'rgba(56, 189, 248, 0.8)', lineWidth: 1, title: 'BB Lower' });
    const supertrend = chart.addLineSeries({ color: '#089981', lineWidth: 2, title: 'Supertrend' });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema20SeriesRef.current = ema20;
    ema50SeriesRef.current = ema50;
    ema200SeriesRef.current = ema200;
    bbUpperRef.current = bbUp;
    bbMiddleRef.current = bbMid;
    bbLowerRef.current = bbLow;
    supertrendRef.current = supertrend;

    // RSI Sub-chart if active
    if (showRSI && rsiContainerRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#0c1017' },
          textColor: '#64748b',
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.2)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.2)' },
        },
        rightPriceScale: { borderColor: 'rgba(51, 65, 85, 0.4)' },
        timeScale: { visible: false },
        width,
        height: 110,
      });

      const rsiSeries = rsiChart.addLineSeries({ color: '#f59e0b', lineWidth: 1.5, title: 'RSI 14' });
      rsiSeries.createPriceLine({ price: 70, color: 'rgba(242, 54, 69, 0.6)', lineWidth: 1, lineStyle: 2, title: 'OB 70' });
      rsiSeries.createPriceLine({ price: 30, color: 'rgba(8, 153, 129, 0.6)', lineWidth: 1, lineStyle: 2, title: 'OS 30' });

      rsiChartRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        const w = chartContainerRef.current.clientWidth;
        const h = chartContainerRef.current.clientHeight || (isFullscreen ? window.innerHeight - 130 : 650);
        chartRef.current.applyOptions({ width: w, height: showRSI ? h - 120 : h });
      }
      if (rsiContainerRef.current && rsiChartRef.current) {
        rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
      }
    };
  }, [showRSI, isFullscreen]);

  // ─── Update Slices when replayIndex Changes ─────────────────────────────────
  useEffect(() => {
    if (!allCandles.length || !candleSeriesRef.current) return;

    const visible = allCandles.slice(0, replayIndex + 1);
    candleSeriesRef.current.setData(visible);

    // EMA 20
    if (ema20SeriesRef.current) {
      ema20SeriesRef.current.setData(showEMA20 && visible.length > 5 ? calculateEMA(visible, 20) : []);
    }
    // EMA 50
    if (ema50SeriesRef.current) {
      ema50SeriesRef.current.setData(showEMA50 && visible.length > 10 ? calculateEMA(visible, 50) : []);
    }
    // EMA 200
    if (ema200SeriesRef.current) {
      ema200SeriesRef.current.setData(showEMA200 && visible.length > 25 ? calculateEMA(visible, 200) : []);
    }
    // Bollinger Bands
    if (bbUpperRef.current && bbMiddleRef.current && bbLowerRef.current) {
      if (showBB && visible.length > 20) {
        const { upper, middle, lower } = calculateBollingerBands(visible, 20, 2);
        bbUpperRef.current.setData(upper);
        bbMiddleRef.current.setData(middle);
        bbLowerRef.current.setData(lower);
      } else {
        bbUpperRef.current.setData([]);
        bbMiddleRef.current.setData([]);
        bbLowerRef.current.setData([]);
      }
    }
    // Supertrend
    if (supertrendRef.current) {
      supertrendRef.current.setData(showSupertrend && visible.length > 12 ? calculateSupertrend(visible, 10, 3) : []);
    }
    // RSI
    if (rsiSeriesRef.current && showRSI) {
      rsiSeriesRef.current.setData(visible.length > 15 ? calculateRSI(visible, 14) : []);
    }

    // Evaluate active trade
    if (activeTrade) {
      const cur = visible[visible.length - 1];
      checkTrade(cur);
    }
  }, [replayIndex, allCandles, showEMA20, showEMA50, showEMA200, showBB, showSupertrend, showRSI]);

  // ─── Replay Auto-Streaming when STARTED ─────────────────────────────────────
  useEffect(() => {
    let timer = null;
    if (!isStopped) {
      timer = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= allCandles.length - 1) {
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
  }, [isStopped, replaySpeed, allCandles.length]);

  // ─── Step Forward & Backward Actions ────────────────────────────────────────
  const handleStepForward = () => {
    if (replayIndex < allCandles.length - 1) {
      setReplayIndex((p) => p + 1);
    }
  };

  const handleStepBack = () => {
    if (replayIndex > 10) {
      setReplayIndex((p) => p - 1);
    }
  };

  const handleCutJump = () => {
    setReplayIndex((p) => Math.max(20, p - 40));
  };

  // ─── Fullscreen Toggle (Physical Fullscreen API + Fixed 100vw/100vh) ────────
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // ─── Trade Evaluation ───────────────────────────────────────────────────────
  const checkTrade = (candle) => {
    if (!activeTrade || !candle) return;
    let hitWin = false;
    let hitLoss = false;

    if (activeTrade.type === 'BUY') {
      if (candle.high >= activeTrade.tp) hitWin = true;
      else if (candle.low <= activeTrade.sl) hitLoss = true;
    } else {
      if (candle.low <= activeTrade.tp) hitWin = true;
      else if (candle.high >= activeTrade.sl) hitLoss = true;
    }

    if (hitWin || hitLoss) {
      const pnl = hitWin ? +(slPips * lotSize * 10 * (tpPips / slPips)).toFixed(2) : -(slPips * lotSize * 10);
      const newRecord = {
        id: Date.now(),
        asset: selectedAsset.id,
        type: activeTrade.type,
        entry: activeTrade.entry,
        exit: hitWin ? activeTrade.tp : activeTrade.sl,
        pnl,
        rr: `1:${(tpPips / slPips).toFixed(1)}`,
        result: hitWin ? 'WIN' : 'LOSS',
        time: new Date().toLocaleTimeString(),
      };

      setBalance((b) => +(b + pnl).toFixed(2));
      setRealizedPnl((r) => +(r + pnl).toFixed(2));
      setTradeHistory((hist) => [newRecord, ...hist]);
      setActiveTrade(null);
      clearTradeLines();

      if (hitWin) {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      }
    }
  };

  const clearTradeLines = () => {
    if (!candleSeriesRef.current) return;
    if (entryLineRef.current) {
      candleSeriesRef.current.removePriceLine(entryLineRef.current);
      entryLineRef.current = null;
    }
    if (slLineRef.current) {
      candleSeriesRef.current.removePriceLine(slLineRef.current);
      slLineRef.current = null;
    }
    if (tpLineRef.current) {
      candleSeriesRef.current.removePriceLine(tpLineRef.current);
      tpLineRef.current = null;
    }
  };

  const handleExecuteTrade = (type) => {
    if (!allCandles.length || !candleSeriesRef.current) return;
    clearTradeLines();

    const cur = allCandles[replayIndex];
    const entry = cur.close;
    const pip = selectedAsset.pipSize;
    const dec = selectedAsset.decimals;

    const sl = type === 'BUY' ? +(entry - slPips * pip).toFixed(dec) : +(entry + slPips * pip).toFixed(dec);
    const tp = type === 'BUY' ? +(entry + tpPips * pip).toFixed(dec) : +(entry - tpPips * pip).toFixed(dec);

    entryLineRef.current = candleSeriesRef.current.createPriceLine({
      price: entry,
      color: '#00f0ff',
      lineWidth: 2,
      lineStyle: 0,
      title: `ENTRY (${type})`,
    });

    slLineRef.current = candleSeriesRef.current.createPriceLine({
      price: sl,
      color: '#f23645',
      lineWidth: 2,
      lineStyle: 2,
      title: `SL (${slPips} pips)`,
    });

    tpLineRef.current = candleSeriesRef.current.createPriceLine({
      price: tp,
      color: '#089981',
      lineWidth: 2,
      lineStyle: 2,
      title: `TP (${tpPips} pips)`,
    });

    setActiveTrade({ type, entry, sl, tp });

    // Also add to drawings object tree
    setDrawings((prev) => [
      {
        id: Date.now(),
        type: type === 'BUY' ? 'long_pos' : 'short_pos',
        startX: 300,
        startY: 250,
        color: type === 'BUY' ? '#089981' : '#f23645',
        label: `${type} Position (${selectedAsset.id})`,
      },
      ...prev,
    ]);
  };

  // ─── SVG Drawing Tools Handlers ─────────────────────────────────────────────
  const getCoords = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e) => {
    if (activeTool === 'cursor') return;
    const { x, y } = getCoords(e);
    setIsDrawing(true);
    const newId = 'draw_' + Date.now();

    if (activeTool === 'rectangle') {
      setCurrentDrawing({
        id: newId,
        type: 'rectangle',
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        color: selectedColor,
        label: selectedLabel,
      });
    } else if (activeTool === 'trendline') {
      setCurrentDrawing({
        id: newId,
        type: 'trendline',
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        color: selectedColor,
        label: 'Trendline',
      });
    } else if (activeTool === 'horizontal') {
      setDrawings((prev) => [
        { id: newId, type: 'horizontal', y, color: selectedColor, label: `Level ${(selectedAsset.basePrice).toFixed(selectedAsset.decimals)}` },
        ...prev,
      ]);
      setIsDrawing(false);
      setActiveTool('cursor');
    } else if (activeTool === 'fib') {
      setCurrentDrawing({
        id: newId,
        type: 'fib',
        startX: x,
        startY: y,
        currentX: x + 150,
        currentY: y - 100,
        color: '#f59e0b',
        label: 'Fib Retracement',
      });
    } else if (activeTool === 'long_pos') {
      setDrawings((prev) => [
        { id: newId, type: 'long_pos', startX: x, startY: y, color: '#089981', label: 'Long Position' },
        ...prev,
      ]);
      setIsDrawing(false);
      setActiveTool('cursor');
    } else if (activeTool === 'short_pos') {
      setDrawings((prev) => [
        { id: newId, type: 'short_pos', startX: x, startY: y, color: '#f23645', label: 'Short Position' },
        ...prev,
      ]);
      setIsDrawing(false);
      setActiveTool('cursor');
    } else if (activeTool === 'text') {
      const txt = prompt('Enter Annotation / Order Block Note:', 'Key Liquidity Zone');
      if (txt) {
        setDrawings((prev) => [
          { id: newId, type: 'text', x, y, text: txt, color: selectedColor, label: txt },
          ...prev,
        ]);
      }
      setIsDrawing(false);
      setActiveTool('cursor');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentDrawing) return;
    const { x, y } = getCoords(e);
    setCurrentDrawing((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDrawing) return;
    if (currentDrawing.type === 'rectangle') {
      const w = Math.abs(currentDrawing.currentX - currentDrawing.startX);
      const h = Math.abs(currentDrawing.currentY - currentDrawing.startY);
      if (w > 6 && h > 6) {
        setDrawings((prev) => [currentDrawing, ...prev]);
      }
    } else if (currentDrawing.type === 'trendline' || currentDrawing.type === 'fib') {
      setDrawings((prev) => [currentDrawing, ...prev]);
    }
    setIsDrawing(false);
    setCurrentDrawing(null);
    setActiveTool('cursor');
  };

  // ─── Render SVG Drawings ────────────────────────────────────────────────────
  const renderDrawing = (d, isPreview = false) => {
    if (d.type === 'rectangle') {
      const x = Math.min(d.startX, d.currentX);
      const y = Math.min(d.startY, d.currentY);
      const w = Math.abs(d.currentX - d.startX);
      const h = Math.abs(d.currentY - d.startY);

      return (
        <g
          key={d.id}
          onMouseEnter={() => setHoveredDrawingId(d.id)}
          onMouseLeave={() => setHoveredDrawingId(null)}
          className="cursor-pointer"
        >
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            fill={d.color}
            fillOpacity={isPreview ? 0.35 : 0.2}
            stroke={d.color}
            strokeWidth={1.5}
            strokeDasharray={isPreview ? '4 2' : 'none'}
            rx={3}
          />
          <rect x={x + 4} y={y + 4} width={Math.min(w - 8, d.label.length * 6.5 + 14)} height={16} fill="rgba(19, 23, 34, 0.9)" rx={3} />
          <text x={x + 8} y={y + 15} fill={d.color} fontSize="10" fontFamily="monospace" fontWeight="bold">
            {d.label}
          </text>
          {!isPreview && hoveredDrawingId === d.id && (
            <g transform={`translate(${x + w - 16}, ${y + 4})`} onClick={() => setDrawings((prev) => prev.filter((o) => o.id !== d.id))}>
              <rect width={13} height={13} fill="#f23645" rx={2} />
              <text x={3} y={10} fill="#fff" fontSize="9" fontWeight="bold">×</text>
            </g>
          )}
        </g>
      );
    }

    if (d.type === 'trendline') {
      return (
        <g key={d.id} onMouseEnter={() => setHoveredDrawingId(d.id)} onMouseLeave={() => setHoveredDrawingId(null)}>
          <line x1={d.startX} y1={d.startY} x2={d.currentX} y2={d.currentY} stroke={d.color} strokeWidth={2} />
          <circle cx={d.startX} cy={d.startY} r={4} fill={d.color} />
          <circle cx={d.currentX} cy={d.currentY} r={4} fill={d.color} />
          {!isPreview && hoveredDrawingId === d.id && (
            <g transform={`translate(${d.currentX + 6}, ${d.currentY - 6})`} onClick={() => setDrawings((prev) => prev.filter((o) => o.id !== d.id))}>
              <rect width={13} height={13} fill="#f23645" rx={2} />
              <text x={3} y={10} fill="#fff" fontSize="9" fontWeight="bold">×</text>
            </g>
          )}
        </g>
      );
    }

    if (d.type === 'horizontal') {
      return (
        <g key={d.id} onMouseEnter={() => setHoveredDrawingId(d.id)} onMouseLeave={() => setHoveredDrawingId(null)}>
          <line x1={0} y1={d.y} x2="100%" y2={d.y} stroke={d.color} strokeWidth={1.5} strokeDasharray="4 3" />
          <rect x={12} y={d.y - 9} width={90} height={18} fill="rgba(19, 23, 34, 0.9)" rx={3} />
          <text x={18} y={d.y + 4} fill={d.color} fontSize="10" fontFamily="monospace" fontWeight="bold">
            {d.label}
          </text>
          {!isPreview && hoveredDrawingId === d.id && (
            <g transform={`translate(108, ${d.y - 7})`} onClick={() => setDrawings((prev) => prev.filter((o) => o.id !== d.id))}>
              <rect width={13} height={13} fill="#f23645" rx={2} />
              <text x={3} y={10} fill="#fff" fontSize="9" fontWeight="bold">×</text>
            </g>
          )}
        </g>
      );
    }

    if (d.type === 'fib') {
      const top = Math.min(d.startY, d.currentY);
      const height = Math.abs(d.currentY - d.startY);
      const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];
      const colors = ['#f23645', '#f97316', '#089981', '#00f0ff', '#3b82f6', '#a855f7', '#64748b'];

      return (
        <g key={d.id} onMouseEnter={() => setHoveredDrawingId(d.id)} onMouseLeave={() => setHoveredDrawingId(null)}>
          {levels.map((lvl, idx) => {
            const yLvl = top + height * lvl;
            return (
              <g key={lvl}>
                <line x1={d.startX} y1={yLvl} x2={d.currentX + 100} y2={yLvl} stroke={colors[idx]} strokeWidth={1} strokeDasharray="2 2" />
                <text x={d.startX + 5} y={yLvl - 3} fill={colors[idx]} fontSize="9" fontFamily="monospace">
                  {lvl} ({(lvl * 100).toFixed(1)}%)
                </text>
              </g>
            );
          })}
        </g>
      );
    }

    if (d.type === 'long_pos') {
      return (
        <g key={d.id} transform={`translate(${d.startX}, ${d.startY})`}>
          <rect y={-55} width={140} height={55} fill="rgba(8, 153, 129, 0.22)" stroke="#089981" strokeWidth={1} />
          <text x={6} y={-38} fill="#089981" fontSize="10" fontWeight="bold" fontFamily="monospace">TARGET +30 pips</text>
          <text x={6} y={-22} fill="#089981" fontSize="9" fontFamily="monospace">R:R 2.0 (Win)</text>
          <line x1={0} y1={0} x2={140} y2={0} stroke="#00f0ff" strokeWidth={2} />
          <rect y={0} width={140} height={30} fill="rgba(242, 54, 69, 0.22)" stroke="#f23645" strokeWidth={1} />
          <text x={6} y={18} fill="#f23645" fontSize="10" fontWeight="bold" fontFamily="monospace">STOP -15 pips</text>
        </g>
      );
    }

    if (d.type === 'short_pos') {
      return (
        <g key={d.id} transform={`translate(${d.startX}, ${d.startY})`}>
          <rect y={-30} width={140} height={30} fill="rgba(242, 54, 69, 0.22)" stroke="#f23645" strokeWidth={1} />
          <text x={6} y={-14} fill="#f23645" fontSize="10" fontWeight="bold" fontFamily="monospace">STOP -15 pips</text>
          <line x1={0} y1={0} x2={140} y2={0} stroke="#00f0ff" strokeWidth={2} />
          <rect y={0} width={140} height={55} fill="rgba(8, 153, 129, 0.22)" stroke="#089981" strokeWidth={1} />
          <text x={6} y={18} fill="#089981" fontSize="10" fontWeight="bold" fontFamily="monospace">TARGET +30 pips</text>
          <text x={6} y={34} fill="#089981" fontSize="9" fontFamily="monospace">R:R 2.0 (Win)</text>
        </g>
      );
    }

    if (d.type === 'text') {
      return (
        <g key={d.id} transform={`translate(${d.x}, ${d.y})`}>
          <rect x={-4} y={-14} width={d.text.length * 7 + 14} height={20} fill="rgba(19, 23, 34, 0.9)" rx={3} stroke={d.color} strokeWidth={1} />
          <text x={3} y={0} fill={d.color} fontSize="11" fontWeight="bold" fontFamily="sans-serif">{d.text}</text>
        </g>
      );
    }

    return null;
  };

  const currentCandle = allCandles[replayIndex] || { close: selectedAsset.basePrice, open: selectedAsset.basePrice };
  const priceDiff = currentCandle.close - currentCandle.open;
  const isUp = priceDiff >= 0;

  return (
    <div
      ref={rootContainerRef}
      className={`flex flex-col bg-[#131722] text-slate-200 border border-slate-800 select-none overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none'
          : 'w-full my-2 rounded-xl shadow-2xl h-[calc(100vh-75px)] min-h-[720px]'
      }`}
    >
      {/* ─── TOP TRADINGVIEW & INDICATOR BAR ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-[#131722] border-b border-slate-800 text-xs">
        {/* Left: Symbol & Timeframe & Indicators */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Symbol Dropdown */}
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

          {/* Current Live Price Tag */}
          <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black px-2.5 py-1 rounded-md bg-[#1e222d] border border-slate-800">
            <span className={isUp ? 'text-[#089981]' : 'text-[#f23645]'}>
              {currentCandle.close.toFixed(selectedAsset.decimals)}
            </span>
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-[#089981]" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-[#f23645]" />
            )}
          </div>

          {/* Timeframes */}
          <div className="hidden lg:flex items-center gap-1 bg-[#1e222d] p-1 rounded-lg border border-slate-800">
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

          <div className="hidden md:block w-[1px] h-5 bg-slate-800" />

          {/* ─── Directly Visible Indicators Toggles ─── */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            <button
              onClick={() => setShowEMA20(!showEMA20)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-all ${
                showEMA20
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                  : 'bg-[#1e222d] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              EMA 20
            </button>

            <button
              onClick={() => setShowEMA50(!showEMA50)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-all ${
                showEMA50
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                  : 'bg-[#1e222d] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              EMA 50
            </button>

            <button
              onClick={() => setShowEMA200(!showEMA200)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-all ${
                showEMA200
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'bg-[#1e222d] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              EMA 200
            </button>

            <button
              onClick={() => setShowBB(!showBB)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-all ${
                showBB
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                  : 'bg-[#1e222d] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              BB (20,2)
            </button>

            <button
              onClick={() => setShowSupertrend(!showSupertrend)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-all ${
                showSupertrend
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : 'bg-[#1e222d] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              Supertrend
            </button>

            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-1 rounded text-[11px] font-mono font-bold border transition-all ${
                showRSI
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                  : 'bg-[#1e222d] text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              RSI 14
            </button>
          </div>
        </div>

        {/* Right: TRUE FULLSCREEN BUTTON (Key User Request!) */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter 100% Fullscreen'}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-mono font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'FULL SCREEN'}</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN WORKSPACE (LEFT TOOLBAR + CHART + RIGHT DRAWER) ─────────────── */}
      <div className="flex-1 flex overflow-hidden relative bg-[#131722]">
        {/* ─── 1. LEFT DRAWING TOOLBAR (Always Visible & Usable!) ─────────────── */}
        <div className="w-12 sm:w-14 bg-[#161a25] border-r border-slate-800 flex flex-col items-center py-2.5 gap-2 select-none z-30">
          {/* Cursor / Crosshair */}
          <button
            onClick={() => setActiveTool('cursor')}
            title="Crosshair / Cursor (Pan & Zoom Chart)"
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'cursor'
                ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          {/* Rectangle Tool (User explicitly asked for this!) */}
          <button
            onClick={() => setActiveTool('rectangle')}
            title="Rectangle (Draw Order Block / Demand / Supply Zone)"
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'rectangle'
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(8,153,129,0.5)]'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Trendline */}
          <button
            onClick={() => setActiveTool('trendline')}
            title="Trendline (Click & Drag)"
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'trendline'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          {/* Horizontal Line */}
          <button
            onClick={() => setActiveTool('horizontal')}
            title="Horizontal Line (Support & Resistance)"
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'horizontal'
                ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Fibonacci Retracement */}
          <button
            onClick={() => setActiveTool('fib')}
            title="Fibonacci Retracement"
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'fib'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Long Position */}
          <button
            onClick={() => setActiveTool('long_pos')}
            title="Long Position Tool (Target/Stop Box)"
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'long_pos'
                ? 'bg-emerald-500 text-black'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          {/* Short Position */}
          <button
            onClick={() => setActiveTool('short_pos')}
            title="Short Position Tool (Target/Stop Box)"
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'short_pos'
                ? 'bg-rose-500 text-white'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
          </button>

          {/* Text Annotation */}
          <button
            onClick={() => setActiveTool('text')}
            title="Text Note / Annotation"
            className={`p-2.5 rounded-xl transition-all ${
              activeTool === 'text'
                ? 'bg-amber-500 text-black'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
          >
            <Type className="w-4 h-4" />
          </button>

          <div className="w-6 h-[1px] bg-slate-800 my-1" />

          {/* Undo */}
          <button
            onClick={() => setDrawings((p) => p.slice(1))}
            disabled={drawings.length === 0}
            title="Undo Last Drawing"
            className="p-2 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 transition-all"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Clear All */}
          <button
            onClick={() => setDrawings([])}
            disabled={drawings.length === 0}
            title="Clear All Drawings"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 disabled:opacity-30 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* ─── 2. CENTER CANDLESTICK CHART & INTERACTIVE DRAWING LAYER ────────── */}
        <div className="flex-1 flex flex-col relative bg-[#131722] overflow-hidden">
          {/* Active Tool Options Bar (when drawing rectangle, line, etc.) */}
          {activeTool !== 'cursor' && (
            <div className="absolute top-2 left-4 right-4 z-40 flex items-center justify-between px-3 py-2 rounded-xl bg-[#1e222d]/95 border border-cyan-500/50 backdrop-blur-md shadow-2xl font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold uppercase tracking-wider">
                  Active Tool: {activeTool}
                </span>
                <span className="text-slate-400 hidden sm:inline text-[11px]">
                  {activeTool === 'rectangle' && 'Click & drag on the chart to create an Order Block / Supply-Demand box.'}
                  {activeTool === 'trendline' && 'Click & drag to draw a trendline.'}
                  {activeTool === 'fib' && 'Click & drag from low to high for Fibonacci retracement.'}
                  {activeTool === 'horizontal' && 'Click anywhere to place a Support / Resistance ray.'}
                </span>
              </div>

              {/* Rectangle Color & Label presets */}
              {activeTool === 'rectangle' && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedLabel}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                    className="px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] border border-slate-700"
                  >
                    <option value="Order Block (OB)">Order Block (OB)</option>
                    <option value="Demand Zone">Demand Zone</option>
                    <option value="Supply Zone">Supply Zone</option>
                    <option value="Fair Value Gap">Fair Value Gap (FVG)</option>
                    <option value="Breaker Block">Breaker Block</option>
                    <option value="Liquidity Pool">Liquidity Pool</option>
                  </select>

                  <div className="flex items-center gap-1">
                    {ZONE_COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedColor(c.hex)}
                        className={`w-4 h-4 rounded-full border ${selectedColor === c.hex ? 'ring-2 ring-white scale-110' : 'opacity-70'}`}
                        style={{ backgroundColor: c.hex, borderColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setActiveTool('cursor')}
                className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] hover:bg-rose-500/30 font-bold"
              >
                Done
              </button>
            </div>
          )}

          {/* Floating FX Replay Controller (Play, Pause, Step Forward, Speed) */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 sm:gap-3 bg-[#1e222d]/95 backdrop-blur-md px-3 sm:px-4 py-2 rounded-2xl border border-slate-700/80 shadow-[0_10px_35px_rgba(0,0,0,0.8)] select-none">
              {/* Cut Tool */}
              <button
                onClick={handleCutJump}
                title="Cut / Jump Back (40 Candles)"
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

              {/* Scrub Slider */}
              <div className="hidden sm:flex items-center gap-2 px-1">
                <input
                  type="range"
                  min="20"
                  max={allCandles.length - 1}
                  value={replayIndex}
                  onChange={(e) => setReplayIndex(Number(e.target.value))}
                  className="w-24 md:w-32 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Step Forward (1 Candle Forward!) */}
              <button
                onClick={handleStepForward}
                title="Step Forward (1 Candle Next)"
                className="p-1.5 rounded-lg text-slate-200 hover:text-emerald-400 hover:bg-slate-800 transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* STOP / START Button (Crucial user request!) */}
              <button
                onClick={() => setIsStopped(!isStopped)}
                title={isStopped ? 'Start Replay Stream' : 'Stop / Freeze Market (Analysis Mode)'}
                className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 transition-all shadow-md ${
                  isStopped
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/30 animate-pulse'
                }`}
              >
                {isStopped ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isStopped ? 'STOPPED' : 'STARTED'}</span>
              </button>

              {/* Speed Selector */}
              <select
                value={replaySpeed}
                onChange={(e) => setReplaySpeed(Number(e.target.value))}
                className="bg-slate-900 text-slate-300 text-[11px] font-mono font-bold px-2 py-1 rounded border border-slate-700 focus:outline-none cursor-pointer"
              >
                {SPEED_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Replay Status Indicator */}
            <div
              className={`px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm border shadow-lg ${
                isStopped
                  ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isStopped ? 'Market Stopped • You Can Draw Rectangles & Analyze' : 'Market Replay Running'}
            </div>
          </div>

          {/* Chart Viewport + SVG Overlay */}
          <div className="relative flex-1 w-full h-full min-h-[500px]">
            <div ref={chartContainerRef} className="w-full h-full" />

            {/* SVG Drawing Canvas Overlay */}
            <svg
              ref={svgRef}
              className={`absolute inset-0 w-full h-full z-20 ${
                activeTool === 'cursor' ? 'pointer-events-none' : 'cursor-crosshair pointer-events-auto'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              {drawings.map((d) => renderDrawing(d))}
              {currentDrawing && renderDrawing(currentDrawing, true)}
            </svg>
          </div>

          {/* RSI Sub-Chart if active */}
          {showRSI && (
            <div className="w-full h-[110px] bg-[#0c1017] border-t border-slate-800 relative">
              <div ref={rsiContainerRef} className="w-full h-full" />
            </div>
          )}
        </div>

        {/* ─── 3. RIGHT SIDEBAR DRAWER (Object Tree, Orders, Journal, Analytics) ── */}
        {rightPanel !== 'none' && (
          <div className="w-64 sm:w-72 bg-[#161a25] border-l border-slate-800 flex flex-col z-20 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-[#131722] text-xs font-mono font-bold">
              <span className="text-slate-300 uppercase tracking-wider">
                {rightPanel === 'tree' && 'Object Tree'}
                {rightPanel === 'order' && 'Order Management'}
                {rightPanel === 'journal' && 'Trade Journal'}
                {rightPanel === 'analytics' && 'Performance'}
              </span>
              <button onClick={() => setRightPanel('none')} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
              {/* Object Tree */}
              {rightPanel === 'tree' && (
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold flex justify-between">
                    <span>{selectedAsset.id} Drawings</span>
                    <span className="text-cyan-400">{drawings.length} Objects</span>
                  </div>
                  {drawings.map((obj) => (
                    <div
                      key={obj.id}
                      className="p-2 rounded-lg bg-[#1e222d] border border-slate-800 flex items-center justify-between hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {obj.type === 'rectangle' && <Square className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {obj.type === 'trendline' && <TrendingUp className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                        {obj.type === 'horizontal' && <Minus className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                        {obj.type === 'fib' && <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                        {obj.type === 'long_pos' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        {obj.type === 'short_pos' && <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <span className="text-slate-300 truncate">{obj.label || obj.type}</span>
                      </div>
                      <button
                        onClick={() => setDrawings((p) => p.filter((o) => o.id !== obj.id))}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Order Entry */}
              {rightPanel === 'order' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#1e222d] border border-slate-800 space-y-2.5">
                    <div className="flex justify-between text-slate-400">
                      <span>Order:</span>
                      <span className="text-white font-bold">Instant Market</span>
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
                      <span>Stop Loss:</span>
                      <input
                        type="number"
                        value={slPips}
                        onChange={(e) => setSlPips(Math.max(5, Number(e.target.value)))}
                        className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-bold text-rose-400"
                      />
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Take Profit:</span>
                      <input
                        type="number"
                        value={tpPips}
                        onChange={(e) => setTpPips(Math.max(5, Number(e.target.value)))}
                        className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-right font-bold text-emerald-400"
                      />
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>R:R Ratio:</span>
                      <span className="text-cyan-400 font-bold">1 : {(tpPips / slPips).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleExecuteTrade('BUY')}
                      className="py-2.5 rounded-xl bg-[#089981] hover:bg-[#089981]/90 text-white font-black flex items-center justify-center gap-1 shadow-lg"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      BUY
                    </button>
                    <button
                      onClick={() => handleExecuteTrade('SELL')}
                      className="py-2.5 rounded-xl bg-[#f23645] hover:bg-[#f23645]/90 text-white font-black flex items-center justify-center gap-1 shadow-lg"
                    >
                      <ArrowDownRight className="w-4 h-4" />
                      SELL
                    </button>
                  </div>
                </div>
              )}

              {/* Journal */}
              {rightPanel === 'journal' && (
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">
                    Session Trade Journal ({tradeHistory.length})
                  </div>
                  {tradeHistory.map((t) => (
                    <div key={t.id} className="p-2 rounded-lg bg-[#1e222d] border border-slate-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{t.asset}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                            t.result === 'WIN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {t.result}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>{t.type} @ {t.entry}</span>
                        <span className={`font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Analytics */}
              {rightPanel === 'analytics' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#1e222d] border border-slate-800 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Balance:</span>
                      <span className="text-white font-black">${balance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Win Rate:</span>
                      <span className="text-emerald-400 font-black">{stats.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Record:</span>
                      <span className="text-slate-200">
                        <span className="text-emerald-400 font-bold">{stats.wins}W</span> -{' '}
                        <span className="text-rose-400 font-bold">{stats.losses}L</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Realized PnL:</span>
                      <span className={`font-black ${realizedPnl >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}`}>
                        {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vertical Icons on Right Edge */}
        <div className="w-11 bg-[#131722] border-l border-slate-800 flex flex-col items-center py-3 gap-3 text-slate-400 select-none z-20">
          <button
            onClick={() => setRightPanel(rightPanel === 'tree' ? 'none' : 'tree')}
            title="Object Tree (Rectangles, Trendlines, Fib)"
            className={`p-2 rounded-lg transition-all ${rightPanel === 'tree' ? 'bg-cyan-500/20 text-cyan-400' : 'hover:text-white hover:bg-slate-800'}`}
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRightPanel(rightPanel === 'order' ? 'none' : 'order')}
            title="Order Management"
            className={`p-2 rounded-lg transition-all ${rightPanel === 'order' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:text-white hover:bg-slate-800'}`}
          >
            <Target className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRightPanel(rightPanel === 'journal' ? 'none' : 'journal')}
            title="Trade Journal"
            className={`p-2 rounded-lg transition-all ${rightPanel === 'journal' ? 'bg-amber-500/20 text-amber-400' : 'hover:text-white hover:bg-slate-800'}`}
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRightPanel(rightPanel === 'analytics' ? 'none' : 'analytics')}
            title="Performance Analytics"
            className={`p-2 rounded-lg transition-all ${rightPanel === 'analytics' ? 'bg-purple-500/20 text-purple-400' : 'hover:text-white hover:bg-slate-800'}`}
          >
            <PieChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── 4. BOTTOM FX REPLAY EXECUTION & ACCOUNT BAR (Matching Screenshot) ── */}
      <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 bg-[#131722] border-t border-slate-800 font-mono text-xs select-none gap-2">
        {/* Left: Buy / Sell Pills & Lot Size */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExecuteTrade('BUY')}
            className="px-4 py-1.5 rounded-full bg-[#089981] hover:bg-[#089981]/90 text-white font-black shadow-md transition-all active:scale-95"
          >
            Buy
          </button>

          <button
            onClick={() => handleExecuteTrade('SELL')}
            className="px-4 py-1.5 rounded-full bg-[#f23645] hover:bg-[#f23645]/90 text-white font-black shadow-md transition-all active:scale-95"
          >
            Sell
          </button>

          <div className="flex items-center bg-[#1e222d] px-2.5 py-1 rounded-lg border border-slate-700">
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

        {/* Right: Account Balance & Realized PnL (Identical to User Screenshot!) */}
        <div className="flex items-center gap-3 sm:gap-6 text-[11px] sm:text-xs">
          <button
            onClick={() => setRightPanel('analytics')}
            className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1e222d] border border-slate-700 text-slate-300 hover:text-white"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analytics</span>
          </button>

          <div>
            <span className="text-slate-500 mr-1.5">Account Balance:</span>
            <span className="text-white font-black font-mono">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
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
