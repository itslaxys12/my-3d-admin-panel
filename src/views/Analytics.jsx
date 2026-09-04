import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  Globe,
  Zap,
  BarChart3,
  Layers,
  Cpu,
  Clock,
  Radio,
} from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import AnimatedButton from '../components/UI/AnimatedButton';
import FloatingElements from '../components/3d/FloatingElements';

export function Analytics() {
  const [timeRange, setTimeRange] = useState('24h');

  const performanceBars = [
    { label: '00:00', drawCalls: 140, fps: 60, vram: 45 },
    { label: '04:00', drawCalls: 190, fps: 58, vram: 55 },
    { label: '08:00', drawCalls: 320, fps: 57, vram: 72 },
    { label: '12:00', drawCalls: 480, fps: 54, vram: 84 },
    { label: '16:00', drawCalls: 390, fps: 59, vram: 70 },
    { label: '20:00', drawCalls: 280, fps: 60, vram: 60 },
  ];

  const serverRegions = [
    { name: 'North America (US-East)', ping: '12ms', load: '64%', status: 'Optimal', color: 'cyan' },
    { name: 'Europe Central (Frankfurt)', ping: '24ms', load: '48%', status: 'Optimal', color: 'purple' },
    { name: 'Asia Pacific (Tokyo)', ping: '38ms', load: '79%', status: 'High Traffic', color: 'pink' },
    { name: 'South America (São Paulo)', ping: '65ms', load: '32%', status: 'Nominal', color: 'green' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-heading">3D Engine & Telemetry Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time pipeline diagnostics, draw call benchmarks, and global latency</p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          {['1h', '24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Draw Calls and Framerate Timeline Chart */}
        <div className="lg:col-span-2">
          <GlassCard
            title="WebGL Draw Calls & Framerate Stability"
            subtitle="Real-time rendering load over selected interval"
            icon={BarChart3}
            glowColor="cyan"
          >
            <div className="pt-4 space-y-6">
              {/* Custom Bar Visualization */}
              <div className="grid grid-cols-6 gap-3 items-end h-48 pt-6 pb-2 border-b border-slate-800">
                {performanceBars.map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-full">
                      {/* Draw Calls Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(bar.drawCalls / 500) * 100}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="w-1/2 bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t shadow-[0_0_10px_rgba(0,240,255,0.3)] group-hover:brightness-125 transition-all"
                        title={`Draw calls: ${bar.drawCalls}`}
                      />
                      {/* VRAM Load Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${bar.vram}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 + 0.05 }}
                        className="w-1/2 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t shadow-[0_0_10px_rgba(168,85,247,0.3)] group-hover:brightness-125 transition-all"
                        title={`VRAM: ${bar.vram}%`}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{bar.label}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-cyan-400" />
                    <span>Draw Calls (Peak: 480)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-purple-400" />
                    <span>VRAM Usage (%)</span>
                  </div>
                </div>
                <span className="text-emerald-400 font-semibold">Stability Score: 98.4%</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Global Spatial Node Status */}
        <div>
          <GlassCard
            title="Global Edge Nodes"
            subtitle="Distributed WebGL spatial servers"
            icon={Globe}
            glowColor="purple"
          >
            <div className="space-y-3.5 pt-2">
              {serverRegions.map((region, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{region.name}</span>
                    <span className="font-mono text-cyan-400 font-bold">{region.ping}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Load: {region.load}</span>
                    <span className={region.status === 'High Traffic' ? 'text-amber-400' : 'text-emerald-400'}>
                      {region.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Pipeline Metrics Triple Column */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <GlassCard glowColor="cyan" title="Vertex Buffer Throughput" icon={Zap}>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-slate-100">4.2M</span>
            <span className="text-xs text-slate-400 ml-2">vertices/sec</span>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +18% throughput efficiency
            </p>
          </div>
        </GlassCard>

        <GlassCard glowColor="purple" title="Shader Compile Latency" icon={Clock}>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-slate-100">0.84ms</span>
            <span className="text-xs text-slate-400 ml-2">per pipeline</span>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Zero dropped frames
            </p>
          </div>
        </GlassCard>

        <GlassCard glowColor="pink" title="Concurrent 3D Viewers" icon={Radio}>
          <div className="mt-2">
            <span className="text-3xl font-bold font-mono text-slate-100">12,480</span>
            <span className="text-xs text-slate-400 ml-2">active sessions</span>
            <p className="text-xs text-purple-400 mt-2 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> 99.98% stream delivery
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default Analytics;
