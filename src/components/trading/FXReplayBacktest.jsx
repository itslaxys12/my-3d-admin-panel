import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import {
  Play,
  Pause,
  SkipForward,
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ─── Supported Assets & Starting Data Configuration ──────────────────────────
const ASSETS = [
  { id: 'EURUSD', name: 'EUR / USD', type: 'Forex', basePrice: 1.0865, pipSize: 0.0001, spread: 0.0001 },
  { id: 'GBPUSD', name: 'GBP / USD', type: 'Forex', basePrice: 1.2740, pipSize: 0.0001, spread: 0.0001 },
  { id: 'USDJPY', name: 'USD / JPY', type: 'Forex', basePrice: 154.20, pipSize: 0.01, spread: 0.01 },
  { id: 'XAUUSD', name: 'XAU / USD (Gold)', type: 'Metals', basePrice: 2365.50, pipSize: 0.1, spread: 0.2 },
  { id: 'BTCUSD', name: 'BTC / USD (Bitcoin)', type: 'Crypto', basePrice: 64800.0, pipSize: 1.0, spread: 5.0 },
  { id: 'ETHUSD', name: 'ETH / USD (Ethereum)', type: 'Crypto', basePrice: 3450.0, pipSize: 0.1, spread: 0.5 },
  { id: 'US30', name: 'US30 (Dow Jones)', type: 'Indices', basePrice: 39850.0, pipSize: 1.0, spread: 2.0 },
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
  { label: '0.2s', value: 200 },
  { label: '0.5s', value: 500 },
  { label: '1s', value: 1000 },
  { label: '2s', value: 2000 },
];

// ─── Realistic Candle Generator ──────────────────────────────────────────────
function generateCandles(basePrice, pipSize, count = 280) {
  const candles = [];
  let current = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const interval = 300; // 5m intervals
  let startTime = now - count * interval;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * interval;
    const volatility = pipSize * (10 + Math.sin(i / 15) * 8 + Math.random() * 12);
    const direction = Math.random() > 0.48 ? 1 : -1;
    const change = (Math.random() * volatility) * direction;

    const open = current;
    const close = +(open + change).toFixed(basePrice > 100 ? 2 : 5);
    const high = +(Math.max(open, close) + Math.random() * volatility * 0.7).toFixed(basePrice > 100 ? 2 : 5);
    const low = +(Math.min(open, close) - Math.random() * volatility * 0.7).toFixed(basePrice > 100 ? 2 : 5);
    const volume = Math.floor(100 + Math.random() * 800 + Math.abs(change / pipSize) * 20);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    current = close;
  }
  return candles;
}

// ─── Indicator Calculation Helpers ───────────────────────────────────────────
function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [];
  let prevEma = data[0]?.close || 0;

  for (let i = 0; i < data.length; i++) {
    const close = data[i].close;
    if (i === 0) {
      prevEma = close;
    } else {
      prevEma = close * k + prevEma * (1 - k);
    }
    ema.push({
      time: data[i].time,
      value: +prevEma.toFixed(data[0].close > 100 ? 2 : 5),
    });
  }
  return ema;
}

function calculateRSI(data, period = 14) {
  if (data.length < period + 1) return [];
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

// ─── Main FX Replay Backtest Component ────────────────────────────────────────
export function FXReplayBacktest() {
  const chartContainerRef = useRef(null);
  const rsiContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const rsiInstanceRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const ema20SeriesRef = useRef(null);
  const ema50SeriesRef = useRef(null);
  const rsiSeriesRef = useRef(null);

  // Price Lines for active trade (Entry, SL, TP)
  const entryLineRef = useRef(null);
  const slLineRef = useRef(null);
  const tpLineRef = useRef(null);

  // Fullscreen Container
  const backtestRootRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Asset & Timeframe
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(TIMEFRAMES[1]); // 5m

  // Replay State
  const [allCandles, setAllCandles] = useState([]);
  const [replayIndex, setReplayIndex] = useState(120); // Current index in historical candle stream
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(500); // 500ms
  const [isCutMode, setIsCutMode] = useState(false);

  // Indicators toggle
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  // ─── Virtual Trading Simulator State (FX Replay Style) ──────────────────────
  const [balance, setBalance] = useState(10000.0);
  const [riskAmount, setRiskAmount] = useState(150.0);
  const [activeTrade, setActiveTrade] = useState(null);
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

  // Trade Inputs
  const [slPips, setSlPips] = useState(15);
  const [tpPips, setTpPips] = useState(30);

  // ─── Initialize Candles when Asset Changes ─────────────────────────────────
  useEffect(() => {
    const raw = generateCandles(selectedAsset.basePrice, selectedAsset.pipSize, 300);
    setAllCandles(raw);
    setReplayIndex(120);
    setIsPlaying(false);
    setActiveTrade(null);
  }, [selectedAsset]);

  // ─── Setup Chart Instances ──────────────────────────────────────────────────
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Main Candlestick Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: 'rgba(51, 65, 85, 0.5)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 440,
    });

    // Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00ff9d',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#00ff9d',
      wickDownColor: '#f43f5e',
    });

    // Volume Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#00f0ff',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });

    // EMA Series
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

    chartInstanceRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;

    // RSI Sub-chart
    if (rsiContainerRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: '#060911' },
          textColor: '#64748b',
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.2)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.2)' },
        },
        rightPriceScale: {
          borderColor: 'rgba(51, 65, 85, 0.5)',
        },
        timeScale: {
          visible: false,
        },
        width: rsiContainerRef.current.clientWidth,
        height: 100,
      });

      const rsiSeries = rsiChart.addLineSeries({
        color: '#f59e0b',
        lineWidth: 1.5,
        title: 'RSI 14',
      });

      // 70 / 30 reference lines
      rsiSeries.createPriceLine({ price: 70, color: 'rgba(244, 63, 94, 0.5)', lineWidth: 1, lineStyle: 2, title: 'OB 70' });
      rsiSeries.createPriceLine({ price: 30, color: 'rgba(0, 255, 157, 0.5)', lineWidth: 1, lineStyle: 2, title: 'OS 30' });

      rsiInstanceRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;
    }

    // Resize Handler
    const handleResize = () => {
      if (chartContainerRef.current && chartInstanceRef.current) {
        chartInstanceRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
      if (rsiContainerRef.current && rsiInstanceRef.current) {
        rsiInstanceRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      if (rsiInstanceRef.current) {
        rsiInstanceRef.current.remove();
      }
    };
  }, []);

  // ─── Update Visible Slices Based on replayIndex ─────────────────────────────
  useEffect(() => {
    if (!allCandles.length || !candleSeriesRef.current) return;

    const visibleCandles = allCandles.slice(0, replayIndex + 1);
    candleSeriesRef.current.setData(visibleCandles);

    // Volume
    if (volumeSeriesRef.current) {
      if (showVolume) {
        volumeSeriesRef.current.setData(
          visibleCandles.map((c) => ({
            time: c.time,
            value: c.volume,
            color: c.close >= c.open ? 'rgba(0, 255, 157, 0.25)' : 'rgba(244, 63, 94, 0.25)',
          }))
        );
      } else {
        volumeSeriesRef.current.setData([]);
      }
    }

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

    // RSI
    if (rsiSeriesRef.current && showRSI && visibleCandles.length > 15) {
      rsiSeriesRef.current.setData(calculateRSI(visibleCandles, 14));
    }

    // ─── Check Active Trade Hits (TP / SL evaluation) ─────────────────────────
    if (activeTrade && visibleCandles.length > 0) {
      const currentCandle = visibleCandles[visibleCandles.length - 1];

      if (activeTrade.type === 'BUY') {
        if (currentCandle.high >= activeTrade.tp) {
          handleTradeExit('WIN', activeTrade.tp, activeTrade.reward);
        } else if (currentCandle.low <= activeTrade.sl) {
          handleTradeExit('LOSS', activeTrade.sl, -activeTrade.risk);
        }
      } else if (activeTrade.type === 'SELL') {
        if (currentCandle.low <= activeTrade.tp) {
          handleTradeExit('WIN', activeTrade.tp, activeTrade.reward);
        } else if (currentCandle.high >= activeTrade.sl) {
          handleTradeExit('LOSS', activeTrade.sl, -activeTrade.risk);
        }
      }
    }
  }, [replayIndex, allCandles, showEMA20, showEMA50, showRSI, showVolume, activeTrade]);

  // ─── Auto Playback Loop ────────────────────────────────────────────────────
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= allCandles.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, replaySpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, replaySpeed, allCandles.length]);

  // ─── Visual Price Lines for Trade ──────────────────────────────────────────
  const drawTradeLines = (trade) => {
    if (!candleSeriesRef.current) return;
    clearTradeLines();

    if (!trade) return;

    entryLineRef.current = candleSeriesRef.current.createPriceLine({
      price: trade.entryPrice,
      color: '#00f0ff',
      lineWidth: 1.5,
      lineStyle: 1,
      axisLabelVisible: true,
      title: `ENTRY ${trade.type} @ ${trade.entryPrice}`,
    });

    tpLineRef.current = candleSeriesRef.current.createPriceLine({
      price: trade.tp,
      color: '#00ff9d',
      lineWidth: 1.5,
      lineStyle: 0,
      axisLabelVisible: true,
      title: `TAKE PROFIT @ ${trade.tp} (+$${trade.reward.toFixed(1)})`,
    });

    slLineRef.current = candleSeriesRef.current.createPriceLine({
      price: trade.sl,
      color: '#f43f5e',
      lineWidth: 1.5,
      lineStyle: 0,
      axisLabelVisible: true,
      title: `STOP LOSS @ ${trade.sl} (-$${trade.risk.toFixed(1)})`,
    });
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

  // ─── Trade Execution Logic ─────────────────────────────────────────────────
  const currentCandle = allCandles[replayIndex] || {};
  const currentPrice = currentCandle.close || selectedAsset.basePrice;

  const handleOpenTrade = (type) => {
    if (activeTrade) return;

    const entryPrice = currentPrice;
    let sl = 0;
    let tp = 0;
    const pipVal = selectedAsset.pipSize;

    if (type === 'BUY') {
      sl = +(entryPrice - slPips * pipVal).toFixed(selectedAsset.basePrice > 100 ? 2 : 5);
      tp = +(entryPrice + tpPips * pipVal).toFixed(selectedAsset.basePrice > 100 ? 2 : 5);
    } else {
      sl = +(entryPrice + slPips * pipVal).toFixed(selectedAsset.basePrice > 100 ? 2 : 5);
      tp = +(entryPrice - tpPips * pipVal).toFixed(selectedAsset.basePrice > 100 ? 2 : 5);
    }

    const rrRatio = +(tpPips / slPips).toFixed(2);
    const rewardAmount = +(riskAmount * rrRatio).toFixed(2);

    const newTrade = {
      id: Date.now(),
      asset: selectedAsset.id,
      type,
      entryPrice,
      sl,
      tp,
      risk: riskAmount,
      reward: rewardAmount,
      rr: `1:${rrRatio}`,
    };

    setActiveTrade(newTrade);
    drawTradeLines(newTrade);
  };

  const handleTradeExit = (result, exitPrice, pnlAmount) => {
    if (!activeTrade) return;

    if (result === 'WIN') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00ff9d', '#00f0ff', '#a855f7'],
      });
    }

    const newBalance = +(balance + pnlAmount).toFixed(2);
    setBalance(newBalance);

    const closed = {
      id: activeTrade.id,
      asset: activeTrade.asset,
      type: activeTrade.type,
      entryPrice: activeTrade.entryPrice,
      exitPrice,
      result,
      pnl: pnlAmount,
      pnlPercent: +((pnlAmount / balance) * 100).toFixed(2),
      rr: activeTrade.rr,
      time: new Date().toLocaleTimeString(),
    };

    setTradeHistory((prev) => [closed, ...prev]);
    setActiveTrade(null);
    clearTradeLines();
  };

  const handleBreakEven = () => {
    if (!activeTrade) return;
    const updated = {
      ...activeTrade,
      sl: activeTrade.entryPrice,
    };
    setActiveTrade(updated);
    drawTradeLines(updated);
  };

  const handleManualClose = () => {
    if (!activeTrade) return;
    const exitPrice = currentPrice;
    let pnl = 0;
    if (activeTrade.type === 'BUY') {
      const diff = exitPrice - activeTrade.entryPrice;
      pnl = +(diff / (selectedAsset.pipSize * slPips) * activeTrade.risk).toFixed(2);
    } else {
      const diff = activeTrade.entryPrice - exitPrice;
      pnl = +(diff / (selectedAsset.pipSize * slPips) * activeTrade.risk).toFixed(2);
    }
    const result = pnl >= 0 ? 'WIN' : 'LOSS';
    handleTradeExit(result, exitPrice, pnl);
  };

  // ─── Step Forward / Step Back Handlers ─────────────────────────────────────
  const handleStepForward = () => {
    setIsPlaying(false);
    setReplayIndex((prev) => Math.min(allCandles.length - 1, prev + 1));
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setReplayIndex((prev) => Math.max(10, prev - 1));
  };

  const handleResetReplay = () => {
    setIsPlaying(false);
    setReplayIndex(80);
    setActiveTrade(null);
    clearTradeLines();
  };

  const handleCutToPoint = (fraction) => {
    const targetIdx = Math.floor(allCandles.length * fraction);
    setReplayIndex(Math.max(20, targetIdx));
    setIsCutMode(false);
  };

  // ─── Fullscreen Toggle ─────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    if (!backtestRootRef.current) return;

    if (!document.fullscreenElement) {
      backtestRootRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ─── Performance HUD Calculations ──────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tradeHistory.length;
    const wins = tradeHistory.filter((t) => t.result === 'WIN').length;
    const losses = tradeHistory.filter((t) => t.result === 'LOSS').length;
    const winRate = total > 0 ? +((wins / total) * 100).toFixed(1) : 0;
    const netPnL = +tradeHistory.reduce((acc, t) => acc + t.pnl, 0).toFixed(2);
    const netPercent = +((netPnL / 10000.0) * 100).toFixed(1);

    return { total, wins, losses, winRate, netPnL, netPercent };
  }, [tradeHistory]);

  return (
    <div
      ref={backtestRootRef}
      className={`w-full rounded-3xl bg-[#090d16]/95 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300 font-mono my-6 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-4 bg-[#050811] overflow-y-auto' : 'p-4 sm:p-6'
      }`}
    >
      {/* ─── 1. TOP BAR: FX REPLAY SIGNATURE TOOLBAR ────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        {/* Left: Asset Picker & Timeframe Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Asset Dropdown */}
          <div className="relative">
            <select
              value={selectedAsset.id}
              onChange={(e) => {
                const a = ASSETS.find((x) => x.id === e.target.value);
                if (a) setSelectedAsset(a);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-heading font-black text-xs sm:text-sm focus:outline-none focus:border-cyan-400 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              {ASSETS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedTimeframe.id === tf.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Indicator Toggles */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2">
            <button
              onClick={() => setShowEMA20(!showEMA20)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                showEMA20
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              EMA 20
            </button>
            <button
              onClick={() => setShowEMA50(!showEMA50)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                showEMA50
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              EMA 50
            </button>
            <button
              onClick={() => setShowRSI(!showRSI)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                showRSI
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              RSI 14
            </button>
          </div>
        </div>

        {/* Center: REPLAY BAR (PAUSE, PLAY, STEP FORWARD, CUT) */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-1.5 rounded-2xl border border-emerald-500/40 shadow-[0_0_20px_rgba(0,255,157,0.15)]">
          {/* Scissors Cut Button */}
          <button
            onClick={() => setIsCutMode(!isCutMode)}
            title="Cut History (Jump to Bar)"
            className={`p-2 rounded-xl transition-all ${
              isCutMode
                ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scissors className="w-4 h-4" />
          </button>

          {/* Step Back */}
          <button
            onClick={handleStepBack}
            title="Step Back 1 Bar"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* PLAY / PAUSE (THE EXACT FEATURE USER REQUESTED) */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? 'Pause Market (আটকে দিন)' : 'Play Market (চালু করুন)'}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg ${
              isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,157,0.4)]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-black" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>PLAY</span>
              </>
            )}
          </button>

          {/* Step Forward (1 Bar) */}
          <button
            onClick={handleStepForward}
            title="Step Forward (১ ক্যান্ডেল সামনে)"
            className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Replay Speed */}
          <div className="flex items-center pl-1">
            <select
              value={replaySpeed}
              onChange={(e) => setReplaySpeed(Number(e.target.value))}
              className="bg-slate-950 text-slate-300 text-[11px] font-mono px-2 py-1 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500"
            >
              {SPEED_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Fullscreen & Live Status Badge */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-bold">REPLAY LIVE</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-bold">{currentPrice}</span>
          </div>

          {/* FULLSCREEN BUTTON */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen (পুরো স্ক্রিন করুন)'}
            className="px-3 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'EXIT FULL' : 'FULLSCREEN'}</span>
          </button>
        </div>
      </div>

      {/* ─── 2. CUT MODE NOTICE BAR ────────────────────────────────────────── */}
      {isCutMode && (
        <div className="my-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 animate-bounce" />
            <span>
              <strong>Cut Mode Active:</strong> চার্টের যেখান থেকে ব্যাকটেস্ট শুরু করতে চান, নিচের প্রিসেট টাইমপয়েন্টে ক্লিক করুন:
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCutToPoint(0.25)}
              className="px-2 py-0.5 rounded bg-rose-500/30 hover:bg-rose-500 text-white font-bold text-[10px]"
            >
              25% Past
            </button>
            <button
              onClick={() => handleCutToPoint(0.5)}
              className="px-2 py-0.5 rounded bg-rose-500/30 hover:bg-rose-500 text-white font-bold text-[10px]"
            >
              50% Mid
            </button>
            <button
              onClick={() => handleCutToPoint(0.75)}
              className="px-2 py-0.5 rounded bg-rose-500/30 hover:bg-rose-500 text-white font-bold text-[10px]"
            >
              75% Recent
            </button>
            <button
              onClick={() => setIsCutMode(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. LIVE PERFORMANCE HUD & WIN RATE STRIP ───────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 my-3">
        {/* Metric 1: Win Rate % */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(0,255,157,0.3)]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Win Rate</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 leading-tight">
              {stats.winRate}%
            </div>
          </div>
        </div>

        {/* Metric 2: Wins vs Losses */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Score</div>
            <div className="text-base sm:text-lg font-black text-white leading-tight">
              <span className="text-emerald-400">{stats.wins}W</span> / <span className="text-rose-400">{stats.losses}L</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Total Trades */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Total Trades</div>
            <div className="text-base sm:text-lg font-black text-purple-300 leading-tight">
              {stats.total} Executed
            </div>
          </div>
        </div>

        {/* Metric 4: Net P&L ($) */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Net P&L</div>
            <div
              className={`text-base sm:text-lg font-black leading-tight ${
                stats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stats.netPnL >= 0 ? `+$${stats.netPnL}` : `-$${Math.abs(stats.netPnL)}`}
            </div>
          </div>
        </div>

        {/* Metric 5: Account Balance */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Account Balance</div>
            <div className="text-base sm:text-lg font-black text-white leading-tight">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Metric 6: Replay Bar Progress */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Candle Index</div>
            <div className="text-base sm:text-lg font-black text-cyan-300 leading-tight">
              {replayIndex + 1} / {allCandles.length}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. MAIN CHART & EXECUTION DOCK ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-2">
        {/* Left 3 Columns: Interactive Candlestick Chart */}
        <div className="lg:col-span-3 rounded-2xl bg-slate-950 border border-slate-800/80 p-2 overflow-hidden shadow-inner relative">
          <div ref={chartContainerRef} className="w-full" />

          {/* RSI Sub-pane */}
          {showRSI && (
            <div className="border-t border-slate-800/80 mt-1 pt-1">
              <div className="text-[10px] text-amber-400/80 font-bold px-2 py-0.5 flex items-center justify-between">
                <span>RSI (14) OSCILLATOR</span>
                <span className="text-slate-500">Overbought: 70 | Oversold: 30</span>
              </div>
              <div ref={rsiContainerRef} className="w-full" />
            </div>
          )}

          {/* Active Trade Floating Banner on Chart */}
          {activeTrade && (
            <div className="absolute top-4 left-4 z-20 px-4 py-2 rounded-xl bg-slate-950/90 border border-cyan-500/50 backdrop-blur-md shadow-2xl flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded font-black text-[10px] ${
                    activeTrade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  ACTIVE {activeTrade.type}
                </span>
                <span className="text-slate-300 font-bold">Entry: {activeTrade.entryPrice}</span>
              </div>
              <div className="text-slate-400">
                TP: <span className="text-emerald-400 font-bold">{activeTrade.tp}</span> | SL:{' '}
                <span className="text-rose-400 font-bold">{activeTrade.sl}</span> ({activeTrade.rr})
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleBreakEven}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 text-[10px] font-bold"
                >
                  Move BE
                </button>
                <button
                  onClick={handleManualClose}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold"
                >
                  Close Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: FX Replay Order Execution & Strategy Console */}
        <div className="rounded-2xl bg-slate-950/90 border border-cyan-500/30 p-4 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span className="font-heading font-black text-sm text-white">ORDER DESK</span>
              </div>
              <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                1-CLICK EXECUTION
              </span>
            </div>

            {/* Quick BUY / SELL Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                disabled={Boolean(activeTrade)}
                onClick={() => handleOpenTrade('BUY')}
                className={`py-3 px-3 rounded-2xl font-black text-xs font-heading flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTrade
                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 hover:brightness-110 shadow-[0_0_20px_rgba(0,255,157,0.35)] active:scale-95'
                }`}
              >
                <div className="flex items-center gap-1 text-sm font-black">
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                  <span>BUY / LONG</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono">Ask: {currentPrice}</span>
              </button>

              <button
                disabled={Boolean(activeTrade)}
                onClick={() => handleOpenTrade('SELL')}
                className={`py-3 px-3 rounded-2xl font-black text-xs font-heading flex flex-col items-center justify-center gap-1 transition-all ${
                  activeTrade
                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-b from-rose-400 to-rose-600 text-white hover:brightness-110 shadow-[0_0_20px_rgba(244,63,94,0.35)] active:scale-95'
                }`}
              >
                <div className="flex items-center gap-1 text-sm font-black">
                  <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                  <span>SELL / SHORT</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono">Bid: {currentPrice}</span>
              </button>
            </div>

            {/* SL and TP Settings */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 flex items-center justify-between">
                  <span>Risk Per Trade ($)</span>
                  <span className="text-cyan-400 font-bold">${riskAmount}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={riskAmount}
                  onChange={(e) => setRiskAmount(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Stop Loss (Pips)</label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={slPips}
                    onChange={(e) => setSlPips(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 font-bold focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Take Profit (Pips)</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={tpPips}
                    onChange={(e) => setTpPips(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Risk:Reward Ratio</span>
                <span className="text-cyan-300 font-mono">1 : {(tpPips / slPips).toFixed(2)} RR</span>
              </div>
            </div>
          </div>

          {/* Quick Strategy Reset / Clear Button */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={handleResetReplay}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Replay</span>
            </button>

            <span className="text-[10px] text-slate-500 font-mono">FX REPLAY // V3.2</span>
          </div>
        </div>
      </div>

      {/* ─── 5. CLOSED TRADES JOURNAL & AUDIT TABLE ─────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-heading font-black text-white uppercase tracking-wider">
              Backtesting Trade Journal ({tradeHistory.length} Trades)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Current Session Net: <strong className={stats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{stats.netPnL >= 0 ? `+$${stats.netPnL}` : `-$${Math.abs(stats.netPnL)}`}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Asset</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Entry</th>
                <th className="py-2 px-3">Exit</th>
                <th className="py-2 px-3">R:R</th>
                <th className="py-2 px-3">PnL ($)</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/60">
              {tradeHistory.map((t, idx) => (
                <tr key={t.id || idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2 px-3 text-slate-500">#{tradeHistory.length - idx}</td>
                  <td className="py-2 px-3 font-bold text-slate-200">{t.asset}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        t.type === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-300">{t.entryPrice}</td>
                  <td className="py-2 px-3 text-slate-300">{t.exitPrice}</td>
                  <td className="py-2 px-3 text-cyan-300">{t.rr}</td>
                  <td className="py-2 px-3 font-bold">
                    <span className={t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {t.pnl >= 0 ? `+$${t.pnl.toFixed(2)}` : `-$${Math.abs(t.pnl).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="py-2 px-3">
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
      </div>
    </div>
  );
}
export default FXReplayBacktest;
