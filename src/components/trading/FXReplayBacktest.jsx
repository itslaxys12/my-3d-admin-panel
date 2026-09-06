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
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Supported Assets & Starting Data Configuration ──────────────────────────
const ASSETS = [
  { id: 'EURUSD', name: 'EUR / USD', type: 'Forex', basePrice: 1.0865, pipSize: 0.0001, spread: 0.0001, decimals: 5 },
  { id: 'GBPUSD', name: 'GBP / USD', type: 'Forex', basePrice: 1.2740, pipSize: 0.0001, spread: 0.0001, decimals: 5 },
  { id: 'USDJPY', name: 'USD / JPY', type: 'Forex', basePrice: 154.20, pipSize: 0.01, spread: 0.01, decimals: 3 },
  { id: 'XAUUSD', name: 'XAU / USD (Gold)', type: 'Metals', basePrice: 2365.50, pipSize: 0.1, spread: 0.2, decimals: 2 },
  { id: 'BTCUSD', name: 'BTC / USD (Bitcoin)', type: 'Crypto', basePrice: 64800.0, pipSize: 1.0, spread: 5.0, decimals: 1 },
  { id: 'ETHUSD', name: 'ETH / USD (Ethereum)', type: 'Crypto', basePrice: 3450.0, pipSize: 0.1, spread: 0.5, decimals: 2 },
  { id: 'US30', name: 'US30 (Dow Jones)', type: 'Indices', basePrice: 39850.0, pipSize: 1.0, spread: 2.0, decimals: 1 },
];

const TIMEFRAMES = [
  { id: '1m', label: '1m', seconds: 60 },
  { id: '5m', label: '5m', seconds: 300 },
  { id: '15m', label: '15m', seconds: 900 },
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

const DRAW_COLORS = [
  { id: 'emerald', hex: '#10b981', label: 'Demand / Bullish OB' },
  { id: 'rose', hex: '#ef4444', label: 'Supply / Bearish OB' },
  { id: 'cyan', hex: '#06b6d4', label: 'Fair Value Gap (FVG)' },
  { id: 'purple', hex: '#a855f7', label: 'Liquidity Pool' },
  { id: 'amber', hex: '#f59e0b', label: 'Breaker Block' },
  { id: 'white', hex: '#e2e8f0', label: 'Neutral Zone' },
];

// ─── Realistic Candle Generator ──────────────────────────────────────────────
function generateCandles(basePrice, pipSize, count = 400) {
  const candles = [];
  let current = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const interval = 300; // 5m intervals
  const startTime = now - count * interval;
  const isHighValue = basePrice > 100;
  const decimals = isHighValue ? 2 : 5;

  let trend = 1;
  let trendDuration = 0;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * interval;

    if (trendDuration <= 0) {
      trend = Math.random() > 0.48 ? 1 : -1;
      trendDuration = Math.floor(10 + Math.random() * 25);
    }
    trendDuration--;

    const baseVol = pipSize * (8 + Math.sin(i / 12) * 6 + Math.random() * 10);
    const bias = trend * (Math.random() * 0.6 * baseVol);
    const noise = (Math.random() - 0.48) * baseVol * 1.4;
    const change = bias + noise;

    const open = current;
    const close = +(open + change).toFixed(decimals);
    const high = +(Math.max(open, close) + Math.random() * baseVol * 0.8).toFixed(decimals);
    const low = +(Math.min(open, close) - Math.random() * baseVol * 0.8).toFixed(decimals);

    candles.push({
      time,
      open,
      high,
      low,
      close,
    });

    current = close;
  }
  return candles;
}

// ─── Technical Indicator Calculations ────────────────────────────────────────
function calculateEMA(data, period) {
  if (!data || data.length === 0) return [];
  const k = 2 / (period + 1);
  const ema = [];
  let prevEma = data[0]?.close || 0;
  const isHigh = (data[0]?.close || 0) > 100;

  for (let i = 0; i < data.length; i++) {
    const close = data[i].close;
    if (i === 0) {
      prevEma = close;
    } else {
      prevEma = close * k + prevEma * (1 - k);
    }
    ema.push({
      time: data[i].time,
      value: +prevEma.toFixed(isHigh ? 2 : 5),
    });
  }
  return ema;
}

function calculateBollingerBands(data, period = 20, stdDevMult = 2) {
  if (!data || data.length < period) return { upper: [], middle: [], lower: [] };
  const upper = [];
  const middle = [];
  const lower = [];
  const isHigh = (data[0]?.close || 0) > 100;
  const dec = isHigh ? 2 : 5;

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((acc, c) => acc + c.close, 0);
    const sma = sum / period;
    const variance = slice.reduce((acc, c) => acc + Math.pow(c.close - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    const time = data[i].time;

    upper.push({ time, value: +(sma + stdDevMult * stdDev).toFixed(dec) });
    middle.push({ time, value: +sma.toFixed(dec) });
    lower.push({ time, value: +(sma - stdDevMult * stdDev).toFixed(dec) });
  }
  return { upper, middle, lower };
}

function calculateSupertrend(data, period = 10, multiplier = 3) {
  if (!data || data.length < period + 1) return [];
  const tr = [];
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      tr.push(data[i].high - data[i].low);
    } else {
      const hl = data[i].high - data[i].low;
      const hc = Math.abs(data[i].high - data[i - 1].close);
      const lc = Math.abs(data[i].low - data[i - 1].close);
      tr.push(Math.max(hl, hc, lc));
    }
  }

  const atr = [];
  let atrSum = tr.slice(0, period).reduce((a, b) => a + b, 0);
  atr[period - 1] = atrSum / period;
  for (let i = period; i < data.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
  }

  const result = [];
  let trend = 1;
  let prevUpper = 0;
  let prevLower = 0;
  const isHigh = (data[0]?.close || 0) > 100;
  const dec = isHigh ? 2 : 5;

  for (let i = period - 1; i < data.length; i++) {
    const hl2 = (data[i].high + data[i].low) / 2;
    const curAtr = atr[i] || 0.001;
    let upper = hl2 + multiplier * curAtr;
    let lower = hl2 - multiplier * curAtr;

    if (i > period - 1) {
      if (lower < prevLower && data[i - 1].close > prevLower) lower = prevLower;
      if (upper > prevUpper && data[i - 1].close < prevUpper) upper = prevUpper;
    }

    if (trend === 1 && data[i].close < lower) trend = -1;
    else if (trend === -1 && data[i].close > upper) trend = 1;

    const value = trend === 1 ? lower : upper;
    result.push({
      time: data[i].time,
      value: +value.toFixed(dec),
      color: trend === 1 ? '#10b981' : '#ef4444',
    });

    prevUpper = upper;
    prevLower = lower;
  }
  return result;
}

function calculateRSI(data, period = 14) {
  if (!data || data.length < period + 1) return [];
  const rsi = [];
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i].close - data[i - 1].close;
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsiVal = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

    rsi.push({
      time: data[i].time,
      value: +rsiVal.toFixed(2),
    });
  }
  return rsi;
}

// ─── Main FX Replay Backtesting Component ─────────────────────────────────────
export function FXReplayBacktest() {
  const containerRef = useRef(null);
  const chartWrapperRef = useRef(null);
  const chartContainerRef = useRef(null);
  const rsiContainerRef = useRef(null);
  const svgRef = useRef(null);

  // Chart and Series Instances
  const chartInstanceRef = useRef(null);
  const rsiInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const ema20SeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);
  const ema200SeriesRef = useRef(null);
  const bbUpperSeriesRef = useRef(null);
  const bbMiddleSeriesRef = useRef(null);
  const bbLowerSeriesRef = useRef(null);
  const supertrendSeriesRef = useRef(null);
  const rsiSeriesRef = useRef(null);

  // Trade price lines
  const entryLineRef = useRef(null);
  const slLineRef = useRef(null);
  const tpLineRef = useRef(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Asset & Timeframe
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[1]); // 5m

  // Replay State
  const [allCandles, setAllCandles] = useState([]);
  const [replayIndex, setReplayIndex] = useState(160);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(500); // 500ms
  const [isCutMode, setIsCutMode] = useState(false);

  // ─── Indicators Toggle State ────────────────────────────────────────────────
  const [showIndicatorsModal, setShowIndicatorsModal] = useState(false);
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showSupertrend, setShowSupertrend] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // ─── Drawing Tools State (TradingView Style) ─────────────────────────────────
  // Tools: 'cursor', 'rectangle', 'trendline', 'horizontal', 'long_pos', 'short_pos', 'text', 'ruler'
  const [activeTool, setActiveTool] = useState('cursor');
  const [selectedDrawColor, setSelectedDrawColor] = useState('#10b981');
  const [selectedZoneLabel, setSelectedZoneLabel] = useState('Order Block');
  const [drawings, setDrawings] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredDrawingId, setHoveredDrawingId] = useState(null);

  // ─── Virtual Trading State ──────────────────────────────────────────────────
  const [balance, setBalance] = useState(10000.0);
  const [riskAmount, setRiskAmount] = useState(150.0);
  const [slPips, setSlPips] = useState(15);
  const [tpPips, setTpPips] = useState(30);
  const [activeTrade, setActiveTrade] = useState(null);
  const [showJournalDrawer, setShowJournalDrawer] = useState(false);
  const [tradeHistory, setTradeHistory] = useState([
    {
      id: 1,
      asset: 'EURUSD',
      type: 'BUY',
      entryPrice: 1.0842,
      exitPrice: 1.0872,
      result: 'WIN',
      pnl: 300.0,
      pnlPercent: 3.0,
      rr: '1:2.0',
      time: '14:20:00',
    },
    {
      id: 2,
      asset: 'EURUSD',
      type: 'SELL',
      entryPrice: 1.0875,
      exitPrice: 1.0850,
      result: 'WIN',
      pnl: 250.0,
      pnlPercent: 2.5,
      rr: '1:1.6',
      time: '16:05:00',
    },
    {
      id: 3,
      asset: 'EURUSD',
      type: 'BUY',
      entryPrice: 1.0860,
      exitPrice: 1.0845,
      result: 'LOSS',
      pnl: -150.0,
      pnlPercent: -1.5,
      rr: '1:1.8',
      time: '18:40:00',
    },
  ]);

  // Win Rate & Performance Stats
  const stats = useMemo(() => {
    const totalTrades = tradeHistory.length;
    const wins = tradeHistory.filter((t) => t.result === 'WIN').length;
    const losses = tradeHistory.filter((t) => t.result === 'LOSS').length;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0.0';
    const totalPnl = tradeHistory.reduce((acc, t) => acc + t.pnl, 0);
    const equity = balance + (activeTrade ? activeTrade.unrealizedPnl || 0 : 0);
    const pnlPercent = ((totalPnl / 10000) * 100).toFixed(2);
    return { totalTrades, wins, losses, winRate, totalPnl, equity, pnlPercent };
  }, [tradeHistory, balance, activeTrade]);

  // ─── Generate Fresh Data when Asset Changes ─────────────────────────────────
  useEffect(() => {
    const raw = generateCandles(selectedAsset.basePrice, selectedAsset.pipSize, 500);
    setAllCandles(raw);
    setReplayIndex(160);
    setIsPlaying(false);
    setActiveTrade(null);
  }, [selectedAsset]);

  // ─── Initialize Main Chart & RSI Sub-Chart ──────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Destroy existing instances if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }
    if (rsiInstanceRef.current) {
      rsiInstanceRef.current.remove();
      rsiInstanceRef.current = null;
    }

    const containerWidth = chartContainerRef.current.clientWidth || 1000;
    const chartHeight = showRSI ? 560 : 660;

    // Main TradingView Candlestick Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0d1117' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.35)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.35)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        scaleMargins: {
          top: 0.08,
          bottom: 0.12,
        },
      },
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerWidth,
      height: chartHeight,
    });

    // TradingView Crisp Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#089981',
      downColor: '#f23645',
      borderVisible: false,
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
    });

    // Indicators Series on Main Chart
    const ema20Series = chart.addLineSeries({
      color: '#00f0ff',
      lineWidth: 1.5,
      title: 'EMA 20',
    });

    const ema50Series = chart.addLineSeries({
      color: '#a855f7',
      lineWidth: 1.5,
      title: 'EMA 50',
    });

    const ema200Series = chart.addLineSeries({
      color: '#f59e0b',
      lineWidth: 2,
      title: 'EMA 200',
    });

    const bbUpperSeries = chart.addLineSeries({
      color: 'rgba(56, 189, 248, 0.8)',
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
      title: 'BB Upper',
    });

    const bbMiddleSeries = chart.addLineSeries({
      color: 'rgba(148, 163, 184, 0.6)',
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      title: 'BB Basis',
    });

    const bbLowerSeries = chart.addLineSeries({
      color: 'rgba(56, 189, 248, 0.8)',
      lineWidth: 1,
      lineStyle: LineStyle.Solid,
      title: 'BB Lower',
    });

    const supertrendSeries = chart.addLineSeries({
      color: '#10b981',
      lineWidth: 2,
      title: 'Supertrend',
    });

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;
    ema200SeriesRef.current = ema200Series;
    bbUpperSeriesRef.current = bbUpperSeries;
    bbMiddleSeriesRef.current = bbMiddleSeries;
    bbLowerSeriesRef.current = bbLowerSeries;
    supertrendSeriesRef.current = supertrendSeries;

    // RSI Sub-chart if enabled
    if (showRSI && rsiContainerRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#090d16' },
          textColor: '#64748b',
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.2)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.2)' },
        },
        rightPriceScale: {
          borderColor: 'rgba(51, 65, 85, 0.4)',
        },
        timeScale: {
          visible: false,
        },
        width: containerWidth,
        height: 110,
      });

      const rsiSeries = rsiChart.addLineSeries({
        color: '#f59e0b',
        lineWidth: 1.5,
        title: 'RSI 14',
      });

      rsiSeries.createPriceLine({ price: 70, color: 'rgba(244, 63, 94, 0.6)', lineWidth: 1, lineStyle: 2, title: 'OB 70' });
      rsiSeries.createPriceLine({ price: 30, color: 'rgba(0, 255, 157, 0.6)', lineWidth: 1, lineStyle: 2, title: 'OS 30' });

      rsiInstanceRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;
    }

    // Dynamic Window Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: showRSI ? 560 : (isFullscreen ? window.innerHeight - 170 : 660),
        });
      }
      if (rsiContainerRef.current && rsiInstanceRef.current) {
        rsiInstanceRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
      if (rsiInstanceRef.current) {
        rsiInstanceRef.current.remove();
        rsiInstanceRef.current = null;
      }
    };
  }, [showRSI, isFullscreen]);

  // ─── Update Chart Data whenever replayIndex Changes ─────────────────────────
  useEffect(() => {
    if (!allCandles.length || !candleSeriesRef.current) return;

    const visibleCandles = allCandles.slice(0, replayIndex + 1);
    candleSeriesRef.current.setData(visibleCandles);

    // EMA 20
    if (ema20SeriesRef.current) {
      if (showEMA20 && visibleCandles.length > 5) {
        ema20SeriesRef.current.setData(calculateEMA(visibleCandles, 20));
      } else {
        ema20SeriesRef.current.setData([]);
      }
    }

    // EMA 50
    if (ema50SeriesRef.current) {
      if (showEMA50 && visibleCandles.length > 10) {
        ema50SeriesRef.current.setData(calculateEMA(visibleCandles, 50));
      } else {
        ema50SeriesRef.current.setData([]);
      }
    }

    // EMA 200
    if (ema200SeriesRef.current) {
      if (showEMA200 && visibleCandles.length > 25) {
        ema200SeriesRef.current.setData(calculateEMA(visibleCandles, 200));
      } else {
        ema200SeriesRef.current.setData([]);
      }
    }

    // Bollinger Bands
    if (bbUpperSeriesRef.current && bbMiddleSeriesRef.current && bbLowerSeriesRef.current) {
      if (showBB && visibleCandles.length > 20) {
        const { upper, middle, lower } = calculateBollingerBands(visibleCandles, 20, 2);
        bbUpperSeriesRef.current.setData(upper);
        bbMiddleSeriesRef.current.setData(middle);
        bbLowerSeriesRef.current.setData(lower);
      } else {
        bbUpperSeriesRef.current.setData([]);
        bbMiddleSeriesRef.current.setData([]);
        bbLowerSeriesRef.current.setData([]);
      }
    }

    // Supertrend
    if (supertrendSeriesRef.current) {
      if (showSupertrend && visibleCandles.length > 12) {
        supertrendSeriesRef.current.setData(calculateSupertrend(visibleCandles, 10, 3));
      } else {
        supertrendSeriesRef.current.setData([]);
      }
    }

    // RSI Sub-chart
    if (rsiSeriesRef.current && showRSI) {
      if (visibleCandles.length > 15) {
        rsiSeriesRef.current.setData(calculateRSI(visibleCandles, 14));
      } else {
        rsiSeriesRef.current.setData([]);
      }
    }

    // Live Check for Active Trade Hits
    if (activeTrade) {
      const currentCandle = visibleCandles[visibleCandles.length - 1];
      checkTradeStatus(currentCandle);
    }
  }, [replayIndex, allCandles, showEMA20, showEMA50, showEMA200, showBB, showSupertrend, showRSI]);

  // ─── Play / Replay Automation Timer ─────────────────────────────────────────
  useEffect(() => {
    let intervalId = null;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= allCandles.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, replaySpeed);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, replaySpeed, allCandles.length]);

  // ─── Step Controls ──────────────────────────────────────────────────────────
  const handleStepForward = () => {
    if (replayIndex < allCandles.length - 1) {
      setReplayIndex((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (replayIndex > 10) {
      setReplayIndex((prev) => prev - 1);
    }
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setReplayIndex(120);
  };

  // ─── Trade Verification (Check TP/SL on candle update) ───────────────────────
  const checkTradeStatus = (candle) => {
    if (!activeTrade || !candle) return;

    let isWin = false;
    let isLoss = false;
    let exitPrice = 0;

    if (activeTrade.type === 'BUY') {
      if (candle.high >= activeTrade.tp) {
        isWin = true;
        exitPrice = activeTrade.tp;
      } else if (candle.low <= activeTrade.sl) {
        isLoss = true;
        exitPrice = activeTrade.sl;
      }
    } else {
      // SELL
      if (candle.low <= activeTrade.tp) {
        isWin = true;
        exitPrice = activeTrade.tp;
      } else if (candle.high >= activeTrade.sl) {
        isLoss = true;
        exitPrice = activeTrade.sl;
      }
    }

    if (isWin || isLoss) {
      const finalPnl = isWin
        ? +(riskAmount * (tpPips / slPips)).toFixed(2)
        : -riskAmount;
      const pnlPercent = +((finalPnl / balance) * 100).toFixed(2);

      const closedTrade = {
        id: Date.now(),
        asset: selectedAsset.id,
        type: activeTrade.type,
        entryPrice: activeTrade.entry,
        exitPrice,
        result: isWin ? 'WIN' : 'LOSS',
        pnl: finalPnl,
        pnlPercent,
        rr: `1:${(tpPips / slPips).toFixed(1)}`,
        time: new Date().toLocaleTimeString(),
      };

      setBalance((b) => +(b + finalPnl).toFixed(2));
      setTradeHistory((hist) => [closedTrade, ...hist]);
      setActiveTrade(null);
      clearTradeLines();

      if (isWin) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#00ff9d', '#38bdf8', '#a855f7'],
        });
      }
    } else {
      // Update unrealized PnL
      const diff = candle.close - activeTrade.entry;
      const pips = diff / selectedAsset.pipSize;
      const unrealized =
        activeTrade.type === 'BUY'
          ? (pips / slPips) * riskAmount
          : -(pips / slPips) * riskAmount;
      setActiveTrade((prev) => (prev ? { ...prev, unrealizedPnl: +unrealized.toFixed(2) } : null));
    }
  };

  // ─── Trade Lines Cleanup ───────────────────────────────────────────────────
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

  // ─── Execute Buy / Sell Trade ───────────────────────────────────────────────
  const handleExecuteTrade = (type) => {
    if (!allCandles.length || !candleSeriesRef.current) return;

    clearTradeLines();
    const currentCandle = allCandles[replayIndex];
    const entry = currentCandle.close;
    const pip = selectedAsset.pipSize;

    const sl = type === 'BUY' ? +(entry - slPips * pip).toFixed(selectedAsset.decimals) : +(entry + slPips * pip).toFixed(selectedAsset.decimals);
    const tp = type === 'BUY' ? +(entry + tpPips * pip).toFixed(selectedAsset.decimals) : +(entry - tpPips * pip).toFixed(selectedAsset.decimals);

    // Render Price Lines
    entryLineRef.current = candleSeriesRef.current.createPriceLine({
      price: entry,
      color: '#38bdf8',
      lineWidth: 2,
      lineStyle: 0,
      title: `ENTRY (${type})`,
    });

    slLineRef.current = candleSeriesRef.current.createPriceLine({
      price: sl,
      color: '#f43f5e',
      lineWidth: 2,
      lineStyle: 2,
      title: `STOP LOSS (${slPips} pips)`,
    });

    tpLineRef.current = candleSeriesRef.current.createPriceLine({
      price: tp,
      color: '#00ff9d',
      lineWidth: 2,
      lineStyle: 2,
      title: `TAKE PROFIT (${tpPips} pips)`,
    });

    setActiveTrade({
      type,
      entry,
      sl,
      tp,
      unrealizedPnl: 0,
      time: currentCandle.time,
    });
  };

  const handleCloseTradeManual = () => {
    if (!activeTrade || !allCandles.length) return;
    const currentCandle = allCandles[replayIndex];
    const pnl = activeTrade.unrealizedPnl || 0;
    const pnlPercent = +((pnl / balance) * 100).toFixed(2);

    const closed = {
      id: Date.now(),
      asset: selectedAsset.id,
      type: activeTrade.type,
      entryPrice: activeTrade.entry,
      exitPrice: currentCandle.close,
      result: pnl >= 0 ? 'WIN' : 'LOSS',
      pnl,
      pnlPercent,
      rr: 'Manual',
      time: new Date().toLocaleTimeString(),
    };

    setBalance((b) => +(b + pnl).toFixed(2));
    setTradeHistory((prev) => [closed, ...prev]);
    setActiveTrade(null);
    clearTradeLines();
  };

  // ─── SVG Interactive Drawing Mouse Handlers ─────────────────────────────────
  const getSvgCoordinates = (e) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e) => {
    if (activeTool === 'cursor') return;
    const { x, y } = getSvgCoordinates(e);

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
        color: selectedDrawColor,
        label: selectedZoneLabel,
      });
    } else if (activeTool === 'trendline') {
      setCurrentDrawing({
        id: newId,
        type: 'trendline',
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        color: selectedDrawColor,
      });
    } else if (activeTool === 'horizontal') {
      // Instant horizontal line
      const hLine = {
        id: newId,
        type: 'horizontal',
        y,
        color: selectedDrawColor,
        label: 'Key Level',
      };
      setDrawings((prev) => [...prev, hLine]);
      setIsDrawing(false);
      setActiveTool('cursor');
    } else if (activeTool === 'long_pos') {
      setCurrentDrawing({
        id: newId,
        type: 'long_pos',
        startX: x,
        startY: y,
        currentX: x + 160,
        currentY: y,
        color: '#10b981',
      });
    } else if (activeTool === 'short_pos') {
      setCurrentDrawing({
        id: newId,
        type: 'short_pos',
        startX: x,
        startY: y,
        currentX: x + 160,
        currentY: y,
        color: '#ef4444',
      });
    } else if (activeTool === 'text') {
      const textVal = prompt('Enter Chart Annotation / Note:', 'Key Liquidity Zone');
      if (textVal) {
        setDrawings((prev) => [
          ...prev,
          {
            id: newId,
            type: 'text',
            x,
            y,
            text: textVal,
            color: selectedDrawColor,
          },
        ]);
      }
      setIsDrawing(false);
      setActiveTool('cursor');
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentDrawing) return;
    const { x, y } = getSvgCoordinates(e);
    setCurrentDrawing((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null));
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDrawing) return;

    if (currentDrawing.type === 'rectangle') {
      const w = Math.abs(currentDrawing.currentX - currentDrawing.startX);
      const h = Math.abs(currentDrawing.currentY - currentDrawing.startY);
      if (w > 8 && h > 8) {
        setDrawings((prev) => [...prev, currentDrawing]);
      }
    } else if (currentDrawing.type === 'trendline') {
      const dist = Math.hypot(
        currentDrawing.currentX - currentDrawing.startX,
        currentDrawing.currentY - currentDrawing.startY
      );
      if (dist > 10) {
        setDrawings((prev) => [...prev, currentDrawing]);
      }
    } else if (currentDrawing.type === 'long_pos' || currentDrawing.type === 'short_pos') {
      setDrawings((prev) => [...prev, currentDrawing]);
    }

    setIsDrawing(false);
    setCurrentDrawing(null);
    setActiveTool('cursor');
  };

  const handleUndoDrawing = () => {
    setDrawings((prev) => prev.slice(0, -1));
  };

  const handleClearDrawings = () => {
    setDrawings([]);
    setCurrentDrawing(null);
  };

  const handleDeleteDrawing = (id, e) => {
    e.stopPropagation();
    setDrawings((prev) => prev.filter((d) => d.id !== id));
  };

  // ─── Render SVG Drawings ────────────────────────────────────────────────────
  const renderDrawing = (d, isPreview = false) => {
    if (d.type === 'rectangle') {
      const x = Math.min(d.startX, d.currentX);
      const y = Math.min(d.startY, d.currentY);
      const width = Math.abs(d.currentX - d.startX);
      const height = Math.abs(d.currentY - d.startY);

      return (
        <g
          key={d.id}
          className="group cursor-pointer"
          onMouseEnter={() => setHoveredDrawingId(d.id)}
          onMouseLeave={() => setHoveredDrawingId(null)}
        >
          {/* Fill box */}
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={d.color}
            fillOpacity={isPreview ? 0.35 : 0.22}
            stroke={d.color}
            strokeWidth={1.5}
            strokeDasharray={isPreview ? '4 2' : 'none'}
            rx={4}
          />
          {/* Label tag */}
          <rect
            x={x + 4}
            y={y + 4}
            width={Math.min(width - 8, d.label.length * 7 + 16)}
            height={18}
            fill="rgba(15, 23, 42, 0.85)"
            rx={3}
          />
          <text
            x={x + 10}
            y={y + 16}
            fill={d.color}
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {d.label}
          </text>
          {/* Delete Icon on Hover */}
          {!isPreview && hoveredDrawingId === d.id && (
            <g
              transform={`translate(${x + width - 18}, ${y + 4})`}
              onClick={(e) => handleDeleteDrawing(d.id, e)}
              className="cursor-pointer"
            >
              <rect width={14} height={14} rx={3} fill="#f43f5e" />
              <text x={4} y={11} fill="#fff" fontSize="10" fontWeight="bold">×</text>
            </g>
          )}
        </g>
      );
    }

    if (d.type === 'trendline') {
      return (
        <g
          key={d.id}
          className="group"
          onMouseEnter={() => setHoveredDrawingId(d.id)}
          onMouseLeave={() => setHoveredDrawingId(null)}
        >
          <line
            x1={d.startX}
            y1={d.startY}
            x2={d.currentX}
            y2={d.currentY}
            stroke={d.color}
            strokeWidth={2}
            strokeDasharray={isPreview ? '4 2' : 'none'}
          />
          <circle cx={d.startX} cy={d.startY} r={4} fill={d.color} />
          <circle cx={d.currentX} cy={d.currentY} r={4} fill={d.color} />
          {!isPreview && hoveredDrawingId === d.id && (
            <g
              transform={`translate(${d.currentX + 8}, ${d.currentY - 8})`}
              onClick={(e) => handleDeleteDrawing(d.id, e)}
              className="cursor-pointer"
            >
              <rect width={14} height={14} rx={3} fill="#f43f5e" />
              <text x={4} y={11} fill="#fff" fontSize="10" fontWeight="bold">×</text>
            </g>
          )}
        </g>
      );
    }

    if (d.type === 'horizontal') {
      return (
        <g
          key={d.id}
          className="group"
          onMouseEnter={() => setHoveredDrawingId(d.id)}
          onMouseLeave={() => setHoveredDrawingId(null)}
        >
          <line
            x1={0}
            y1={d.y}
            x2="100%"
            y2={d.y}
            stroke={d.color}
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
          <rect x={10} y={d.y - 10} width={75} height={18} fill="rgba(15, 23, 42, 0.9)" rx={3} />
          <text x={16} y={d.y + 3} fill={d.color} fontSize="10" fontFamily="monospace" fontWeight="bold">
            {d.label}
          </text>
          {!isPreview && hoveredDrawingId === d.id && (
            <g
              transform={`translate(92, ${d.y - 8})`}
              onClick={(e) => handleDeleteDrawing(d.id, e)}
              className="cursor-pointer"
            >
              <rect width={14} height={14} rx={3} fill="#f43f5e" />
              <text x={4} y={11} fill="#fff" fontSize="10" fontWeight="bold">×</text>
            </g>
          )}
        </g>
      );
    }

    if (d.type === 'long_pos') {
      const boxW = 160;
      const targetH = 50;
      const stopH = 30;
      return (
        <g key={d.id} transform={`translate(${d.startX}, ${d.startY})`}>
          {/* Target Zone */}
          <rect y={-targetH} width={boxW} height={targetH} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth={1} />
          <text x={8} y={-targetH + 16} fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
            Target +30 pips (R:R 2.0)
          </text>
          {/* Entry Line */}
          <line x1={0} y1={0} x2={boxW} y2={0} stroke="#38bdf8" strokeWidth={2} />
          {/* Stop Zone */}
          <rect y={0} width={boxW} height={stopH} fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth={1} />
          <text x={8} y={20} fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="monospace">
            Stop -15 pips
          </text>
        </g>
      );
    }

    if (d.type === 'short_pos') {
      const boxW = 160;
      const targetH = 50;
      const stopH = 30;
      return (
        <g key={d.id} transform={`translate(${d.startX}, ${d.startY})`}>
          {/* Stop Zone */}
          <rect y={-stopH} width={boxW} height={stopH} fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth={1} />
          <text x={8} y={-stopH + 16} fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="monospace">
            Stop -15 pips
          </text>
          {/* Entry Line */}
          <line x1={0} y1={0} x2={boxW} y2={0} stroke="#38bdf8" strokeWidth={2} />
          {/* Target Zone */}
          <rect y={0} width={boxW} height={targetH} fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth={1} />
          <text x={8} y={20} fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="monospace">
            Target +30 pips (R:R 2.0)
          </text>
        </g>
      );
    }

    if (d.type === 'text') {
      return (
        <g key={d.id} transform={`translate(${d.x}, ${d.y})`}>
          <rect x={-4} y={-14} width={d.text.length * 8 + 14} height={20} fill="rgba(15, 23, 42, 0.85)" rx={4} stroke={d.color} strokeWidth={1} />
          <text x={4} y={0} fill={d.color} fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            {d.text}
          </text>
        </g>
      );
    }

    return null;
  };

  // Current live candle price
  const currentCandle = allCandles[replayIndex] || { close: selectedAsset.basePrice, open: selectedAsset.basePrice };
  const priceChange = (currentCandle.close - currentCandle.open);
  const isUp = priceChange >= 0;

  return (
    <div
      ref={containerRef}
      className={`transition-all duration-300 flex flex-col bg-[#080d1a] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl ${
        isFullscreen ? 'fixed inset-0 z-[100] w-screen h-screen rounded-none' : 'w-full my-4 min-h-[820px]'
      }`}
    >
      {/* ─── Top TradingView & FX Replay Action Bar ─────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 bg-[#0e1424] border-b border-slate-800/90 select-none">
        {/* Left: Asset Picker & Live Price */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <select
              value={selectedAsset.id}
              onChange={(e) => {
                const found = ASSETS.find((a) => a.id === e.target.value);
                if (found) setSelectedAsset(found);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono text-xs sm:text-sm font-bold appearance-none pr-8 cursor-pointer hover:border-cyan-400 focus:outline-none"
            >
              {ASSETS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cyan-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Live Price Tag */}
          <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800">
            <span className={isUp ? 'text-emerald-400' : 'text-rose-400'}>
              {currentCandle.close.toFixed(selectedAsset.decimals)}
            </span>
            {isUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>

          {/* Timeframe Buttons */}
          <div className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                  selectedTimeframe.id === tf.id
                    ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Prominent Replay Toolbar (Play, Pause, Step Forward, Cut) */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-950/90 px-2 sm:px-3 py-1.5 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(0,255,157,0.1)]">
          {/* Jump / Cut Tool */}
          <button
            onClick={() => {
              setIsCutMode(!isCutMode);
              if (!isCutMode) {
                // Cut back 50 bars
                setReplayIndex((prev) => Math.max(20, prev - 50));
              }
            }}
            title="Cut to Historical Bar (Jump Back 50 candles)"
            className={`p-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1 ${
              isCutMode
                ? 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] font-bold">Cut</span>
          </button>

          {/* Step Backward */}
          <button
            onClick={handleStepBack}
            title="Step Back 1 Candle"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Replay Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Market (Market Stops Completely)' : 'Play Candle Stream'}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/30 animate-pulse'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          {/* Step Forward (1 Candle) */}
          <button
            onClick={handleStepForward}
            title="Step Forward 1 Candle"
            className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-400 hover:bg-slate-800 transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="relative flex items-center ml-1 border-l border-slate-800 pl-2">
            <select
              value={replaySpeed}
              onChange={(e) => setReplaySpeed(Number(e.target.value))}
              className="bg-transparent text-[11px] font-mono font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s.value} value={s.value} className="bg-slate-900 text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Replay */}
          <button
            onClick={handleResetReplay}
            title="Reset Replay Stream"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Indicators Modal Toggle & Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Indicators Button */}
          <button
            onClick={() => setShowIndicatorsModal(!showIndicatorsModal)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all flex items-center gap-1.5 ${
              showIndicatorsModal
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-purple-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Indicators (fx)</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 1-Click'}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* ─── Indicators Configuration Dropdown / Modal ───────────────────────── */}
      {showIndicatorsModal && (
        <div className="p-3 bg-slate-950/95 border-b border-purple-500/30 flex flex-wrap items-center justify-between gap-3 text-xs font-mono z-30">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Active Indicators:</span>
            <label className="flex items-center gap-1.5 text-cyan-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showEMA20}
                onChange={(e) => setShowEMA20(e.target.checked)}
                className="rounded accent-cyan-400"
              />
              EMA 20
            </label>
            <label className="flex items-center gap-1.5 text-purple-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showEMA50}
                onChange={(e) => setShowEMA50(e.target.checked)}
                className="rounded accent-purple-400"
              />
              EMA 50
            </label>
            <label className="flex items-center gap-1.5 text-amber-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showEMA200}
                onChange={(e) => setShowEMA200(e.target.checked)}
                className="rounded accent-amber-400"
              />
              EMA 200 (Institutional)
            </label>
            <label className="flex items-center gap-1.5 text-sky-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showBB}
                onChange={(e) => setShowBB(e.target.checked)}
                className="rounded accent-sky-400"
              />
              Bollinger Bands (20, 2)
            </label>
            <label className="flex items-center gap-1.5 text-emerald-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showSupertrend}
                onChange={(e) => setShowSupertrend(e.target.checked)}
                className="rounded accent-emerald-400"
              />
              Supertrend (10, 3)
            </label>
            <label className="flex items-center gap-1.5 text-rose-300 cursor-pointer">
              <input
                type="checkbox"
                checked={showRSI}
                onChange={(e) => setShowRSI(e.target.checked)}
                className="rounded accent-rose-400"
              />
              RSI (14) Sub-chart
            </label>
          </div>
          <button
            onClick={() => setShowIndicatorsModal(false)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800"
          >
            Close
          </button>
        </div>
      )}

      {/* ─── Main TradingView Studio Body (Left Tools + Massive Chart Area) ────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ─── Left Drawing Toolbar (TradingView Style) ────────────────────────── */}
        <div className="w-12 sm:w-14 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col items-center py-2.5 gap-2 select-none z-30">
          {/* Cursor / Select */}
          <button
            onClick={() => setActiveTool('cursor')}
            title="Cursor / Pan Chart"
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'cursor'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <MousePointer className="w-4 h-4" />
          </button>

          {/* Rectangle / Order Block / Zone Tool */}
          <button
            onClick={() => setActiveTool('rectangle')}
            title="Rectangle (Draw Order Block / Demand / Supply Zone)"
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'rectangle'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80'
            }`}
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Trendline Tool */}
          <button
            onClick={() => setActiveTool('trendline')}
            title="Trendline (Click & Drag)"
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'trendline'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          {/* Horizontal Line Tool */}
          <button
            onClick={() => setActiveTool('horizontal')}
            title="Horizontal Line (Support / Resistance)"
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'horizontal'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-purple-400 hover:bg-slate-800/80'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Long Position Tool */}
          <button
            onClick={() => setActiveTool('long_pos')}
            title="Long Position Tool (Risk:Reward Box)"
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'long_pos'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          {/* Short Position Tool */}
          <button
            onClick={() => setActiveTool('short_pos')}
            title="Short Position Tool (Risk:Reward Box)"
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'short_pos'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/80'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
          </button>

          {/* Text Tool */}
          <button
            onClick={() => setActiveTool('text')}
            title="Text Note / Annotation"
            className={`p-2 rounded-xl transition-all ${
              activeTool === 'text'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800/80'
            }`}
          >
            <Type className="w-4 h-4" />
          </button>

          <div className="w-6 h-[1px] bg-slate-800 my-1" />

          {/* Undo */}
          <button
            onClick={handleUndoDrawing}
            disabled={drawings.length === 0}
            title="Undo Last Drawing"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Clear All */}
          <button
            onClick={handleClearDrawings}
            disabled={drawings.length === 0}
            title="Clear All Drawings"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Massive Center Chart Area (with SVG Drawing Layer) ──────────────── */}
        <div ref={chartWrapperRef} className="flex-1 flex flex-col relative bg-[#0d1117] overflow-hidden">
          {/* Active Drawing Tool Helper Bar */}
          {activeTool !== 'cursor' && (
            <div className="absolute top-2 left-3 right-3 z-30 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 backdrop-blur-md font-mono text-xs shadow-xl animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="text-cyan-300 font-bold uppercase tracking-wider">
                  Drawing: {activeTool}
                </span>
                <span className="text-slate-400 hidden sm:inline text-[11px]">
                  {activeTool === 'rectangle' && 'Click & drag on the chart to create an Order Block / Supply-Demand zone.'}
                  {activeTool === 'trendline' && 'Click & drag to draw a trendline.'}
                  {activeTool === 'horizontal' && 'Click anywhere to place a Support / Resistance ray.'}
                </span>
              </div>

              {/* Color & Label Selector for Rectangles */}
              <div className="flex items-center gap-2">
                {activeTool === 'rectangle' && (
                  <>
                    <select
                      value={selectedZoneLabel}
                      onChange={(e) => setSelectedZoneLabel(e.target.value)}
                      className="px-2 py-0.5 rounded bg-slate-800 text-white text-[11px] border border-slate-700"
                    >
                      <option value="Order Block">Order Block</option>
                      <option value="Demand Zone">Demand Zone</option>
                      <option value="Supply Zone">Supply Zone</option>
                      <option value="Fair Value Gap">Fair Value Gap</option>
                      <option value="Breaker Block">Breaker Block</option>
                    </select>

                    <div className="flex items-center gap-1">
                      {DRAW_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedDrawColor(c.hex)}
                          className={`w-4 h-4 rounded-full border ${
                            selectedDrawColor === c.hex ? 'ring-2 ring-white scale-110' : 'opacity-70'
                          }`}
                          style={{ backgroundColor: c.hex, borderColor: c.hex }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </>
                )}

                <button
                  onClick={() => setActiveTool('cursor')}
                  className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] hover:bg-rose-500/30"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Chart Container (Large Original Size) */}
          <div className="relative flex-1 w-full h-full min-h-[580px]">
            <div ref={chartContainerRef} className="w-full h-full" />

            {/* SVG Drawing Layer on Top of Chart */}
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

          {/* Optional RSI Sub-Chart Container */}
          {showRSI && (
            <div className="w-full h-[110px] bg-[#090d16] border-t border-slate-800/80 relative">
              <div ref={rsiContainerRef} className="w-full h-full" />
            </div>
          )}
        </div>
      </div>

      {/* ─── Bottom Floating Trading Simulator HUD & Action Bar ───────────────── */}
      <div className="bg-[#0b1020] border-t border-slate-800/90 px-3 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs select-none">
        {/* Left: Quick Execution Buttons (Buy / Sell) */}
        <div className="flex items-center gap-2">
          {activeTrade ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center gap-2">
                <span className={`font-black ${activeTrade.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeTrade.type} @ {activeTrade.entry}
                </span>
                <span className={`font-bold ${activeTrade.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {activeTrade.unrealizedPnl >= 0 ? '+' : ''}${activeTrade.unrealizedPnl || 0}
                </span>
              </div>
              <button
                onClick={handleCloseTradeManual}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/50 hover:bg-rose-500 hover:text-white font-bold transition-all"
              >
                Close Trade
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExecuteTrade('BUY')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>BUY (LONG)</span>
              </button>

              <button
                onClick={() => handleExecuteTrade('SELL')}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] transition-all"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>SELL (SHORT)</span>
              </button>

              {/* SL / TP Inputs */}
              <div className="hidden lg:flex items-center gap-2 ml-2 text-[11px] text-slate-400">
                <span>SL:</span>
                <input
                  type="number"
                  value={slPips}
                  onChange={(e) => setSlPips(Math.max(5, Number(e.target.value)))}
                  className="w-12 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-bold text-center"
                />
                <span>pips</span>

                <span className="ml-1">TP:</span>
                <input
                  type="number"
                  value={tpPips}
                  onChange={(e) => setTpPips(Math.max(5, Number(e.target.value)))}
                  className="w-12 px-1.5 py-1 rounded bg-slate-900 border border-slate-700 text-white font-bold text-center"
                />
                <span>pips</span>

                <span className="text-cyan-400 font-bold ml-1">
                  (R:R 1:{(tpPips / slPips).toFixed(1)})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Center: Live Performance HUD */}
        <div className="flex items-center gap-4 sm:gap-6 bg-slate-950/80 px-4 py-1.5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Balance</span>
            <span className="text-sm font-black text-white font-mono">${stats.equity.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Win Rate</span>
            <span className="text-sm font-black text-emerald-400 font-mono">{stats.winRate}%</span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Wins / Losses</span>
            <span className="text-xs font-bold text-slate-300 font-mono">
              <span className="text-emerald-400">{stats.wins}W</span> - <span className="text-rose-400">{stats.losses}L</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase text-slate-500 block">Net P&L</span>
            <span className={`text-sm font-black font-mono ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toFixed(2)} ({stats.pnlPercent}%)
            </span>
          </div>
        </div>

        {/* Right: Trade Journal Toggle */}
        <div>
          <button
            onClick={() => setShowJournalDrawer(!showJournalDrawer)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold flex items-center gap-1.5 transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Journal ({tradeHistory.length})</span>
          </button>
        </div>
      </div>

      {/* ─── Trade Journal Slide-Over Drawer ─────────────────────────────────── */}
      {showJournalDrawer && (
        <div className="bg-[#090d18] border-t border-slate-800 p-4 max-h-60 overflow-y-auto animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <h4 className="text-xs font-mono font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Backtesting Trade Journal & Performance History
            </h4>
            <button
              onClick={() => setShowJournalDrawer(false)}
              className="text-slate-400 hover:text-white text-xs font-mono"
            >
              Close
            </button>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800/80">
                <th className="py-1.5">Asset</th>
                <th>Type</th>
                <th>Entry</th>
                <th>Exit</th>
                <th>R:R</th>
                <th>P&L ($)</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {tradeHistory.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="py-1.5 font-bold text-white">{t.asset}</td>
                  <td className={t.type === 'BUY' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {t.type}
                  </td>
                  <td className="text-slate-300">{t.entryPrice}</td>
                  <td className="text-slate-300">{t.exitPrice}</td>
                  <td className="text-cyan-400">{t.rr}</td>
                  <td className={t.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                        t.result === 'WIN'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {t.result === 'WIN' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {t.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FXReplayBacktest;
