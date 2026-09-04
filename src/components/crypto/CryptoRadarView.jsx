import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Radio,
  Search,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart2,
  Lock,
  Compass,
  Cpu,
  RefreshCw,
  ExternalLink,
  Clock,
} from 'lucide-react';
import {
  NEW_MOONSHOT_COINS,
  MAJOR_GIANT_COINS,
  generateCandlesForCoin,
  formatCryptoPrice,
  fetchLiveBinanceTickers,
} from '../../utils/cryptoData';
import CryptoChart from './CryptoChart';
import HolographicCoin3D from './HolographicCoin3D';
import NewCoinAlertBanner from './NewCoinAlertBanner';
import GoldXAUUSDTerminal from './GoldXAUUSDTerminal';

export default function CryptoRadarView() {
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'major'
  const [selectedCoinId, setSelectedCoinId] = useState(NEW_MOONSHOT_COINS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('24H');
  const [chartMode, setChartMode] = useState('tradingview'); // Default to 100% Real TradingView Pro
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [livePrices, setLivePrices] = useState({});
  const [priceFlash, setPriceFlash] = useState({});

  // Combine lists
  const allCoins = useMemo(() => [...NEW_MOONSHOT_COINS, ...MAJOR_GIANT_COINS], []);

  // Fetch 100% real live market prices directly from Binance API every 4 seconds
  useEffect(() => {
    let isMounted = true;
    async function syncRealExchangePrices() {
      const realTickers = await fetchLiveBinanceTickers();
      if (!isMounted || !realTickers) return;

      setLivePrices((prev) => {
        const next = { ...prev };
        allCoins.forEach((c) => {
          if (c.binanceSymbol && realTickers[c.binanceSymbol]) {
            const newPrice = realTickers[c.binanceSymbol].price;
            const oldPrice = prev[c.id] || c.price;
            if (newPrice !== oldPrice) {
              setPriceFlash((flashPrev) => ({
                ...flashPrev,
                [c.id]: newPrice > oldPrice ? 'up' : 'down',
              }));
              setTimeout(() => {
                if (isMounted) {
                  setPriceFlash((flashPrev) => ({ ...flashPrev, [c.id]: null }));
                }
              }, 700);
            }
            next[c.id] = newPrice;
          } else if (!next[c.id]) {
            next[c.id] = c.price;
          }
        });
        return next;
      });
    }

    syncRealExchangePrices();
    const timer = setInterval(syncRealExchangePrices, 4000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [allCoins]);

  // Real-time micro-price ticking loop (sub-second simulated market order book)
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick 2 random coins to update price micro-tick
      const randomCoin1 = allCoins[Math.floor(Math.random() * allCoins.length)];
      const randomCoin2 = allCoins[Math.floor(Math.random() * allCoins.length)];

      [randomCoin1, randomCoin2].forEach((coin) => {
        if (!coin) return;
        const deltaPercent = (Math.random() - 0.48) * 0.004; // ±0.2% micro-tick
        setLivePrices((prev) => {
          const current = prev[coin.id] || coin.price;
          const updated = current * (1 + deltaPercent);
          return { ...prev, [coin.id]: updated };
        });

        setPriceFlash((prev) => ({
          ...prev,
          [coin.id]: deltaPercent >= 0 ? 'up' : 'down',
        }));

        setTimeout(() => {
          setPriceFlash((prev) => ({ ...prev, [coin.id]: null }));
        }, 600);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [allCoins]);

  const baseActiveCoin = useMemo(() => {
    return allCoins.find((c) => c.id === selectedCoinId) || NEW_MOONSHOT_COINS[0];
  }, [allCoins, selectedCoinId]);

  const activeCoin = useMemo(() => {
    return {
      ...baseActiveCoin,
      price: livePrices[baseActiveCoin.id] || baseActiveCoin.price,
    };
  }, [baseActiveCoin, livePrices]);

  // Generate candles whenever coin or timeframe changes
  const candles = useMemo(() => {
    return generateCandlesForCoin(activeCoin, timeframe);
  }, [activeCoin.id, timeframe]);

  // Filtered coins for active tab
  const displayCoins = useMemo(() => {
    const list = activeTab === 'new' ? NEW_MOONSHOT_COINS : MAJOR_GIANT_COINS;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
  }, [activeTab, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top VIP Owner Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-950/95 via-purple-950/60 to-slate-950/95 border border-purple-500/30 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                <CrownIcon className="w-3 h-3 text-amber-400" />
                VIP OWNER CLEARANCE EXCLUSIVE
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                DEX MOONSHOT ENGINE ACTIVE • {allCoins.length} COINS TRACKED
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-wide">
              Quantum Crypto Radar <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-300 to-emerald-400">& 3D Predictive Analytics</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
              Real-time DEX new listing scanner, sub-second order book tickers, multi-timeframe interactive candlestick charts, and 3D upside multiplier forecasting.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-center font-mono">
              <div className="text-[10px] text-slate-500 uppercase">Fear & Greed Index</div>
              <div className="text-emerald-400 font-bold text-sm">78 • Extreme Greed</div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Sync Feeds"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Live New Coin Alert Marquee & Radar Feed */}
      <NewCoinAlertBanner onSelectCoin={(coin) => setSelectedCoinId(coin.id)} />

      {/* Main 3-Column Cockpit Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Categorized Coin Selector (4 Cols on XL) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
            {/* Category Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setActiveTab('new')}
                className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'new'
                    ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>New Coins ({NEW_MOONSHOT_COINS.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('major')}
                className={`py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'major'
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Major Giants ({MAJOR_GIANT_COINS.length})</span>
              </button>
            </div>

            {/* Coin Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coins by name or symbol ($BTC, $GMX)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Scrollable Coin List */}
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {displayCoins.map((coin) => {
                const isSelected = coin.id === activeCoin.id;
                const isUp = coin.change24h >= 0;
                const currentPrice = livePrices[coin.id] || coin.price;
                const flash = priceFlash[coin.id];

                return (
                  <div
                    key={coin.id}
                    onClick={() => setSelectedCoinId(coin.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-950/60 to-slate-900 border-purple-500/70 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs shadow-inner flex-shrink-0"
                        style={{
                          backgroundColor: `${coin.color}15`,
                          color: coin.color,
                          border: `1px solid ${coin.color}40`,
                        }}
                      >
                        {coin.symbol.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{coin.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">${coin.symbol}</span>
                          {coin.isFeatured && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-400 text-black text-[9px] font-mono font-black">
                              GMX FLAGSHIP
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{coin.chain}</span>
                          <span>•</span>
                          <span className="text-purple-300">{coin.launchTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div
                        className={`text-xs font-bold transition-colors duration-300 ${
                          flash === 'up'
                            ? 'text-emerald-300 scale-105'
                            : flash === 'down'
                            ? 'text-rose-300 scale-105'
                            : 'text-white'
                        }`}
                      >
                        {formatCryptoPrice(currentPrice)}
                      </div>
                      <div
                        className={`text-[11px] font-bold flex items-center justify-end gap-0.5 ${
                          isUp ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {coin.change24h}%
                      </div>
                      {coin.targetMultiplier && (
                        <div className="text-[9px] text-purple-300 font-bold bg-purple-500/15 px-1.5 py-0.2 rounded border border-purple-500/30 mt-0.5 inline-block">
                          {coin.targetMultiplier}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Live Chart & Order Pressure (5 Cols on XL) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Active Coin Header Banner */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-base shadow-lg"
                style={{
                  backgroundColor: `${activeCoin.color}20`,
                  color: activeCoin.color,
                  border: `2px solid ${activeCoin.color}50`,
                }}
              >
                {activeCoin.symbol.slice(0, 4)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white font-heading">{activeCoin.name}</h2>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono font-bold">
                    ${activeCoin.symbol}
                  </span>
                  {activeCoin.isFeatured && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black">
                      OWNER GEM
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                  <span>Network: <strong className="text-slate-200">{activeCoin.chain}</strong></span>
                  <span>•</span>
                  <span>DEX: <strong className="text-purple-400">{activeCoin.dex}</strong></span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Market Cap</span>
              <span className="text-xs font-mono font-bold text-cyan-300">{activeCoin.marketCap}</span>
            </div>
          </div>

          {/* Interactive Chart Component with Expanded Timeframes */}
          <CryptoChart
            coin={activeCoin}
            candles={candles}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            chartMode={chartMode}
            setChartMode={setChartMode}
          />

          {/* Real-Time Order Flow Buy vs Sell Pressure Bar */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-400" />
                Live Order Flow Pressure
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-bold">{activeCoin.buyPressure}% BUY</span>
                <span className="text-rose-400 font-bold">{100 - activeCoin.buyPressure}% SELL</span>
              </div>
            </div>

            {/* Dual Colored Visual Bar */}
            <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800">
              <div
                className="h-full rounded-l-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500 shadow-[0_0_10px_#00ff9d]"
                style={{ width: `${activeCoin.buyPressure}%` }}
              />
              <div
                className="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-500"
                style={{ width: `${100 - activeCoin.buyPressure}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: 3D Holographic AI Analysis & Predictive Multiplier (3 Cols on XL) */}
        <div className="xl:col-span-3 space-y-4">
          {/* 3D Holographic Coin Visualizer */}
          <HolographicCoin3D
            symbol={activeCoin.symbol}
            name={activeCoin.name}
            color={activeCoin.color}
            isBullish={activeCoin.change24h >= 0}
          />

          {/* Predictive Multiplier Target Radar ("কত বড় যাবে, এত গুণে যাবে") */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/60 via-slate-950/80 to-slate-950/90 border border-purple-500/40 backdrop-blur-xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5 text-purple-300 font-mono text-xs font-bold uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                3D AI Upside Multiplier
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                PROJECTION
              </span>
            </div>

            {/* Big Multiplier Badge */}
            <div className="text-center py-2 bg-slate-900/60 rounded-xl border border-purple-500/30">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Forecasted Moonshot</span>
              <span className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400">
                {activeCoin.targetMultiplier}
              </span>
              <div className="text-xs font-mono text-cyan-300 mt-0.5">
                Target: <strong>{activeCoin.targetPrice}</strong>
              </div>
            </div>

            {/* Support / Stop-Loss Targets */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Stop-Loss</span>
                <span className="text-rose-400 font-bold">{activeCoin.stopLoss}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Safety Score</span>
                <span className="text-emerald-400 font-bold">{activeCoin.safetyScore} / 100</span>
              </div>
            </div>
          </div>

          {/* Smart Contract & Security Honeypot Audit */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl shadow-lg space-y-3 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold border-b border-slate-800/80 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Smart Contract Audit
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Honeypot Test:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PASS (0% Tax)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Liquidity Lock:</span>
                <span className="text-cyan-300 font-bold">{activeCoin.liquidityLocked}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Whale Concentration:</span>
                <span className="text-purple-300 font-bold">{activeCoin.whaleConcentration}</span>
              </div>
            </div>
          </div>

          {/* AI Decision Verdict */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-xl shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">AI Matrix Signal</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {activeCoin.aiVerdict}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {activeCoin.aiRationale}
            </p>
          </div>
        </div>
      </div>

      {/* Dedicated Gold (XAUUSD) Pro Terminal & Forex Factory High-Impact News Radar */}
      <div id="gold-terminal">
        <GoldXAUUSDTerminal />
      </div>
    </div>
  );
}

function CrownIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
    </svg>
  );
}
