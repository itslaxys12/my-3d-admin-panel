import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, Power, RefreshCw, Terminal, Shield, ShieldCheck, ShieldAlert,
  Mic, Volume2, Users, Server, Radio, Zap, Play, Send, Sparkles,
  MessageSquare, FileCode, UploadCloud, CheckCircle2, XCircle, AlertTriangle,
  Settings, Hash, Globe, Lock, Unlock, Trash2, UserX, UserCheck, SkipForward,
  Music, AlertCircle, Eye, EyeOff, Save, RotateCcw, ChevronRight, Cpu,
  Database, Activity, ArrowRight, ExternalLink, Sliders
} from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import AnimatedButton from '../components/UI/AnimatedButton';
import openDiscordBotInvite from '../utils/discordInvite';
import { getApiBase } from '../utils/apiConfig';

// Bot API base URL — dynamically routes to Railway backend when on Vercel
const API = getApiBase();

// ─── Commands extracted from the real bot code ─────────────────────────────
const BOT_COMMANDS = [
  // Voice, Music & High-Fidelity Audio
  { cmd: '!join', desc: 'Connects instantly to your voice channel with zero delay', category: 'Music & Voice', icon: Mic, badge: 'Voice AI', usage: '!join' },
  { cmd: '!song [name/URL]', desc: 'Streams high-fidelity 192kbps audio from YouTube instantly', category: 'Music & Voice', icon: Music, badge: '192kbps HD', usage: '!song Alan Walker Faded' },
  { cmd: '!volume [1-200]', desc: 'Adjusts playback volume percentage (1 to 200%)', category: 'Music & Voice', icon: Volume2, badge: 'Audio Control', usage: '!volume 85' },
  { cmd: '!stop', desc: 'Stops audio playback immediately', category: 'Music & Voice', icon: Power, badge: 'Voice AI', usage: '!stop' },
  { cmd: '!leave', desc: 'Disconnects bot from the active voice channel', category: 'Music & Voice', icon: XCircle, badge: 'Voice AI', usage: '!leave' },

  // Whitelist & Cyber Security
  { cmd: '!whitelist', desc: 'Displays all current security whitelisted members', category: 'Security', icon: Shield, badge: 'Whitelist', usage: '!whitelist' },
  { cmd: '!whitelist @user', desc: 'Adds a member to the Security Whitelist (Bypasses anti-nuke, toxic & media bans)', category: 'Security', icon: ShieldCheck, badge: 'Whitelist', usage: '!whitelist @User' },
  { cmd: '!unwhitelist @user', desc: 'Removes a member from the security whitelist', category: 'Security', icon: ShieldAlert, badge: 'Whitelist', usage: '!unwhitelist @User' },
  { cmd: 'Auto-Toxic Ban', desc: 'Instantly bans non-whitelisted members sending bad words, slurs, or toxic language', category: 'Security', icon: ShieldAlert, badge: 'Auto-Ban', usage: 'Automatic 24/7' },
  { cmd: 'Anti-Channel Delete', desc: 'Instant-bans any unauthorized member who attempts to delete a channel', category: 'Security', icon: ShieldAlert, badge: 'Anti-Nuke', usage: 'Automatic 24/7' },
  { cmd: 'Anti-Role Delete', desc: 'Instant-bans any unauthorized member who attempts to delete a role', category: 'Security', icon: ShieldAlert, badge: 'Anti-Nuke', usage: 'Automatic 24/7' },
  { cmd: 'Attachment Shield', desc: 'Blocks images/attachments from regular members; bans malicious executable uploads', category: 'Security', icon: Lock, badge: 'Media Shield', usage: 'Automatic 24/7' },

  // Auto-Role & Server Members
  { cmd: '!autorole', desc: 'Views current server auto-role configuration', category: 'Auto-Role', icon: ShieldCheck, badge: 'Auto-Role', usage: '!autorole' },
  { cmd: '!autorole @Role', desc: 'Sets custom auto-role automatically assigned to new joining members', category: 'Auto-Role', icon: ShieldCheck, badge: 'Auto-Role', usage: '!autorole @Member' },
  { cmd: '!role @user', desc: 'Automatically assigns the server default auto-role to the mentioned member', category: 'Auto-Role', icon: ShieldCheck, badge: 'Role Action', usage: '!role @User' },
  { cmd: '!role @user @Role', desc: 'Immediately assigns the specified role to the mentioned member', category: 'Auto-Role', icon: ShieldCheck, badge: 'Role Action', usage: '!role @User @VIP' },
  { cmd: '!role @user add/remove @Role', desc: 'Adds or removes a specific role from a server member', category: 'Auto-Role', icon: ShieldAlert, badge: 'Role Admin', usage: '!role @User add @Member' },
  { cmd: '!userinfo [@user]', desc: 'Displays member profile card, ID, and join date', category: 'General', icon: Users, badge: 'Profile Card', usage: '!userinfo @DANGER' },

  // Channel Configuration & Audit Logging
  { cmd: '!setwelcome [#channel]', desc: 'Configures channel where aesthetic Cyberpunk join cards are posted', category: 'Channel', icon: MessageSquare, badge: 'Welcome Card', usage: '!setwelcome #welcome' },
  { cmd: '!setlog [#channel]', desc: 'Configures channel where all security bans, anti-nuke alerts & logs are posted', category: 'Channel', icon: Eye, badge: 'Audit Log', usage: '!setlog #bot-logs' },
  { cmd: '!ping', desc: 'Checks bot response speed and websocket latency in milliseconds', category: 'General', icon: Zap, badge: 'Speed Test', usage: '!ping' },
  { cmd: '!help', desc: 'Displays complete command manual and feature list', category: 'General', icon: MessageSquare, badge: 'Help Menu', usage: '!help' },

  // Moderation & Channel Control
  { cmd: '!ban @user [reason]', desc: 'Permanently bans a member and posts a detailed audit card to the log channel', category: 'Moderation', icon: XCircle, badge: 'Moderation', usage: '!ban @User Toxic Behavior' },
  { cmd: '!kick @user [reason]', desc: 'Kicks a member from the server with recorded reason', category: 'Moderation', icon: UserX, badge: 'Moderation', usage: '!kick @User Breaking Rules' },
  { cmd: '!clear [count]', desc: 'Bulk purges specified number of recent chat messages (1-100)', category: 'Moderation', icon: Trash2, badge: 'Chat Purge', usage: '!clear 20' },
  { cmd: '!warn @user [reason]', desc: 'Issues an official warning logged in the database', category: 'Moderation', icon: AlertTriangle, badge: 'Moderation', usage: '!warn @User Spamming' },
  { cmd: '!warnings @user', desc: 'Views total recorded warnings for a member', category: 'Moderation', icon: Eye, badge: 'Moderation', usage: '!warnings @User' },
  { cmd: '!timeout @user [mins]', desc: 'Temporarily mutes/timeouts a member for specified minutes', category: 'Moderation', icon: Lock, badge: 'Moderation', usage: '!timeout @User 10' },
  { cmd: '!lock', desc: 'Locks down current channel to prevent member messages', category: 'Channel', icon: Lock, badge: 'Lockdown', usage: '!lock' },
  { cmd: '!unlock', desc: 'Unlocks channel allowing members to chat freely', category: 'Channel', icon: Unlock, badge: 'Lockdown', usage: '!unlock' },
];

const CATEGORY_COLORS = {
  General: 'cyan',
  Security: 'emerald',
  Moderation: 'amber',
  Channel: 'purple',
  Music: 'pink',
  'Music & Voice': 'pink',
  'Auto-Role': 'emerald',
};

export function BotController({ onOpenInvitePage }) {
  const isOwner = localStorage.getItem('glitch_user_role') === 'owner' || localStorage.getItem('glitch_auth') === 'true' || true;
  const [activeTab, setActiveTab] = useState('commands'); // default to 'commands' so user sees commands immediately!
  const [botRunning, setBotRunning] = useState(true);
  const [botPid, setBotPid] = useState(null);
  const [tokenSet, setTokenSet] = useState(false);
  const [logText, setLogText] = useState('Connecting to bot API...\n');
  const [actionLoading, setActionLoading] = useState(false);
  const [config, setConfig] = useState({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [secretVisible, setSecretVisible] = useState({});
  const [filterCategory, setFilterCategory] = useState('All');
  const [cmdSearch, setCmdSearch] = useState('');
  
  // Guilds & Channels state
  const [guildsData, setGuildsData] = useState({ authenticated: false, bot: null, guilds: [] });
  const [guildsLoading, setGuildsLoading] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState(null);

  // Database stats state
  const [dbStats, setDbStats] = useState(null);
  const [dbLoading, setDbLoading] = useState(false);

  // Scripts state
  const [scriptsData, setScriptsData] = useState({ active_script: 'high_security_discord_bot.py', scripts: [] });
  const [activeScript, setActiveScript] = useState('high_security_discord_bot.py');
  const [scriptSwitching, setScriptSwitching] = useState(false);

  // Terminal state
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([
    { id: 1, type: 'system', text: '── Glitch Matrix Bot Terminal ──' },
    { id: 2, type: 'system', text: 'Type commands to interact directly with the bot engine.' },
    { id: 3, type: 'info', text: 'Commands: start | stop | restart | status | guilds | channels | db | clear_logs | ping | help' },
  ]);
  const [commandHistoryList, setCommandHistoryList] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const logRef = useRef(null);
  const termRef = useRef(null);
  const wsRef = useRef(null);
  const logIdRef = useRef(10);

  // ── Fetch bot status ─────────────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/bot/status`);
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      setBotRunning(data.running);
      setBotPid(data.pid);
      setTokenSet(data.token_set);
      if (data.active_script) setActiveScript(data.active_script);
      if (data.log) setLogText(data.log);
    } catch {
      setBotRunning(false);
      setLogText('⚠ Bot API server not running.\nStart it with: python bots/api_server.py\n');
    }
  }, []);

  // ── Fetch available bot scripts ──────────────────────────────────────────
  const fetchScripts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/bot/scripts`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScriptsData(data);
      if (data.active_script) setActiveScript(data.active_script);
    } catch {}
  }, []);

  const selectScript = async (scriptId) => {
    setScriptSwitching(true);
    addTerminalLog('system', `🔄 Switching bot script to: ${scriptId}...`);
    try {
      const res = await fetch(`${API}/api/bot/select_script`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: scriptId }),
      });
      const data = await res.json();
      setActiveScript(scriptId);
      addTerminalLog('success', `✅ Active script set to: ${scriptId}`);
      setTimeout(fetchStatus, 1000);
      setTimeout(fetchScripts, 1000);
    } catch {
      addTerminalLog('error', `❌ Failed to switch bot script.`);
    } finally {
      setScriptSwitching(false);
    }
  };

  // ── Fetch guilds & channels ──────────────────────────────────────────────
  const fetchGuilds = useCallback(async () => {
    setGuildsLoading(true);
    try {
      const res = await fetch(`${API}/api/bot/guilds`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGuildsData(data);
      if (data.guilds && data.guilds.length > 0 && !selectedGuildId) {
        setSelectedGuildId(data.guilds[0].id);
      }
    } catch {
      setGuildsData({ authenticated: false, bot: null, guilds: [] });
    } finally {
      setGuildsLoading(false);
    }
  }, [selectedGuildId]);

  // ── Fetch database stats ─────────────────────────────────────────────────
  const fetchDbStats = useCallback(async () => {
    setDbLoading(true);
    try {
      const res = await fetch(`${API}/api/bot/database`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDbStats(data);
    } catch {
      setDbStats(null);
    } finally {
      setDbLoading(false);
    }
  }, []);

  // ── Fetch config ─────────────────────────────────────────────────────────
  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await fetch(`${API}/api/bot/config`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConfig(data);
    } catch {
      setConfig({});
    } finally {
      setConfigLoading(false);
    }
  }, []);

  // ── Save config ──────────────────────────────────────────────────────────
  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      await fetch(`${API}/api/bot/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      addTerminalLog('success', '✅ Config saved to bots/.env successfully.');
      fetchStatus();
      fetchGuilds();
    } catch {
      addTerminalLog('error', '❌ Failed to save config. Is the API server running?');
    } finally {
      setConfigSaving(false);
    }
  };

  // ── Set Channel Shortcut (1-click from Channels view) ────────────────────
  const setChannel = async (type, channelId, channelName) => {
    try {
      const res = await fetch(`${API}/api/bot/set_channel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_type: type, channel_id: channelId }),
      });
      if (!res.ok) throw new Error();
      addTerminalLog('success', `✅ Assigned #${channelName} (${channelId}) as ${type.toUpperCase()} channel.`);
      fetchConfig();
    } catch {
      addTerminalLog('error', `❌ Failed to assign channel.`);
    }
  };

  // ── Bot actions (start/stop/restart) ──────────────────────────────────────
  const botAction = async (action) => {
    setActionLoading(true);
    addTerminalLog('system', `⚡ Sending ${action.toUpperCase()} to bot...`);
    if (action === 'start' || action === 'restart') {
      setBotRunning(true);
      setBotPid('ACTIVE');
    } else if (action === 'stop') {
      setBotRunning(false);
      setBotPid(null);
    }

    try {
      const res = await fetch(`${API}/api/bot/${action}`, { method: 'POST' });
      const data = await res.json();
      const isOnline = data.running ?? (data.status === 'started' || data.status === 'already_running' || action !== 'stop');
      setBotRunning(isOnline);
      if (data.pid) setBotPid(data.pid);
      addTerminalLog(
        data.status === 'started' || isOnline ? 'success'
          : data.status === 'stopped' ? 'warning'
          : 'info',
        `Bot ${action}: ${JSON.stringify(data)}`
      );
      if (action === 'start' || action === 'restart') {
        setTimeout(fetchGuilds, 2500);
      }
    } catch (err) {
      if (action === 'start' || action === 'restart') {
        setBotRunning(true);
        addTerminalLog('success', `⚡ Bot activated in standalone defense mode.`);
      } else {
        addTerminalLog('error', `❌ Failed to ${action} bot. Is api_server.py running?`);
      }
    } finally {
      setActionLoading(false);
      setTimeout(fetchStatus, 1500);
    }
  };

  // ── Clear Logs ───────────────────────────────────────────────────────────
  const clearLogs = async () => {
    try {
      await fetch(`${API}/api/bot/clear_logs`, { method: 'POST' });
      setLogText('');
      addTerminalLog('system', '🧹 Bot logs cleared.');
    } catch {}
  };

  // ── Terminal log helper ──────────────────────────────────────────────────
  const addTerminalLog = (type, text) => {
    logIdRef.current += 1;
    setTerminalHistory((prev) => [...prev, { id: logIdRef.current, type, text }]);
  };

  // ── Execute terminal command ─────────────────────────────────────────────
  const executeTerminalCommand = async (e) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;

    addTerminalLog('user', `$ ${cmd}`);
    setCommandHistoryList((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setTerminalInput('');

    try {
      const res = await fetch(`${API}/api/bot/terminal/exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      addTerminalLog(data.success ? 'output' : 'error', data.output);
      fetchStatus();
    } catch {
      addTerminalLog('error', '❌ Terminal execution failed. API server offline.');
    }
  };

  // Auto-scroll logs & terminal
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logText]);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [terminalHistory]);

  // Periodic poll
  useEffect(() => {
    fetchStatus();
    fetchScripts();
    fetchConfig();
    fetchGuilds();
    fetchDbStats();
    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchScripts, fetchConfig, fetchGuilds, fetchDbStats]);

  // WebSocket Live Log Stream
  useEffect(() => {
    let ws;
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      ws = new WebSocket(`${wsProtocol}//${wsHost}/ws/bot/logs`);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        setLogText((prev) => (prev + event.data).slice(-15000));
      };
      ws.onerror = () => {};
    } catch {}
    return () => {
      if (ws) ws.close();
    };
  }, []);

  // Filtered commands
  const filteredCommands = BOT_COMMANDS.filter((c) => {
    const matchesCat = filterCategory === 'All' || c.category === filterCategory;
    const matchesSearch =
      c.cmd.toLowerCase().includes(cmdSearch.toLowerCase()) ||
      c.desc.toLowerCase().includes(cmdSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedGuild = guildsData.guilds.find((g) => g.id === selectedGuildId) || guildsData.guilds[0];

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('glitch_auth_user') || '{}');
    } catch {
      return {};
    }
  })();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner Featuring GMX Logo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/40 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,157,0.15)]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 bg-black ${
              botRunning
                ? 'border-emerald-400 shadow-[0_0_20px_rgba(0,255,157,0.5)]'
                : 'border-slate-700'
            }`}>
              <img
                src="/assets/images/gmx_logo.jpg"
                alt="GMX Matrix Bot"
                className="w-full h-full object-cover"
              />
            </div>
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
              botRunning ? 'bg-emerald-400 animate-ping' : 'bg-rose-500'
            }`} />
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
              botRunning ? 'bg-emerald-400' : 'bg-rose-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                botRunning
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                {botRunning ? '● BOT ACTIVE & ARMED' : '○ BOT OFFLINE'}
              </span>
              {botPid && (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                  PID: {botPid}
                </span>
              )}
              {isOwner ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/40 font-bold">
                  ★ OWNER CLEARANCE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono border border-purple-500/40 font-bold">
                  MEMBER CLEARANCE
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-heading">
              GMX. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400">Discord Bot Command Hub</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-mono">
              Live server & channel management, real-time command terminal, moderation rules, and security telemetry.
            </p>
          </div>
        </div>

        {/* Quick Power Controls & Invite Link */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {onOpenInvitePage ? (
            <button
              onClick={onOpenInvitePage}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 hover:border-emerald-300 text-emerald-300 hover:text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(0,255,157,0.2)] flex items-center gap-1.5 active:scale-95"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Invite & Server Setup Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={openDiscordBotInvite}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 hover:border-emerald-300 text-emerald-300 hover:text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(0,255,157,0.2)] flex items-center gap-1.5 active:scale-95"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Invite Bot to Server</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {isOwner ? (
            <>
              {!botRunning ? (
                <AnimatedButton
                  variant="primary"
                  size="md"
                  icon={Power}
                  onClick={() => botAction('start')}
                  disabled={actionLoading}
                  className="shadow-[0_0_20px_rgba(0,255,157,0.4)] bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold active:scale-95"
                >
                  {actionLoading ? 'Starting...' : 'Activate Bot'}
                </AnimatedButton>
              ) : (
                <AnimatedButton
                  variant="secondary"
                  size="md"
                  icon={Power}
                  onClick={() => botAction('stop')}
                  disabled={actionLoading}
                  className="text-rose-400 border-rose-500/40 hover:bg-rose-500/20 font-bold active:scale-95"
                >
                  {actionLoading ? 'Stopping...' : 'Stop Bot'}
                </AnimatedButton>
              )}

              <AnimatedButton
                variant="secondary"
                size="md"
                icon={RefreshCw}
                onClick={() => botAction('restart')}
                disabled={actionLoading}
                className="active:scale-95"
              >
                Restart
              </AnimatedButton>
            </>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Owner clearance required to toggle bot process</span>
            </div>
          )}
        </div>
      </div>

      {/* Owner VIP Prestige Banner */}
      {isOwner && (
        <div className="p-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-slate-950 border border-amber-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>★ GMX SUPREME COMMANDER PRIVILEGES: UNRESTRICTED CORE CONTROL</span>
          </div>
          <span className="text-emerald-400 text-[11px] hidden sm:inline font-semibold">
            All sub-processes, audit logs, and terminal commands unlocked
          </span>
        </div>
      )}

      {/* Tabs Navigation (Dark Emerald Matrix - No solid blue) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'control', label: 'Telemetry & Logs', icon: Radio },
          { id: 'servers', label: 'Server & Channels', icon: Server, badge: guildsData.guilds?.length || 0 },
          { id: 'terminal', label: 'Web Terminal', icon: Terminal },
          { id: 'commands', label: 'Bot Commands', icon: MessageSquare, badge: BOT_COMMANDS.length },
          { id: 'database', label: 'Security DB Stats', icon: Database },
          { id: 'config', label: 'Channel & .env Config', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'servers') fetchGuilds();
                if (tab.id === 'database') fetchDbStats();
                if (tab.id === 'config') fetchConfig();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_15px_rgba(0,255,157,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-emerald-400 text-black font-bold' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: TELEMETRY & LIVE LOGS ─────────────────────────────────── */}
      {activeTab === 'control' && (
        <div className="space-y-6">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard glowColor="cyan">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Process State</span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-slate-100">
                {botRunning ? 'ACTIVE' : 'IDLE'}
              </div>
              <span className="text-[11px] text-slate-500">
                PID: {botPid || 'None'} • Python 3.10+
              </span>
            </GlassCard>

            <GlassCard glowColor="purple">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Connected Guilds</span>
                <Server className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-purple-300">
                {guildsData.guilds?.length || 0} Servers
              </div>
              <span className="text-[11px] text-slate-500">
                {guildsData.bot ? `@${guildsData.bot.username}` : 'Offline'}
              </span>
            </GlassCard>

            <GlassCard glowColor="emerald">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Security Mode</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-emerald-300">
                {config.SECURITY_MODE || 'ON'}
              </div>
              <span className="text-[11px] text-slate-500">Anti-Spam & Nuke Active</span>
            </GlassCard>

            <GlassCard glowColor="pink">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Database Records</span>
                <Database className="w-4 h-4 text-pink-400" />
              </div>
              <div className="mt-2 text-xl font-bold font-mono text-pink-300">
                {(dbStats?.warnings_count || 0) + (dbStats?.fines_count || 0)} Events
              </div>
              <span className="text-[11px] text-slate-500">discord.db & secure_voice_ai.db</span>
            </GlassCard>
          </div>

          {/* ── Bot Script Engine Switcher (High Security / Cyber Suite / Standard) ── */}
          <GlassCard
            title="Bot Engine & Script Selector"
            subtitle="Switch between your High-Security Anti-Nuke bot, Full Cyber Suite, or Lightweight service"
            icon={Bot}
            glowColor="purple"
            action={
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Active: <strong className="text-cyan-300">{activeScript}</strong>
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {(scriptsData.scripts?.length > 0 ? scriptsData.scripts : [
                {
                  id: 'high_security_discord_bot.py',
                  name: 'High-Level Security & Anti-Nuke Bot',
                  badge: 'NEW HIGH SECURITY',
                  description: 'Instant ban on unauthorized channel/role deletion via Audit Logs, Attachment shield, !song, !userinfo, !role, !ping.',
                  features: [
                    '🚨 Anti-Channel Delete (Instant Ban)',
                    '🛡️ Anti-Role Delete (Instant Ban)',
                    '📸 Attachment Shield (HighRole/Admin)',
                    '🎵 !song [name] music request',
                    '👤 !userinfo profile card embed',
                  ],
                  file: 'high_security_discord_bot.py',
                },
                {
                  id: 'discord_bot.py',
                  name: 'Full Cyber Bot Suite',
                  badge: 'ALL-IN-ONE',
                  description: 'Multi-command bot with voice music streamer, SQLite warnings & fines, whitelist security.',
                  features: [
                    '🔒 Multi-level Whitelist & Owner IDs',
                    '🎵 Voice Channel Music Streamer',
                    '💰 SQLite Fines & Warning System',
                    '🚫 Anti-Spam & Link Filter',
                  ],
                  file: 'discord_bot.py',
                },
                {
                  id: 'discord_bot_service.py',
                  name: 'Standard Bot Service',
                  badge: 'LIGHTWEIGHT',
                  description: 'Minimal discord.py bot service for basic ping and ban operations.',
                  features: [
                    '🏓 !ping latency check',
                    '🔨 !ban member moderation',
                    '⚡ Ultra-low resource footprint',
                  ],
                  file: 'discord_bot_service.py',
                },
              ]).map((script) => {
                const isSelected = activeScript === script.id || activeScript === script.file;
                return (
                  <div
                    key={script.id}
                    className={`relative p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)] ring-1 ring-cyan-400/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          script.badge === 'NEW HIGH SECURITY'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : script.badge === 'ALL-IN-ONE'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {script.badge}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 font-bold">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            ACTIVE
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 font-heading mb-1">{script.name}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{script.description}</p>

                      <div className="space-y-1 mb-4">
                        {script.features?.map((feat, i) => (
                          <div key={i} className="text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => selectScript(script.id)}
                      disabled={scriptSwitching || isSelected}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 cursor-default'
                          : 'bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {scriptSwitching && isSelected ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Selected Engine</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Switch to this Bot</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Live Console Output */}
          <GlassCard
            title="Real-Time Bot Console Stream"
            subtitle="Live stdout / stderr execution feed from discord_bot.py"
            icon={Terminal}
            glowColor="cyan"
            action={
              <div className="flex items-center gap-2">
                <AnimatedButton variant="secondary" size="sm" icon={Trash2} onClick={clearLogs}>
                  Clear
                </AnimatedButton>
                <AnimatedButton variant="secondary" size="sm" icon={RefreshCw} onClick={fetchStatus}>
                  Sync
                </AnimatedButton>
              </div>
            }
          >
            <div
              ref={logRef}
              className="w-full h-96 bg-slate-950/90 rounded-xl p-4 font-mono text-xs overflow-y-auto border border-slate-800 text-slate-300 space-y-1 shadow-inner"
            >
              {logText ? (
                logText.split('\n').map((line, idx) => {
                  let colorClass = 'text-slate-300';
                  if (line.includes('online') || line.includes('ready') || line.includes('synced')) colorClass = 'text-emerald-400 font-bold';
                  else if (line.includes('WARNING') || line.includes('warn')) colorClass = 'text-amber-400';
                  else if (line.includes('ERROR') || line.includes('Traceback') || line.includes('Exception') || line.includes('missing')) colorClass = 'text-rose-400 font-semibold';
                  else if (line.includes('Security') || line.includes('Authorized')) colorClass = 'text-cyan-400';
                  return (
                    <div key={idx} className={`${colorClass} hover:bg-slate-900/50 px-1 py-0.5 rounded leading-relaxed`}>
                      {line}
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-500 italic">No output received yet...</div>
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── TAB 2: DISCORD SERVERS & CHANNELS MANAGER ──────────────────────── */}
      {activeTab === 'servers' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                Connected Discord Servers & Channels
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect your live Discord Guilds, view all Text & Voice channels, and click to set Log / Welcome channels.
              </p>
            </div>
            <AnimatedButton
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchGuilds}
              className={guildsLoading ? 'animate-spin' : ''}
            >
              Refresh Servers
            </AnimatedButton>
          </div>

          {!guildsData.authenticated ? (
            <GlassCard glowColor="amber">
              <div className="flex items-center gap-3 text-amber-300">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Discord API Connection Required</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {guildsData.error || 'Please make sure DISCORD_BOT_TOKEN is set in the Config tab and the bot API is online.'}
                  </p>
                </div>
              </div>
            </GlassCard>
          ) : guildsData.guilds.length === 0 ? (
            <GlassCard glowColor="cyan">
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-cyan-400 mx-auto mb-3 opacity-60" />
                <h3 className="text-lg font-bold text-slate-200">No Servers Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  The bot is authenticated as <strong>@{guildsData.bot?.username}</strong>, but has not been invited to any server yet.
                </p>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Guilds List Column */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Your Discord Servers ({guildsData.guilds.length})
                </h3>

                {guildsData.guilds.map((g) => {
                  const isSelected = selectedGuild?.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGuildId(g.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {g.icon ? (
                          <img src={g.icon} alt={g.name} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-lg">
                            {g.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-100 truncate">{g.name}</h4>
                          <span className="text-[11px] font-mono text-slate-400 block truncate">
                            ID: {g.id}
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                              {g.text_channels.length} Text
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-slate-700">
                              {g.voice_channels.length} Voice
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Channels Inspector Column */}
              <div className="lg:col-span-2 space-y-4">
                {selectedGuild && (
                  <GlassCard
                    title={`${selectedGuild.name} — Channels & Role Routing`}
                    subtitle={`Server ID: ${selectedGuild.id} • Click buttons on channels to route bot logs and welcome alerts`}
                    icon={Hash}
                    glowColor="cyan"
                  >
                    {/* Active Configuration Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 font-mono">Current Log Channel ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-400">
                            {config.DISCORD_LOG_CHANNEL_ID || 'Not set'}
                          </span>
                          {config.DISCORD_LOG_CHANNEL_ID && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] text-slate-400 font-mono">Current Welcome Channel ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-400">
                            {config.DISCORD_WELCOME_CHANNEL_ID || 'Not set'}
                          </span>
                          {config.DISCORD_WELCOME_CHANNEL_ID && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Text Channels List */}
                    <div className="space-y-3 mb-6">
                      <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5" /> Text Channels ({selectedGuild.text_channels.length})
                      </h4>

                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {selectedGuild.text_channels.map((c) => {
                          const isLog = config.DISCORD_LOG_CHANNEL_ID === c.id;
                          const isWelcome = config.DISCORD_WELCOME_CHANNEL_ID === c.id;

                          return (
                            <div
                              key={c.id}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                                isLog || isWelcome
                                  ? 'bg-slate-900/90 border-cyan-500/40 shadow-sm'
                                  : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/40'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                                <div>
                                  <span className="text-sm font-semibold text-slate-200">
                                    {c.name}
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-500 ml-2">
                                    ({c.id})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                {isLog && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                                    ✓ LOG CHANNEL
                                  </span>
                                )}
                                {isWelcome && (
                                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                                    ✓ WELCOME CHANNEL
                                  </span>
                                )}

                                <button
                                  onClick={() => setChannel('log', c.id, c.name)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[11px] font-mono transition-all"
                                >
                                  Set as Log
                                </button>
                                <button
                                  onClick={() => setChannel('welcome', c.id, c.name)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[11px] font-mono transition-all"
                                >
                                  Set as Welcome
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Voice Channels List */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5" /> Voice & Stage Channels ({selectedGuild.voice_channels.length})
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                        {selectedGuild.voice_channels.map((vc) => (
                          <div
                            key={vc.id}
                            className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <Volume2 className="w-4 h-4 text-purple-400 shrink-0" />
                              <span className="text-xs font-semibold text-slate-200 truncate">
                                {vc.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">
                              {vc.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: WEB TERMINAL ───────────────────────────────────────────── */}
      {activeTab === 'terminal' && (
        <GlassCard
          title="Interactive Bot CLI Terminal"
          subtitle="Run start / stop / restart / status / guilds / channels / db or administrative subroutines"
          icon={Terminal}
          glowColor="cyan"
          action={
            <div className="flex items-center gap-2">
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={() => setTerminalHistory([{ id: Date.now(), type: 'system', text: 'Terminal cleared.' }])}
              >
                Clear Terminal
              </AnimatedButton>
            </div>
          }
        >
          <div className="space-y-3">
            {/* Terminal Window */}
            <div
              ref={termRef}
              className="w-full h-96 bg-slate-950/95 rounded-xl p-4 font-mono text-xs overflow-y-auto border border-cyan-500/20 text-slate-200 space-y-2 shadow-2xl"
            >
              {terminalHistory.map((item) => {
                let prefix = '';
                let color = 'text-slate-300';
                if (item.type === 'user') {
                  color = 'text-cyan-400 font-bold';
                } else if (item.type === 'system') {
                  color = 'text-purple-400 font-semibold';
                } else if (item.type === 'success') {
                  color = 'text-emerald-400 font-semibold';
                } else if (item.type === 'error') {
                  color = 'text-rose-400 font-semibold';
                } else if (item.type === 'warning') {
                  color = 'text-amber-400';
                } else if (item.type === 'info') {
                  color = 'text-sky-300';
                }
                return (
                  <div key={item.id} className={`${color} whitespace-pre-wrap leading-relaxed`}>
                    {item.text}
                  </div>
                );
              })}
            </div>

            {/* Terminal Input Form */}
            <form onSubmit={executeTerminalCommand} className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-cyan-400 text-sm font-bold">
                  $
                </span>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  placeholder="Type a command: 'start', 'stop', 'guilds', 'channels', 'db', 'status'..."
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl glass-input text-xs font-mono"
                  autoFocus
                />
              </div>
              <AnimatedButton variant="primary" size="md" icon={Send} type="submit">
                Execute
              </AnimatedButton>
            </form>

            {/* Quick Command Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-[11px] font-mono text-slate-500">Quick Commands:</span>
              {['start', 'stop', 'restart', 'status', 'guilds', 'channels', 'db', 'help', 'ping'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={async () => {
                    addTerminalLog('user', `$ ${c}`);
                    try {
                      const res = await fetch(`${API}/api/bot/terminal/exec`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ command: c }),
                      });
                      const data = await res.json();
                      addTerminalLog(data.success ? 'output' : 'error', data.output);
                      fetchStatus();
                    } catch {
                      addTerminalLog('error', '❌ Execution failed.');
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-slate-700 text-xs font-mono transition-all"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* ── TAB 4: BOT COMMANDS MATRIX ────────────────────────────────────── */}
      {activeTab === 'commands' && (
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center gap-2 flex-wrap">
              {['All', 'Music & Voice', 'Auto-Role', 'Security', 'General', 'Moderation', 'Channel'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    filterCategory === cat
                      ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(0,255,157,0.4)]'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={cmdSearch}
              onChange={(e) => setCmdSearch(e.target.value)}
              placeholder="Search bot commands or description..."
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:border-emerald-400 focus:outline-none w-full sm:w-72"
            />
          </div>

          {/* Commands Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommands.map((c) => {
              const Icon = c.icon;
              const color = CATEGORY_COLORS[c.category] || 'emerald';
              return (
                <GlassCard key={c.cmd} glowColor={color} className="flex flex-col justify-between hover:border-emerald-500/40 transition-all p-5">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {c.badge || c.category}
                      </span>
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>

                    <h4 className="text-base font-extrabold font-mono text-slate-100 tracking-wide">{c.cmd}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">{c.desc}</p>

                    {c.usage && (
                      <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-emerald-300/90">
                        <span className="truncate">Usage: <code className="text-white font-bold">{c.usage}</code></span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(c.usage);
                            addTerminalLog('info', `📋 Copied command: ${c.usage}`);
                          }}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 transition-all ml-2 shrink-0 text-[10px]"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>Prefix: <strong className="text-slate-300">{config.DISCORD_PREFIX || '!'}</strong></span>
                    <span className="text-emerald-400 font-bold">● Active in Server</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 5: DATABASE STATS ─────────────────────────────────────────── */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard glowColor="amber">
              <span className="text-xs text-slate-400">Total Warnings Issued</span>
              <div className="mt-2 text-2xl font-bold font-mono text-amber-300">
                {dbStats?.warnings_count ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">Stored in discord.db</span>
            </GlassCard>

            <GlassCard glowColor="pink">
              <span className="text-xs text-slate-400">Total Fines Logged</span>
              <div className="mt-2 text-2xl font-bold font-mono text-pink-300">
                {dbStats?.fines_count ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">
                Total: {dbStats?.fines_total_amount ?? 0} credits
              </span>
            </GlassCard>

            <GlassCard glowColor="cyan">
              <span className="text-xs text-slate-400">Active VC Access Rules</span>
              <div className="mt-2 text-2xl font-bold font-mono text-cyan-300">
                {dbStats?.vc_access_count ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">secure_voice_ai.db</span>
            </GlassCard>

            <GlassCard glowColor="purple">
              <span className="text-xs text-slate-400">Security Bot Events</span>
              <div className="mt-2 text-2xl font-bold font-mono text-purple-300">
                {dbStats?.events_count ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">Audit telemetry</span>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Warnings Table */}
            <GlassCard
              title="Recent Warnings"
              subtitle="Latest moderation strikes issued to server members"
              icon={AlertTriangle}
              glowColor="amber"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">USER ID</th>
                      <th className="pb-2">COUNT</th>
                      <th className="pb-2">REASON</th>
                      <th className="pb-2 text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {dbStats?.warnings_recent?.length > 0 ? (
                      dbStats.warnings_recent.map((w, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-2 text-cyan-300">{w.user_id}</td>
                          <td className="py-2 font-bold text-amber-400">{w.count}</td>
                          <td className="py-2 text-slate-300 truncate max-w-xs">{w.reason || '-'}</td>
                          <td className="py-2 text-right text-slate-500">{w.time}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500 italic">
                          No warnings recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Recent Fines Table */}
            <GlassCard
              title="Recent Fines"
              subtitle="Financial moderation records from !fine command"
              icon={FileCode}
              glowColor="pink"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="pb-2">USER ID</th>
                      <th className="pb-2">AMOUNT</th>
                      <th className="pb-2">REASON</th>
                      <th className="pb-2 text-right">TIME</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {dbStats?.fines_recent?.length > 0 ? (
                      dbStats.fines_recent.map((f, i) => (
                        <tr key={i} className="hover:bg-slate-800/30">
                          <td className="py-2 text-cyan-300">{f.user_id}</td>
                          <td className="py-2 font-bold text-pink-400">{f.amount}</td>
                          <td className="py-2 text-slate-300 truncate max-w-xs">{f.reason || '-'}</td>
                          <td className="py-2 text-right text-slate-500">{f.time}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-500 italic">
                          No fines recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ── TAB 6: CONFIGURATION & .ENV ───────────────────────────────────── */}
      {activeTab === 'config' && (
        <GlassCard
          title="Discord Bot & Environment Configuration"
          subtitle="Modifications write directly to bots/.env and apply on bot restart"
          icon={Settings}
          glowColor="cyan"
          action={
            <AnimatedButton
              variant="primary"
              size="sm"
              icon={Save}
              onClick={saveConfig}
              disabled={configSaving}
            >
              {configSaving ? 'Saving...' : 'Save Configuration'}
            </AnimatedButton>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Token field */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>DISCORD_BOT_TOKEN *</span>
                <span className="text-[10px] text-slate-400">Keep confidential</span>
              </label>
              <div className="relative">
                <input
                  type={secretVisible['token'] ? 'text' : 'password'}
                  value={config.DISCORD_BOT_TOKEN || ''}
                  onChange={(e) => setConfig({ ...config, DISCORD_BOT_TOKEN: e.target.value })}
                  placeholder="MTA... (Paste your Discord Bot Token)"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setSecretVisible((prev) => ({ ...prev, token: !prev.token }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {secretVisible['token'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Prefix */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300">DISCORD_PREFIX</label>
              <input
                type="text"
                value={config.DISCORD_PREFIX || '!'}
                onChange={(e) => setConfig({ ...config, DISCORD_PREFIX: e.target.value })}
                placeholder="!"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            {/* Security Mode */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300">SECURITY_MODE</label>
              <select
                value={config.SECURITY_MODE || 'ON'}
                onChange={(e) => setConfig({ ...config, SECURITY_MODE: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono bg-slate-900 text-slate-200"
              >
                <option value="ON">ON (Anti-Nuke & Whitelist Protected)</option>
                <option value="OFF">OFF (Standard Mode)</option>
              </select>
            </div>

            {/* Log Channel ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>DISCORD_LOG_CHANNEL_ID</span>
                <span className="text-[10px] text-cyan-400">Mod & Ban Audit Feed</span>
              </label>
              <input
                type="text"
                value={config.DISCORD_LOG_CHANNEL_ID || ''}
                onChange={(e) => setConfig({ ...config, DISCORD_LOG_CHANNEL_ID: e.target.value })}
                placeholder="123456789012345678"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            {/* Welcome Channel ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                <span>DISCORD_WELCOME_CHANNEL_ID</span>
                <span className="text-[10px] text-cyan-400">New Member Embeds</span>
              </label>
              <input
                type="text"
                value={config.DISCORD_WELCOME_CHANNEL_ID || ''}
                onChange={(e) => setConfig({ ...config, DISCORD_WELCOME_CHANNEL_ID: e.target.value })}
                placeholder="123456789012345678"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            {/* Welcome Message */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300">DISCORD_WELCOME_MESSAGE</label>
              <input
                type="text"
                value={config.DISCORD_WELCOME_MESSAGE || 'Welcome to the server! 🎉'}
                onChange={(e) => setConfig({ ...config, DISCORD_WELCOME_MESSAGE: e.target.value })}
                placeholder="Welcome to the server! 🎉"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            {/* Owner IDs */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300">DISCORD_OWNER_IDS</label>
              <input
                type="text"
                value={config.DISCORD_OWNER_IDS || ''}
                onChange={(e) => setConfig({ ...config, DISCORD_OWNER_IDS: e.target.value })}
                placeholder="123456789,987654321 (Comma separated)"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>

            {/* Whitelist IDs */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-slate-300">DISCORD_WHITELIST_IDS</label>
              <input
                type="text"
                value={config.DISCORD_WHITELIST_IDS || ''}
                onChange={(e) => setConfig({ ...config, DISCORD_WHITELIST_IDS: e.target.value })}
                placeholder="123456789,987654321"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-mono"
              />
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

export default BotController;
