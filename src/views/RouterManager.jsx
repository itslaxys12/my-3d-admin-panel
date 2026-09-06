import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Server,
  Smartphone,
  Laptop,
  Tv,
  Cpu,
  RefreshCw,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Activity,
  Layers,
  HelpCircle,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getApiBase, getWsBase, safeFetchJson } from '../utils/apiConfig';

export function RouterManager({ userRole = 'owner' }) {
  // ─── State Management ──────────────────────────────────────────────────────
  const [routers, setRouters] = useState([]);
  const [devices, setDevices] = useState([]);
  const [knownDevices, setKnownDevices] = useState([]);
  const [alertsData, setAlertsData] = useState({ unread_count: 0, alerts: [] });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('devices'); // 'devices' | 'routers' | 'known' | 'alerts' | 'logs'

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all'); // 'all' | 'unknown' | 'known'
  const [statusFilter, setStatusFilter] = useState('online'); // 'online' | 'offline' | 'all' (default: online only)
  const [routerFilter, setRouterFilter] = useState('all');
  const [quickMacQuery, setQuickMacQuery] = useState('');

  // Instant Permission Alert State (when new device connects with password)
  const [permissionAlert, setPermissionAlert] = useState(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState(new Set());

  // Audio Alerts Toggle
  const [audioAlerts, setAudioAlerts] = useState(() => {
    return localStorage.getItem('gmx_router_audio_alert') !== 'false';
  });

  // Action status indicators
  const [scanningMap, setScanningMap] = useState({});
  const [testingMap, setTestingMap] = useState({});
  const [testResults, setTestResults] = useState({});
  const [copiedMac, setCopiedMac] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhitelistModalOpen, setIsWhitelistModalOpen] = useState(false);

  // Selected entities for modals
  const [selectedRouter, setSelectedRouter] = useState(null);
  const [whitelistTarget, setWhitelistTarget] = useState({
    mac_address: '',
    custom_name: '',
    owner_name: '',
    device_type: 'phone',
    notes: '',
    is_known: true,
  });

  // Form states
  const [routerForm, setRouterForm] = useState({
    name: 'Netis NC21 Home Router',
    brand: 'Netis',
    model: 'NC21 Gigabit Dual-Band',
    ip_address: '192.168.1.1',
    port: 80,
    use_https: false,
    username: 'admin',
    password: '',
    monitoring_enabled: true,
    auto_scan_interval: 60,
  });
  const [showPassword, setShowPassword] = useState(false);

  // WebSocket Ref
  const wsRef = useRef(null);

  // ─── Synthesized Cyber Audio Alert (Web Audio API) ─────────────────────────
  const triggerAudioChime = () => {
    if (!audioAlerts) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Cyber Alarm Dual-Tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (err) {
      console.warn('Web Audio error:', err);
    }
  };

  const toggleAudio = () => {
    const next = !audioAlerts;
    setAudioAlerts(next);
    localStorage.setItem('gmx_router_audio_alert', String(next));
    if (next) triggerAudioChime();
  };

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    try {
      const [rRes, dRes, kRes, aRes, lRes] = await Promise.all([
        safeFetchJson('/api/routers').catch(() => ({ routers: [] })),
        safeFetchJson('/api/devices/all').catch(() => ({ devices: [] })),
        safeFetchJson('/api/devices/known').catch(() => ({ known_devices: [] })),
        safeFetchJson('/api/routers/alerts').catch(() => ({ unread_count: 0, alerts: [] })),
        safeFetchJson('/api/routers/audit-logs').catch(() => ({ logs: [] })),
      ]);

      setRouters(rRes.routers || []);
      setDevices(dRes.devices || []);
      setKnownDevices(kRes.known_devices || []);
      setAlertsData(aRes || { unread_count: 0, alerts: [] });
      setAuditLogs(lRes.logs || []);
    } catch (err) {
      console.error('Failed fetching router data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const timer = setInterval(fetchAllData, 5000); // 5s ultra-fast radar polling
    return () => clearInterval(timer);
  }, []);

  // ─── WebSocket Live Alerts Connection ──────────────────────────────────────
  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWS = () => {
      const wsUrl = `${getWsBase()}/ws`;

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send keepalive ping
        setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 25000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'UNKNOWN_DEVICE_DETECTED') {
            triggerAudioChime();
            setPermissionAlert(payload.data);
            fetchAllData();
          } else if (payload.type === 'DEVICE_DISCONNECTED') {
            const discMac = payload.data?.mac_address;
            if (discMac) {
              setDevices((prev) =>
                prev.map((d) => (d.mac_address === discMac ? { ...d, status: 'offline' } : d))
              );
            }
            fetchAllData();
          } else if (payload.type === 'DEVICE_CONNECTED') {
            triggerAudioChime();
            fetchAllData();
          } else if (payload.type === 'SCAN_COMPLETED' || payload.type === 'RADAR_STATE_UPDATED') {
            fetchAllData();
          }
        } catch {
          // Non-JSON message (e.g. 'pong')
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWS, 4000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, [audioAlerts]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleCopyMac = (mac) => {
    navigator.clipboard.writeText(mac);
    setCopiedMac(mac);
    setTimeout(() => setCopiedMac(null), 1800);
  };

  const handleTestConnection = async (routerId) => {
    setTestingMap((prev) => ({ ...prev, [routerId]: true }));
    try {
      const data = await safeFetchJson(`/api/routers/${routerId}/test`, { method: 'POST' });
      setTestResults((prev) => ({ ...prev, [routerId]: data }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [routerId]: { success: false, message: `Test failed: ${err.message}` },
      }));
    } finally {
      setTestingMap((prev) => ({ ...prev, [routerId]: false }));
    }
  };

  const handleManualScan = async (routerId) => {
    setScanningMap((prev) => ({ ...prev, [routerId]: true }));
    try {
      await safeFetchJson(`/api/routers/${routerId}/scan`, { method: 'POST' });
      await fetchAllData();
      setActionSuccessMsg(`Router #${routerId} scan completed!`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      alert(`Scan note: ${err.message}`);
    } finally {
      setScanningMap((prev) => ({ ...prev, [routerId]: false }));
    }
  };

  const handleScanAll = async () => {
    setLoading(true);
    for (const r of routers) {
      try {
        await safeFetchJson(`/api/routers/${r.id}/scan`, { method: 'POST' });
      } catch {}
    }
    await fetchAllData();
  };

  const handleSeedSample = async () => {
    try {
      const data = await safeFetchJson('/api/routers/seed-sample', { method: 'POST' });
      triggerAudioChime();
      await fetchAllData();
      setActionSuccessMsg(data.message || 'Sample routers and test devices seeded!');
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      alert(`Seed failed: ${err.message}`);
    }
  };

  const handleSaveRouter = async (e) => {
    e.preventDefault();
    try {
      await safeFetchJson('/api/routers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routerForm),
      });
      setIsAddModalOpen(false);
      setRouterForm({
        name: 'Netis NC21 Home Router',
        brand: 'Netis',
        model: 'NC21 Gigabit Dual-Band',
        ip_address: '192.168.1.1',
        port: 80,
        use_https: false,
        username: 'admin',
        password: '',
        monitoring_enabled: true,
        auto_scan_interval: 60,
      });
      await fetchAllData();
      setActionSuccessMsg('Router added successfully!');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      alert(`Error adding router: ${err.message}`);
    }
  };

  const handleUpdateRouter = async (e) => {
    e.preventDefault();
    if (!selectedRouter) return;
    try {
      await safeFetchJson(`/api/routers/${selectedRouter.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routerForm),
      });
      setIsEditModalOpen(false);
      setSelectedRouter(null);
      await fetchAllData();
      setActionSuccessMsg('Router settings saved!');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      alert(`Error updating router: ${err.message}`);
    }
  };

  const handleDeleteRouter = async (routerId, routerName) => {
    if (!window.confirm(`Delete router '${routerName}' and its device history?`)) return;
    try {
      await safeFetchJson(`/api/routers/${routerId}`, { method: 'DELETE' });
      await fetchAllData();
      setActionSuccessMsg(`Router '${routerName}' deleted.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const openWhitelistModal = (device = {}) => {
    setWhitelistTarget({
      mac_address: device.mac_address || device.mac || '',
      custom_name: device.custom_name || device.hostname || '',
      owner_name: device.owner_name || '',
      device_type: device.device_type || 'phone',
      notes: device.notes || '',
      is_known: true,
    });
    setIsWhitelistModalOpen(true);
  };

  const handleSaveWhitelist = async (e) => {
    e.preventDefault();
    try {
      await safeFetchJson('/api/devices/known', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(whitelistTarget),
      });
      setIsWhitelistModalOpen(false);
      await fetchAllData();
      setActionSuccessMsg(`Device ${whitelistTarget.mac_address} authorized as "${whitelistTarget.custom_name}"!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      alert(`Whitelist error: ${err.message}`);
    }
  };

  const handleDeleteKnownDevice = async (mac) => {
    if (!window.confirm(`Remove custom label for ${mac}?`)) return;
    try {
      await safeFetchJson(`/api/devices/known/${encodeURIComponent(mac)}`, { method: 'DELETE' });
      await fetchAllData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await safeFetchJson(`/api/routers/alerts/${alertId}/dismiss`, { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllAlerts = async () => {
    try {
      await safeFetchJson('/api/routers/alerts/clear-all', { method: 'POST' });
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickBlacklist = async (mac, name = '') => {
    if (!window.confirm(`Add MAC [${mac}] to Blacklist and block access?`)) return;
    try {
      await safeFetchJson('/api/devices/known', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mac_address: mac,
          custom_name: name || 'Blacklisted Rogue Device',
          is_known: false,
          is_blacklisted: true,
        }),
      });
      await fetchAllData();
      setActionSuccessMsg(`MAC ${mac} moved to Blacklist.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      alert(`Blacklist error: ${err.message}`);
    }
  };

  // Counts
  const blacklistedCount = useMemo(
    () => devices.filter((d) => d.status === 'blacklisted' || Boolean(d.is_blacklisted)).length,
    [devices]
  );
  const onlineCount = useMemo(
    () => devices.filter((d) => d.status === 'online' && !d.is_blacklisted).length,
    [devices]
  );
  const offlineCount = useMemo(
    () => devices.filter((d) => d.status !== 'online' && d.status !== 'blacklisted' && !d.is_blacklisted).length,
    [devices]
  );

  // ─── Filtered Devices Computation ──────────────────────────────────────────
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const isBlacklisted = Boolean(d.is_blacklisted || d.status === 'blacklisted');

      // Status filter (Active Online vs Disconnected vs Blacklisted)
      if (statusFilter === 'blacklisted' && !isBlacklisted) return false;
      if (statusFilter === 'online' && (d.status !== 'online' || isBlacklisted)) return false;
      if (statusFilter === 'offline' && (d.status === 'online' || isBlacklisted)) return false;

      // Router filter
      if (routerFilter !== 'all' && String(d.router_id) !== String(routerFilter)) {
        return false;
      }
      // Known / Unknown / Blacklisted filter
      const isKnown = Boolean(d.is_known && !isBlacklisted);
      if (deviceFilter === 'blacklisted' && !isBlacklisted) return false;
      if (deviceFilter === 'known' && !isKnown) return false;
      if (deviceFilter === 'unknown' && isKnown) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mac = (d.mac_address || '').toLowerCase();
        const ip = (d.ip_address || '').toLowerCase();
        const name = (d.custom_name || '').toLowerCase();
        const host = (d.hostname || '').toLowerCase();
        const rName = (d.router_name || '').toLowerCase();
        return (
          mac.includes(q) ||
          ip.includes(q) ||
          name.includes(q) ||
          host.includes(q) ||
          rName.includes(q)
        );
      }
      return true;
    });
  }, [devices, statusFilter, routerFilter, deviceFilter, searchQuery]);

  // ─── Quick MAC Lookup Match Computation ────────────────────────────────────
  const quickMacMatch = useMemo(() => {
    const raw = quickMacQuery.trim().replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    if (!raw || raw.length < 2) return null;

    // Search in connected / active devices list first
    const foundInDevices = devices.find((d) => {
      const dMac = (d.mac_address || '').replace(/[^a-fA-F0-9]/g, '').toLowerCase();
      return dMac === raw || (raw.length >= 4 && dMac.includes(raw));
    });

    if (foundInDevices) return foundInDevices;

    // Search in known / saved devices list
    const foundInKnown = knownDevices.find((k) => {
      const kMac = (k.mac_address || '').replace(/[^a-fA-F0-9]/g, '').toLowerCase();
      return kMac === raw || (raw.length >= 4 && kMac.includes(raw));
    });

    if (foundInKnown) {
      return {
        ...foundInKnown,
        ip_address: 'Saved in History',
        status: foundInKnown.is_blacklisted ? 'blacklisted' : 'offline',
        hostname: foundInKnown.custom_name || 'Known Client',
      };
    }

    return null;
  }, [quickMacQuery, devices, knownDevices]);

  // Device type icon selector helper
  const getDeviceIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('phone') || t.includes('mobile')) return Smartphone;
    if (t.includes('laptop') || t.includes('macbook')) return Laptop;
    if (t.includes('tv') || t.includes('media')) return Tv;
    if (t.includes('iot') || t.includes('cam')) return Radio;
    return Cpu;
  };

  // ─── Unread Unknown Devices List for Warning Banner ────────────────────────
  const unreadAlerts = alertsData.alerts ? alertsData.alerts.filter((a) => a.status === 'unread') : [];

  return (
    <div className="space-y-6 pb-16 font-sans text-slate-100">
      {/* ─── Top Header & Disclaimer ────────────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(0,255,157,0.3)] flex-shrink-0">
              <Wifi className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black font-heading tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-white">
                  WIFI & ROUTER MONITORING HUB
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
                  TENDA • NETIS NC21
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time Wi-Fi device scanning, MAC identity mapping, and instant rogue device intrusion alerts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={toggleAudio}
              className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
                audioAlerts
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_15px_rgba(255,42,109,0.3)]'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle Audio Alert Chime"
            >
              {audioAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{audioAlerts ? 'AUDIO CHIME ON' : 'AUDIO MUTED'}</span>
            </button>

            <button
              onClick={handleScanAll}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-800/90 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 font-mono text-xs font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SCAN ALL</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-mono text-xs font-black flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,157,0.4)] hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>ADD ROUTER</span>
            </button>
          </div>
        </div>

        {/* Legal / Security Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>AUTHORIZED MONITORING ONLY:</strong> This system strictly operates on routers and Wi-Fi networks owned by you or where you possess explicit administrative authorization.
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {actionSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2.5 shadow-[0_0_20px_rgba(0,255,157,0.2)]"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── REAL-TIME UNKNOWN MAC ALERT BANNER ─────────────────────────────── */}
      <AnimatePresence>
        {unreadAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-950/90 to-rose-950/80 border-2 border-rose-500/60 shadow-[0_0_35px_rgba(255,42,109,0.35)] backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 flex items-center gap-2">
              <button
                onClick={handleClearAllAlerts}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-[10px] font-mono font-bold"
              >
                DISMISS ALL ({unreadAlerts.length})
              </button>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 flex-shrink-0 animate-bounce">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-2.5 flex-1 pr-24 sm:pr-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500 text-black font-mono text-[10px] font-black uppercase">
                    HIGH-ALERT WARNING
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white font-heading">
                    {unreadAlerts.length} Unknown Wi-Fi Device{unreadAlerts.length > 1 ? 's' : ''} Detected!
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {unreadAlerts.slice(0, 4).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-rose-300 truncate">
                            {alert.hostname || 'Unknown Device'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({alert.ip_address || 'No IP'})
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-rose-400 font-bold">{alert.mac_address}</span>
                          <span>•</span>
                          <span className="text-slate-400 truncate">{alert.router_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => openWhitelistModal({ mac_address: alert.mac_address, hostname: alert.hostname })}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-black font-mono text-[10px] font-black hover:bg-emerald-400 shadow-[0_0_10px_rgba(0,255,157,0.3)] transition-all"
                        >
                          WHITELIST
                        </button>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-300"
                          title="Dismiss"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Top Telemetry KPI Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Routers Monitored */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-emerald-500/20 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Monitored Routers
            </span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {routers.filter((r) => r.last_status === 'online').length} / {routers.length}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Online & Active</p>
          </div>
        </div>

        {/* Card 2: Connected Wi-Fi Devices */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Connected Clients
            </span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
              {devices.filter((d) => d.status === 'online').length}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Active Devices Across Network</p>
          </div>
        </div>

        {/* Card 3: Whitelisted Known Devices */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-purple-500/20 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Whitelisted Devices
            </span>
            <ShieldCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-300">
              {knownDevices.length}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Registered Friendly MACs</p>
          </div>
        </div>

        {/* Card 4: Blacklisted Rogue Devices */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-rose-500/20 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Blacklisted Devices
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
              {blacklistedCount}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Auto-Blocked Rogue MACs</p>
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'devices'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>CONNECTED RADAR ({devices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('routers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'routers'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>ROUTER FLEET ({routers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('known')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'known'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>KNOWN MACS ({knownDevices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ALERT HISTORY ({alertsData.alerts ? alertsData.alerts.length : 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>AUDIT LOGS</span>
          </button>
        </div>

        {/* Demo Data Button */}
        {routers.length === 0 && (
          <button
            onClick={handleSeedSample}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>SEED DEMO DATA</span>
          </button>
        )}
      </div>

      {/* ─── TAB 1: CONNECTED DEVICES RADAR ────────────────────────────────── */}
      {activeTab === 'devices' && (
        <div className="space-y-4">
          {/* ─── Dedicated Quick MAC Address Finder & Inspection Tool ───────── */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900/95 via-slate-950/90 to-slate-900/95 border border-cyan-500/40 backdrop-blur-xl shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                  <Zap className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-heading text-white flex items-center gap-2">
                    <span>QUICK MAC ADDRESS FINDER & INSPECTION TOOL</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/40">
                      LIVE FINDER
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    যেকোনো ফরম্যাটে MAC এড্রেস দিন — নিমিষে ডিভাইস খুঁজে বের করুন এবং সরাসরি ব্লক বা নাম সেভ করুন।
                  </p>
                </div>
              </div>
              {quickMacQuery && (
                <button
                  onClick={() => setQuickMacQuery('')}
                  className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all self-start sm:self-auto"
                >
                  Clear Search
                </button>
              )}
            </div>

            {/* Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={quickMacQuery}
                onChange={(e) => setQuickMacQuery(e.target.value)}
                placeholder="Enter Target MAC (e.g. EA:77:8F:0E:2E:5C or EA778F0E2E5C or 34-5A...)"
                className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono tracking-wider focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 shadow-inner"
              />
            </div>

            {/* Live Search Match Result */}
            {quickMacQuery.trim().length >= 2 && (
              <div className="mt-2">
                {quickMacMatch ? (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-[0_0_25px_rgba(0,255,157,0.15)]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        quickMacMatch.is_blacklisted || quickMacMatch.status === 'blacklisted'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : quickMacMatch.status === 'online'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        <Radio className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white font-mono truncate">
                            {quickMacMatch.custom_name || quickMacMatch.hostname || 'Device Client'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            quickMacMatch.is_blacklisted || quickMacMatch.status === 'blacklisted'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : quickMacMatch.status === 'online'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {quickMacMatch.is_blacklisted || quickMacMatch.status === 'blacklisted'
                              ? '🚫 BLACKLISTED'
                              : quickMacMatch.status === 'online'
                              ? '🟢 ACTIVE ONLINE'
                              : '⚪ DISCONNECTED'}
                          </span>
                          {quickMacMatch.router_name && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-mono border border-cyan-500/20">
                              {quickMacMatch.router_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-1 flex-wrap">
                          <span>IP: <strong className="text-cyan-300">{quickMacMatch.ip_address || 'N/A'}</strong></span>
                          <span>•</span>
                          <span>MAC: <strong className="text-white">{quickMacMatch.mac_address}</strong></span>
                          {quickMacMatch.connection_type && (
                            <>
                              <span>•</span>
                              <span>Band: <strong className="text-emerald-300">{quickMacMatch.connection_type}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-shrink-0">
                      <button
                        onClick={() => openWhitelistModal(quickMacMatch)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1 transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Whitelist / Name</span>
                      </button>

                      {!(quickMacMatch.is_blacklisted || quickMacMatch.status === 'blacklisted') && (
                        <button
                          onClick={() => handleQuickBlacklist(quickMacMatch.mac_address, quickMacMatch.custom_name || quickMacMatch.hostname)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold flex items-center gap-1 transition-all"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Blacklist MAC</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>No active or saved device found matching "{quickMacQuery}".</span>
                    </div>
                    <button
                      onClick={() => openWhitelistModal({ mac_address: quickMacQuery.trim() })}
                      className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-mono"
                    >
                      Pre-Authorize This MAC
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by MAC, IP, Device Name or Router..."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">Filter: All Statuses</option>
                <option value="blacklisted">🚫 Blacklisted (Auto-Blocked)</option>
                <option value="unknown">🚨 Unknown / Rogue Only</option>
                <option value="known">🛡️ Known / Approved Only</option>
              </select>

              <select
                value={routerFilter}
                onChange={(e) => setRouterFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">Router: All Routers</option>
                {routers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.brand})
                  </option>
                ))}
              </select>

              <button
                onClick={fetchAllData}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                title="Refresh Devices"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Status Sub-filter Bar (Active Online vs Blacklisted vs Disconnected) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setStatusFilter('online')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                statusFilter === 'online'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE ONLINE ({onlineCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('blacklisted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                statusFilter === 'blacklisted'
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500 shadow-[0_0_15px_rgba(255,42,109,0.3)]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>BLACKLISTED ({blacklistedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('offline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                statusFilter === 'offline'
                  ? 'bg-slate-700 text-slate-200 border border-slate-600 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>DISCONNECTED ({offlineCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                statusFilter === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>ALL CLIENTS ({devices.length})</span>
            </button>
          </div>

          {/* Devices Grid / Table */}
          {filteredDevices.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 font-mono space-y-3">
              <Radio className="w-10 h-10 text-slate-600 mx-auto animate-pulse" />
              <p className="text-sm text-slate-400">No connected devices match your current filters.</p>
              {routers.length === 0 && (
                <button
                  onClick={handleSeedSample}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-all"
                >
                  Seed Sample Tenda & Netis Data to Test
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDevices.map((dev) => {
                const isBlacklisted = Boolean(dev.is_blacklisted || dev.status === 'blacklisted');
                const isKnown = Boolean(dev.is_known && !isBlacklisted);
                const DevIcon = getDeviceIcon(dev.device_type);

                return (
                  <div
                    key={`${dev.router_id}-${dev.mac_address}`}
                    className={`p-4 rounded-2xl transition-all duration-300 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${
                      isBlacklisted
                        ? 'bg-rose-950/40 border-2 border-rose-600/80 shadow-[0_0_25px_rgba(255,42,109,0.3)]'
                        : isKnown
                        ? 'bg-slate-900/70 border border-emerald-500/25 hover:border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,157,0.05)]'
                        : 'bg-rose-950/30 border-2 border-rose-500/50 hover:border-rose-500 shadow-[0_0_20px_rgba(255,42,109,0.15)]'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isBlacklisted
                                ? 'bg-rose-600/30 text-rose-300 border border-rose-500/70 animate-pulse'
                                : isKnown
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                            }`}
                          >
                            <DevIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-white truncate">
                                {dev.custom_name || dev.hostname || (isBlacklisted ? 'Blacklisted Device' : 'Unknown Device')}
                              </h4>
                              <button
                                onClick={() => openWhitelistModal(dev)}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                                title="Edit Device Name"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              {dev.owner_name ? `Owner: ${dev.owner_name}` : dev.hostname || 'Unlabeled Host'}
                            </p>
                          </div>
                        </div>

                        {/* Known vs Blacklisted vs Rogue Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex-shrink-0 ${
                            isBlacklisted
                              ? 'bg-rose-600/30 text-rose-300 border border-rose-500/70'
                              : isKnown
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                          }`}
                        >
                          {isBlacklisted ? '🚫 BLACKLISTED' : isKnown ? 'APPROVED' : 'ROGUE / UNKNOWN'}
                        </span>
                      </div>

                      {/* Network Details */}
                      <div className="mt-4 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 uppercase">MAC Address</span>
                          <button
                            onClick={() => handleCopyMac(dev.mac_address)}
                            className="flex items-center gap-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
                            title="Copy MAC"
                          >
                            <span className="font-bold">{dev.mac_address}</span>
                            {copiedMac === dev.mac_address ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 uppercase">IP Address</span>
                          <span className="text-slate-300 font-bold">{dev.ip_address || 'DHCP Pending'}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 uppercase">Router Source</span>
                          <span className="text-cyan-300 truncate max-w-[140px] text-right">
                            {dev.router_name || `Router #${dev.router_id}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 uppercase">Status & Band</span>
                          <div className="flex items-center gap-1.5">
                            {isBlacklisted ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-600/30 text-[10px] text-rose-300 font-bold border border-rose-500/50 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                                BLOCKED
                              </span>
                            ) : dev.status === 'online' ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                LIVE
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-bold border border-slate-700">
                                OFFLINE
                              </span>
                            )}
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              (dev.connection_type || '').includes('5G')
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : (dev.connection_type || '').includes('LAN')
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {dev.connection_type || 'Wi-Fi'}
                            </span>
                            <span className="text-slate-400 text-[10px]">{dev.signal_strength || '-58 dBm'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openWhitelistModal(dev)}
                        className={`w-full py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          isBlacklisted
                            ? 'bg-gradient-to-r from-rose-600 to-emerald-500 text-white hover:brightness-110 shadow-[0_0_15px_rgba(0,255,157,0.4)] font-black'
                            : isKnown
                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                            : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,157,0.3)] font-black'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isBlacklisted ? 'Unblock & Set Friendly Name' : isKnown ? 'Edit Name & Details' : 'Set Friendly Name & Whitelist'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: ROUTER FLEET MANAGEMENT ─────────────────────────────────── */}
      {activeTab === 'routers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Monitored Router Hardware</h3>
              <p className="text-xs text-slate-400">Configure Tenda and Netis NC21 local or remote router endpoints.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSeedSample}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold hover:bg-purple-500/30"
              >
                + Add Sample Tenda & Netis
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-mono text-xs font-black hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,157,0.3)]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Router</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routers.map((router) => {
              const isScanning = scanningMap[router.id];
              const isTesting = testingMap[router.id];
              const testRes = testResults[router.id];

              return (
                <div
                  key={router.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 backdrop-blur-xl transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Server className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-bold text-white truncate">{router.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] font-bold text-cyan-300">
                            {router.brand} • {router.model || 'Standard'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {router.ip_address}:{router.port}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        router.last_status === 'online'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {router.last_status === 'online' ? 'ONLINE' : 'STANDBY / OFFLINE'}
                    </span>
                  </div>

                  {/* Router Telemetry Info */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500">Connected</span>
                      <div className="text-sm font-bold text-emerald-400">
                        {router.connected_devices_count || 0} Devices
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Rogue Alerts</span>
                      <div className="text-sm font-bold text-rose-400">
                        {router.unread_alerts_count || 0} Unread
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Auto Scan</span>
                      <div className="text-sm font-bold text-cyan-400">
                        {router.auto_scan_interval || 60}s
                      </div>
                    </div>
                  </div>

                  {/* Test Connection Output if available */}
                  {testRes && (
                    <div
                      className={`p-3 rounded-xl text-xs font-mono border ${
                        testRes.success
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{testRes.message}</span>
                        {testRes.latency_ms && (
                          <span className="text-[10px] opacity-80">{testRes.latency_ms}ms</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Controls */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleManualScan(router.id)}
                        disabled={isScanning}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                        <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
                      </button>

                      <button
                        onClick={() => handleTestConnection(router.id)}
                        disabled={isTesting}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Zap className={`w-3.5 h-3.5 text-amber-400 ${isTesting ? 'animate-bounce' : ''}`} />
                        <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedRouter(router);
                          setRouterForm({
                            name: router.name,
                            brand: router.brand,
                            model: router.model || 'Standard',
                            ip_address: router.ip_address,
                            port: router.port || 80,
                            use_https: Boolean(router.use_https),
                            username: router.username || 'admin',
                            password: '',
                            monitoring_enabled: Boolean(router.monitoring_enabled),
                            auto_scan_interval: router.auto_scan_interval || 60,
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-cyan-300 transition-colors"
                        title="Edit Settings"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteRouter(router.id, router.name)}
                        className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Router"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── TAB 3: KNOWN MAC DIRECTORY ─────────────────────────────────────── */}
      {activeTab === 'known' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Known MAC Address Whitelist</h3>
              <p className="text-xs text-slate-400">
                Pre-register friendly device names (e.g. Rahim's Phone) to prevent alert notifications.
              </p>
            </div>
            <button
              onClick={() => openWhitelistModal()}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-mono text-xs font-black hover:bg-emerald-400 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,157,0.3)]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Register MAC</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                  <th className="pb-3 pl-2">Device Name</th>
                  <th className="pb-3">MAC Address</th>
                  <th className="pb-3">Owner</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Approval</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {knownDevices.map((dev) => (
                  <tr key={dev.mac_address} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 pl-2 font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{dev.custom_name}</span>
                    </td>
                    <td className="py-3 text-slate-300 font-bold">{dev.mac_address}</td>
                    <td className="py-3 text-slate-400">{dev.owner_name || '—'}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase text-[10px]">
                        {dev.device_type || 'Device'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dev.is_known
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {dev.is_known ? 'APPROVED' : 'FLAGGED'}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openWhitelistModal(dev)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-300"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteKnownDevice(dev.mac_address)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: ALERT HISTORY ────────────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Intrusion & Rogue MAC Alerts</h3>
              <p className="text-xs text-slate-400">Complete log of unauthorized devices detected by the scanner.</p>
            </div>
            <button
              onClick={handleClearAllAlerts}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700 text-xs font-mono font-bold transition-all"
            >
              Clear / Dismiss All
            </button>
          </div>

          <div className="space-y-2.5">
            {alertsData.alerts && alertsData.alerts.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs font-mono">
                No alerts recorded. Network security status is nominal!
              </div>
            ) : (
              alertsData.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono transition-all ${
                    alert.status === 'unread'
                      ? 'bg-rose-950/40 border-rose-500/50 shadow-[0_0_15px_rgba(255,42,109,0.1)]'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        alert.status === 'unread'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{alert.hostname || 'Unknown Device'}</span>
                        <span className="text-[10px] text-rose-400 font-bold">{alert.mac_address}</span>
                        {alert.status === 'unread' && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500 text-black text-[9px] font-black">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{alert.message}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                        <span>Router: {alert.router_name}</span>
                        <span>•</span>
                        <span>{alert.created_at}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                    <button
                      onClick={() => openWhitelistModal({ mac_address: alert.mac_address, hostname: alert.hostname })}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-black font-mono text-[10px] font-black hover:bg-emerald-400 shadow-[0_0_10px_rgba(0,255,157,0.3)] transition-all"
                    >
                      WHITELIST MAC
                    </button>
                    {alert.status === 'unread' && (
                      <button
                        onClick={() => handleDismissAlert(alert.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px]"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 5: AUDIT LOGS ──────────────────────────────────────────────── */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-heading">Router Security Audit Trail</h3>
              <p className="text-xs text-slate-400">Immutable ledger of scans, auth checks, and device detections.</p>
            </div>
            <button
              onClick={fetchAllData}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 font-mono text-xs max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                    {log.event_type}
                  </span>
                  <span className="text-slate-200">{log.details}</span>
                  {log.router_name && (
                    <span className="text-cyan-400 text-[11px]">[{log.router_name}]</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 flex-shrink-0">{log.created_at}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── MODAL: ADD ROUTER ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-950 border border-emerald-500/30 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white font-heading">Add Authorized Router</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRouter} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Router Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tenda TX2 Pro (Living Room)"
                    value={routerForm.name}
                    onChange={(e) => setRouterForm({ ...routerForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Router Brand</label>
                    <select
                      value={routerForm.brand}
                      onChange={(e) => {
                        const brand = e.target.value;
                        setRouterForm({
                          ...routerForm,
                          brand,
                          model: brand === 'Tenda' ? 'TX2 Pro Wi-Fi 6' : 'NC21 AC1200',
                          ip_address: brand === 'Tenda' ? '192.168.0.1' : '192.168.1.1',
                        });
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Tenda">Tenda Router</option>
                      <option value="Netis">Netis Router (NC21)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Model Name</label>
                    <input
                      type="text"
                      placeholder="e.g. TX2 Pro / NC21 / F3"
                      value={routerForm.model}
                      onChange={(e) => setRouterForm({ ...routerForm, model: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1">IP Address / Gateway</label>
                    <input
                      type="text"
                      required
                      placeholder="192.168.0.1"
                      value={routerForm.ip_address}
                      onChange={(e) => setRouterForm({ ...routerForm, ip_address: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Port</label>
                    <input
                      type="number"
                      value={routerForm.port}
                      onChange={(e) => setRouterForm({ ...routerForm, port: parseInt(e.target.value) || 80 })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Admin Username</label>
                    <input
                      type="text"
                      value={routerForm.username}
                      onChange={(e) => setRouterForm({ ...routerForm, username: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Admin Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Router admin password"
                        value={routerForm.password}
                        onChange={(e) => setRouterForm({ ...routerForm, password: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500 pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Scan Interval</label>
                    <select
                      value={routerForm.auto_scan_interval}
                      onChange={(e) => setRouterForm({ ...routerForm, auto_scan_interval: parseInt(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value={30}>Every 30 Seconds</option>
                      <option value={60}>Every 1 Minute</option>
                      <option value={300}>Every 5 Minutes</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="mon_en"
                      checked={routerForm.monitoring_enabled}
                      onChange={(e) => setRouterForm({ ...routerForm, monitoring_enabled: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                    />
                    <label htmlFor="mon_en" className="text-slate-300">
                      Enable Active Scan
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,157,0.3)]"
                  >
                    Save & Initialize Router
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: EDIT ROUTER ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && selectedRouter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white font-heading">Edit Router Configuration</h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateRouter} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Router Display Name</label>
                  <input
                    type="text"
                    required
                    value={routerForm.name}
                    onChange={(e) => setRouterForm({ ...routerForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">IP Address / Gateway</label>
                    <input
                      type="text"
                      required
                      value={routerForm.ip_address}
                      onChange={(e) => setRouterForm({ ...routerForm, ip_address: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">New Password (Optional)</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep existing"
                      value={routerForm.password}
                      onChange={(e) => setRouterForm({ ...routerForm, password: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Auto-Scan Interval</label>
                    <select
                      value={routerForm.auto_scan_interval}
                      onChange={(e) => setRouterForm({ ...routerForm, auto_scan_interval: parseInt(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value={30}>Every 30 Seconds</option>
                      <option value={60}>Every 1 Minute</option>
                      <option value={300}>Every 5 Minutes</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="edit_mon_en"
                      checked={routerForm.monitoring_enabled}
                      onChange={(e) => setRouterForm({ ...routerForm, monitoring_enabled: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-cyan-500"
                    />
                    <label htmlFor="edit_mon_en" className="text-slate-300">
                      Monitoring Active
                    </label>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-black font-bold hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL: WHITELIST & CUSTOM NAME ─────────────────────────────────── */}
      <AnimatePresence>
        {isWhitelistModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-3xl bg-slate-950 border border-emerald-500/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white font-heading">Authorize & Name Device</h3>
                </div>
                <button
                  onClick={() => setIsWhitelistModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveWhitelist} className="space-y-3.5 font-mono text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">MAC Address (Normalized)</label>
                  <input
                    type="text"
                    required
                    placeholder="AA:BB:CC:11:22:33"
                    value={whitelistTarget.mac_address}
                    onChange={(e) => setWhitelistTarget({ ...whitelistTarget, mac_address: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Custom Friendly Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahim's Phone, Office MacBook"
                    value={whitelistTarget.custom_name}
                    onChange={(e) => setWhitelistTarget({ ...whitelistTarget, custom_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Owner / Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahim"
                      value={whitelistTarget.owner_name}
                      onChange={(e) => setWhitelistTarget({ ...whitelistTarget, owner_name: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Device Type</label>
                    <select
                      value={whitelistTarget.device_type}
                      onChange={(e) => setWhitelistTarget({ ...whitelistTarget, device_type: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="phone">Smartphone</option>
                      <option value="laptop">Laptop / PC</option>
                      <option value="tv">Smart TV / Media</option>
                      <option value="iot">IoT / Camera</option>
                      <option value="other">Other Device</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_k_check"
                    checked={whitelistTarget.is_known}
                    onChange={(e) => setWhitelistTarget({ ...whitelistTarget, is_known: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-500"
                  />
                  <label htmlFor="is_k_check" className="text-slate-300">
                    Mark as Approved Known Device (Suppress Alerts)
                  </label>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsWhitelistModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(0,255,157,0.3)]"
                  >
                    Save & Whitelist
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* ─── INSTANT PERMISSION / NEW UNKNOWN DEVICE MODAL ───────────────── */}
        {permissionAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border-2 border-rose-500 shadow-[0_0_50px_rgba(255,42,109,0.35)] relative overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse flex-shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-300 animate-pulse">
                      PASSWORD ACCEPTED • NEW WI-FI CLIENT
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white font-heading mt-1">
                    Permission Alert: Device Connected!
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Someone just connected to your Wi-Fi with the password. This MAC is unapproved.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] uppercase">MAC Address</span>
                  <span className="text-white font-bold tracking-wider">{permissionAlert.mac_address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] uppercase">IP Address</span>
                  <span className="text-emerald-400 font-bold">{permissionAlert.ip_address || 'DHCP Pending'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] uppercase">Network Band</span>
                  <span className="text-cyan-300 font-bold">
                    {(permissionAlert.connection_type || '').includes('5G') ? '5GHz Ultra High-Speed' : '2.4GHz Wi-Fi'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[11px] uppercase">Hostname</span>
                  <span className="text-slate-300 font-bold truncate max-w-[200px]">{permissionAlert.hostname || 'Mobile Client'}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    openWhitelistModal(permissionAlert);
                    setDismissedAlertIds((prev) => new Set([...prev, permissionAlert.id]));
                    setPermissionAlert(null);
                  }}
                  className="w-full sm:flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs transition-all shadow-[0_0_20px_rgba(0,255,157,0.35)] flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 stroke-[3]" />
                  <span>APPROVE & SET NAME (WHITELIST)</span>
                </button>

                <button
                  onClick={() => {
                    if (permissionAlert.id) handleDismissAlert(permissionAlert.id);
                    setDismissedAlertIds((prev) => new Set([...prev, permissionAlert.id]));
                    setPermissionAlert(null);
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs transition-all border border-slate-700"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RouterManager;
