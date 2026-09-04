import React, { useEffect, useRef, memo } from 'react';

/**
 * TradingViewChart - Official 100% Real-Time TradingView Advanced Chart Widget
 * Streams live WebSocket ticks directly from Binance / Coinbase / Global Exchanges.
 * Provides authentic candlesticks, volume, technical indicators (RSI, MACD), and timeframes.
 */
function TradingViewChart({ symbol = 'BINANCE:BTCUSDT', height = '480px' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetInner = document.createElement('div');
    widgetInner.className = 'tradingview-widget-container__widget';
    widgetInner.style.height = '100%';
    widgetInner.style.width = '100%';
    widgetContainer.appendChild(widgetInner);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: '60',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      hide_side_toolbar: false,
      hide_legend: false,
      save_image: true,
      calendar: false,
      backgroundColor: 'rgba(5, 7, 19, 1)',
      gridColor: 'rgba(255, 255, 255, 0.05)',
      support_host: 'https://www.tradingview.com',
    });

    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#050713] shadow-2xl"
      style={{ height }}
    />
  );
}

export default memo(TradingViewChart);
