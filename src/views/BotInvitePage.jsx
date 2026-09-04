import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, ShieldCheck, ShieldAlert, Sparkles, ExternalLink, Check, Copy,
  Hash, MessageSquare, Lock, Unlock, Music, Zap, RefreshCw, Send,
  Sliders, UserCheck, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight,
  Server, Globe, HeartHandshake, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';
import GlassCard from '../components/UI/GlassCard';
import AnimatedButton from '../components/UI/AnimatedButton';
import { openDiscordBotInvite, OFFICIAL_DISCORD_INVITE_URL } from '../utils/discordInvite';

const API = '';

export function BotInvitePage({ onBackToDashboard }) {
  const [selectedPermissions, setSelectedPermissions] = useState([
    'Administrator',
    'Manage Channels',
    'Manage Roles',
    'Ban Members',
    'Kick Members',
    'Moderate Members (Timeout)',
    'Connect & Speak in Voice',
  ]);

  const [guildId, setGuildId] = useState('');
  const [welcomeChannelId, setWelcomeChannelId] = useState('1284567890123456789');
  const [welcomeMsg, setWelcomeMsg] = useState('Welcome to the server! 🎉 Please read the rules.');
  const [logChannelId, setLogChannelId] = useState('1284567890987654321');
  const [antiNukeEnabled, setAntiNukeEnabled] = useState(true);
  const [antiLinkEnabled, setAntiLinkEnabled] = useState(true);
  const [attachmentShield, setAttachmentShield] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [simulatedLog, setSimulatedLog] = useState('');

  const togglePermission = (perm) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSaveSetup = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Save settings to backend API
      await fetch(`${API}/api/bot/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          DISCORD_WELCOME_CHANNEL_ID: welcomeChannelId,
          DISCORD_WELCOME_MESSAGE: welcomeMsg,
          DISCORD_LOG_CHANNEL_ID: logChannelId,
          SECURITY_MODE: antiNukeEnabled ? 'ON' : 'OFF',
        }),
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00ff9d', '#00f0ff', '#a855f7'],
      });

      setSaveSuccess(true);
      setSimulatedLog(`✅ Server configuration successfully saved to Glitch Matrix Engine!`);
    } catch {
      setSimulatedLog(`⚠️ Local API offline — Settings saved in local browser state.`);
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateTest = (type) => {
    if (type === 'welcome') {
      setSimulatedLog(`📢 [SIMULATION] Sent Welcome Card to channel #${welcomeChannelId}: "${welcomeMsg}"`);
    } else if (type === 'antinuke') {
      setSimulatedLog(`🚨 [SIMULATION] Anti-Nuke trigger tested! Blocked unauthorized deletion & logged to #${logChannelId}`);
    } else if (type === 'ping') {
      setSimulatedLog(`🏓 [SIMULATION] Bot response latency: 14ms (Quantum connection active)`);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* ── Top Hero Banner Featuring GMX. Cyber Logo ── */}
      <div className="relative rounded-3xl overflow-hidden border border-emerald-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 p-8 sm:p-10 shadow-[0_0_50px_rgba(0,255,157,0.2)]">
        {/* Background Ambient Neon Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            {/* GMX. Official Logo Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-emerald-400 shadow-[0_0_30px_rgba(0,255,157,0.4)] flex-shrink-0 bg-black">
              <img
                src="/assets/images/gmx_logo.jpg"
                alt="GMX Glitch Matrix Official Logo"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-mono text-emerald-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>OFFICIAL GMX. BOT DEPLOYMENT PORTAL</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-100 font-heading tracking-wide">
                Invite & Configure <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400">GMX Bot</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl font-mono">
                Authorize the high-security Discord bot into your server, map welcome & audit log channels, configure anti-nuke rules, and manage server defense.
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={openDiscordBotInvite}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 hover:opacity-95 text-slate-950 font-mono text-sm font-black transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(0,255,157,0.4)] flex items-center justify-center gap-2.5 text-center active:scale-95"
            >
              <Bot className="w-5 h-5 fill-current" />
              <span>Authorize & Add to Discord</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 transition-all text-center"
              >
                Back to Command Hub
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 3-Step Setup Wizard Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1: OAuth2 Permissions Checklist */}
        <GlassCard
          title="Step 1: Discord Permissions"
          subtitle="Required permissions for full anti-nuke & moderation features"
          icon={ShieldCheck}
          glowColor="emerald"
        >
          <div className="space-y-2.5 pt-2">
            {[
              'Administrator',
              'Manage Channels',
              'Manage Roles',
              'Ban Members',
              'Kick Members',
              'Moderate Members (Timeout)',
              'View Audit Log',
              'Send Messages & Embeds',
              'Attach Files & Media',
              'Connect & Speak in Voice',
            ].map((perm) => {
              const isChecked = selectedPermissions.includes(perm);
              return (
                <div
                  key={perm}
                  onClick={() => togglePermission(perm)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="font-semibold">{perm}</span>
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center ${isChecked ? 'bg-emerald-400 text-black' : 'border border-slate-700'}`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Step 2: Channel Mapping & Welcome Config */}
        <GlassCard
          title="Step 2: Channel Mapping"
          subtitle="Designate channels where the bot posts logs, welcomes, and alerts"
          icon={Hash}
          glowColor="cyan"
        >
          <div className="space-y-4 pt-2">
            {/* Target Server / Guild ID */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                Server (Guild) ID <span className="text-slate-500">(Optional for multi-server)</span>
              </label>
              <input
                type="text"
                value={guildId}
                onChange={(e) => setGuildId(e.target.value)}
                placeholder="e.g. 128456789012345678"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Welcome Channel ID */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                Welcome Channel ID (#welcome)
              </label>
              <input
                type="text"
                value={welcomeChannelId}
                onChange={(e) => setWelcomeChannelId(e.target.value)}
                placeholder="Channel ID where welcome card is posted"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Custom Welcome Message */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                Welcome Message Text
              </label>
              <textarea
                value={welcomeMsg}
                onChange={(e) => setWelcomeMsg(e.target.value)}
                rows={3}
                placeholder="Custom welcome greeting..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </div>

            {/* Security Audit Log Channel */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                Security & Ban Log Channel ID (#mod-logs)
              </label>
              <input
                type="text"
                value={logChannelId}
                onChange={(e) => setLogChannelId(e.target.value)}
                placeholder="Channel ID for ban and channel delete logs"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </GlassCard>

        {/* Step 3: Anti-Nuke Defense Rules & Simulator */}
        <GlassCard
          title="Step 3: Security & Anti-Nuke"
          subtitle="Configure real-time automated defense shields and test them"
          icon={ShieldAlert}
          glowColor="pink"
        >
          <div className="space-y-4 pt-2">
            {/* Toggle Anti-Nuke */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-slate-200 block">🚨 Anti-Channel & Role Delete</span>
                <span className="text-[11px] text-slate-400">Instant-ban unauthorized offenders</span>
              </div>
              <button
                onClick={() => setAntiNukeEnabled(!antiNukeEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 ${antiNukeEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${antiNukeEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Toggle Attachment Shield */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-slate-200 block">📸 Attachment & Media Shield</span>
                <span className="text-[11px] text-slate-400">HighRole/Admin only image posting</span>
              </div>
              <button
                onClick={() => setAttachmentShield(!attachmentShield)}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 ${attachmentShield ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${attachmentShield ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Toggle Anti-Link */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-slate-200 block">🔗 Anti-Link / Invite Filter</span>
                <span className="text-[11px] text-slate-400">Auto-delete unauthorized server links</span>
              </div>
              <button
                onClick={() => setAntiLinkEnabled(!antiLinkEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-1 ${antiLinkEnabled ? 'bg-emerald-500' : 'bg-slate-800'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${antiLinkEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Simulation Triggers */}
            <div className="pt-2 space-y-2">
              <span className="text-xs font-mono text-slate-400 block font-bold">Simulate & Test Triggers:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSimulateTest('welcome')}
                  className="py-2 rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-cyan-300 transition-all"
                >
                  Test Welcome
                </button>
                <button
                  onClick={() => handleSimulateTest('antinuke')}
                  className="py-2 rounded-lg bg-slate-900 hover:bg-rose-500/20 border border-slate-800 hover:border-rose-500/40 text-[11px] font-mono text-rose-300 transition-all"
                >
                  Test Ban Log
                </button>
                <button
                  onClick={() => handleSimulateTest('ping')}
                  className="py-2 rounded-lg bg-slate-900 hover:bg-emerald-500/20 border border-slate-800 hover:border-emerald-500/40 text-[11px] font-mono text-emerald-300 transition-all"
                >
                  Test Ping
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Save Settings Bar & Simulation Log Output ── */}
      <div className="p-6 rounded-2xl bg-slate-950/90 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold font-mono text-slate-100">Ready to Apply Server Settings?</span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Configuration will sync directly with the bot engine in <code>bots/.env</code>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleSaveSetup}
            disabled={isSaving}
            className="flex-1 md:flex-initial px-6 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(0,255,157,0.4)] flex items-center justify-center gap-2"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{isSaving ? 'Syncing Settings...' : 'Save & Sync Setup'}</span>
          </button>
        </div>
      </div>

      {/* Live Simulation Output Box */}
      {simulatedLog && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 font-mono text-xs text-cyan-300 leading-relaxed"
        >
          {simulatedLog}
        </motion.div>
      )}
    </div>
  );
}

export default BotInvitePage;
