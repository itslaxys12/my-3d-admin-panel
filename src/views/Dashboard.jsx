import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Bot,
  Zap,
  Radio,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Terminal,
  Layers,
  Sparkles,
  Server,
  Mic,
  Music,
  Activity,
  CheckCircle2,
  Cpu,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { KPI_METRICS, RECENT_LOGS, APP_CONFIG } from '../utils/constants';
import GlassCard from '../components/UI/GlassCard';
import AnimatedButton from '../components/UI/AnimatedButton';

export function Dashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getMetricIcon = (iconName) => {
    switch (iconName) {
      case 'Globe':
        return Globe;
      case 'Bot':
        return Bot;
      case 'Mic':
        return Mic;
      case 'ShieldCheck':
        return ShieldCheck;
      default:
        return Server;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-purple-950/40 border border-cyan-500/30 backdrop-blur-xl shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-mono">
              MATRIX ONLINE
            </span>
            <span className="text-xs text-slate-400 font-mono">Commander: {APP_CONFIG.adminName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-wide font-heading">
            {APP_CONFIG.appName} <span className="gradient-text-cyber">Command Center</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Real-time High-Security Discord Bot orchestration, crystal-clear 192kbps audio streaming, and cyber defense telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            icon={RefreshCw}
            className={isRefreshing ? 'animate-spin' : ''}
          >
            Sync Matrix
          </AnimatedButton>
          <AnimatedButton
            variant="primary"
            size="sm"
            triggerConfetti={true}
            icon={Sparkles}
          >
            Deploy Shaders
          </AnimatedButton>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {KPI_METRICS.map((metric, idx) => {
          const Icon = getMetricIcon(metric.icon);
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
            >
              <GlassCard
                glowColor={metric.color}
                tiltEffect={true}
                className="relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{metric.title}</span>
                  <div
                    className={`p-2 rounded-xl ${
                      metric.color === 'cyan'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                        : metric.color === 'purple'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : metric.color === 'pink'
                        ? 'bg-pink-500/10 text-pink-400 border border-pink-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <h3 className="text-2xl font-bold text-slate-100 font-mono tracking-tight">{metric.value}</h3>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{metric.change}</span>
                  </div>
                </div>

                {/* Micro sparkline decorative line */}
                <div className="w-full h-1 bg-slate-800 rounded-full mt-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      metric.color === 'cyan'
                        ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff] w-3/4'
                        : metric.color === 'purple'
                        ? 'bg-purple-400 shadow-[0_0_8px_#a855f7] w-4/5'
                        : metric.color === 'pink'
                        ? 'bg-pink-400 shadow-[0_0_8px_#ff007f] w-2/3'
                        : 'bg-emerald-400 shadow-[0_0_8px_#00ff9d] w-5/6'
                    }`}
                  />
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Main Bot Subsystem & Telemetry Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Security Bot Hub & Instant Audio Streamer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-100 font-heading">
                High-Security Discord Bot Gateway & Live Audio Telemetry
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              ● Gateway Connected (14ms)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bot Core Status Card */}
            <GlassCard
              title="Autonomous Discord Core"
              subtitle="Active Process & Engine Health"
              icon={Cpu}
              glowColor="emerald"
            >
              <div className="space-y-3 pt-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Script:</span>
                  <span className="text-emerald-300 font-bold">high_security_discord_bot.py</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Engine PID:</span>
                  <span className="text-cyan-300 font-bold">Active Daemon</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Security Mode:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    SHIELD ON
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Toxic Auto-Ban:</span>
                  <span className="text-rose-400 font-bold">Instant Triple-Filter</span>
                </div>
              </div>
            </GlassCard>

            {/* Instant Audio Streamer Card */}
            <GlassCard
              title="Voice Streamer & Music Engine"
              subtitle="192kbps Zero-Lag YouTube Streamer"
              icon={Music}
              glowColor="cyan"
            >
              <div className="space-y-3 pt-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Default Track:</span>
                  <span className="text-cyan-300 font-bold truncate max-w-[130px]">Love Me Not</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Playback Speed:</span>
                  <span className="text-emerald-300 font-bold">0.01s Instant Play</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Voice Quality:</span>
                  <span className="text-purple-300 font-bold">192kbps Crystal PCM</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Voice Commands:</span>
                  <span className="text-amber-300 font-bold">!song, !play, !stop</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Real-Time Defense & Whitelist Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-cyan-950/30 border border-emerald-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-200 font-bold">Automated Server Defense Active</div>
                <div className="text-[11px] text-slate-400">
                  Whitelist, Auto-Role, Anti-Raid & Toxic Language Shields live on Discord gateway
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                !whitelist
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-400/30 font-bold">
                !testban
              </span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Bot Live Network Telemetry */}
        <div className="space-y-4 flex flex-col justify-between">
          <GlassCard
            title="Bot & Network Telemetry"
            subtitle="Live spatial micro-cluster"
            glowColor="purple"
            className="flex-1 flex flex-col justify-between"
          >
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-300">Discord Gateway Ping</span>
                </div>
                <span className="text-cyan-300 font-bold">14ms</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">Auto-Defense Engine</span>
                </div>
                <span className="text-emerald-400 font-bold">Armored</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">Whitelisted Members</span>
                </div>
                <span className="text-purple-300 font-bold">Protected</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-300">Audio Cache Speed</span>
                </div>
                <span className="text-cyan-400 font-bold">Instant (0ms)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Cluster State: Healthy</span>
              <span className="text-emerald-400 font-bold">100% Uptime</span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Recent Event Logs & System Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs Table */}
        <div className="lg:col-span-2">
          <GlassCard
            title="Real-Time Telemetry & Bot Logs"
            subtitle="Live event bus streaming from distributed WebGL nodes, Discord & Telegram"
            icon={Terminal}
            glowColor="default"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-medium">TIMESTAMP</th>
                    <th className="pb-3 font-medium">EVENT DESCRIPTION</th>
                    <th className="pb-3 font-medium">SUBSYSTEM</th>
                    <th className="pb-3 font-medium text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {RECENT_LOGS.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 text-slate-500">{log.time}</td>
                      <td className="py-2.5 font-medium text-slate-200">{log.event}</td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 text-[10px]">
                          {log.tag}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === 'success'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : log.status === 'warning'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Quick Operations Panel */}
        <div>
          <GlassCard
            title="Subsystem Controls"
            subtitle="Direct GPU pipeline and Bot triggers"
            icon={Bot}
            glowColor="pink"
          >
            <div className="space-y-3">
              <AnimatedButton
                variant="secondary"
                size="md"
                className="w-full justify-between"
                icon={RefreshCw}
                onClick={handleRefresh}
              >
                Sync Bot Gateway
              </AnimatedButton>

              <AnimatedButton
                variant="secondary"
                size="md"
                className="w-full justify-between"
                icon={Radio}
              >
                Ping Discord & TG
              </AnimatedButton>

              <AnimatedButton
                variant="purple"
                size="md"
                triggerConfetti={true}
                className="w-full justify-between"
                icon={Sparkles}
              >
                Trigger Security Audit
              </AnimatedButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
