import React, { useState, useEffect, useMemo } from 'react';
import {
  Wifi,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  DollarSign,
  Users,
  ShieldCheck,
  Building2,
  RefreshCw,
  Phone,
  Home,
  Check,
  X,
  Zap,
  Radio,
  ArrowUpRight
} from 'lucide-react';

const STORAGE_KEY = 'gmx_wifi_clients_v1';

// Initial realistic default clients across 1st, 3rd, and 4th floors
const DEFAULT_CLIENTS = [
  // 1st Floor (একতলা)
  {
    id: 'wf-101',
    name: 'তানভীর আহমেদ',
    floor: '1st',
    room: 'রুম ১০২',
    phone: '01712-345678',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 500,
    paidAmount: 500,
    status: 'paid',
    note: 'Archer C6 5GHz подключен',
    updatedAt: '2026-09-01',
  },
  {
    id: 'wf-102',
    name: 'রাকিবুল হাসান',
    floor: '1st',
    room: 'রুম ১০৪',
    phone: '01823-456789',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 500,
    paidAmount: 300,
    status: 'partial',
    note: '২০০ টাকা ১০ তারিখে দিবে',
    updatedAt: '2026-09-02',
  },
  {
    id: 'wf-103',
    name: 'সাকিব আল হাসান (দোকান)',
    floor: '1st',
    room: 'দোকান ১ (নিচতলা)',
    phone: '01934-567890',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 600,
    paidAmount: 0,
    status: 'unpaid',
    note: 'বিল বাকি আছে',
    updatedAt: '2026-09-03',
  },

  // 3rd Floor (তিনতলা)
  {
    id: 'wf-301',
    name: 'ফারহান চৌধুরী',
    floor: '3rd',
    room: 'ফ্ল্যাট ৩-এ',
    phone: '01745-678901',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 600,
    paidAmount: 600,
    status: 'paid',
    note: 'বিকাশে পেইড',
    updatedAt: '2026-09-01',
  },
  {
    id: 'wf-302',
    name: 'আরিফ বিল্লাহ',
    floor: '3rd',
    room: 'ফ্ল্যাট ৩-বি',
    phone: '01656-789012',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 500,
    paidAmount: 500,
    status: 'paid',
    note: 'ক্যাশ পেইড',
    updatedAt: '2026-09-02',
  },
  {
    id: 'wf-303',
    name: 'মেহেদী হাসান শুভ',
    floor: '3rd',
    room: 'রুম ৩-সি',
    phone: '01867-890123',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 500,
    paidAmount: 200,
    status: 'partial',
    note: '৩০০ টাকা বাকি',
    updatedAt: '2026-09-03',
  },

  // 4th Floor (চারতলা)
  {
    id: 'wf-401',
    name: 'মাহমুদুল হক',
    floor: '4th',
    room: 'ফ্ল্যাট ৪-এ',
    phone: '01778-901234',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 600,
    paidAmount: 600,
    status: 'paid',
    note: 'নগদ পেইড',
    updatedAt: '2026-09-01',
  },
  {
    id: 'wf-402',
    name: 'জুবায়ের আল মামুন',
    floor: '4th',
    room: 'ফ্ল্যাট ৪-বি',
    phone: '01989-012345',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 500,
    paidAmount: 500,
    status: 'paid',
    note: 'ফুল পেইড',
    updatedAt: '2026-09-02',
  },
  {
    id: 'wf-403',
    name: 'কাজী ইমরান',
    floor: '4th',
    room: 'রুম ৪-সি',
    phone: '01590-123456',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 500,
    paidAmount: 0,
    status: 'unpaid',
    note: 'মেসেজ দেওয়া হয়েছে',
    updatedAt: '2026-09-04',
  },
];

const FLOOR_CONFIG = {
  '1st': {
    label: 'একতলা (1st Floor)',
    short: 'একতলা',
    color: 'emerald',
    badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    router: 'Router Node 1 (Archer C6 - 1st Fl)',
    speed: '60 Mbps',
    band: '2.4G / 5G Dual',
  },
  '3rd': {
    label: 'তিনতলা (3rd Floor)',
    short: 'তিনতলা',
    color: 'cyan',
    badgeBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    router: 'Router Node 2 (Tenda TX Pro - 3rd Fl)',
    speed: '75 Mbps',
    band: 'Wi-Fi 6 Gigabit',
  },
  '4th': {
    label: 'চারতলা (4th Floor)',
    short: 'চারতলা',
    color: 'purple',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    router: 'Router Node 3 (Xiaomi AX1800 - 4th Fl)',
    speed: '80 Mbps',
    band: 'Mesh High Gain',
  },
};

export default function WifiManager() {
  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CLIENTS;
  });

  const [activeFloor, setActiveFloor] = useState('all'); // 'all' | '1st' | '3rd' | '4th'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'partial' | 'unpaid'
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    floor: '1st',
    room: '',
    phone: '',
    duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
    billAmount: 500,
    paidAmount: 500,
    note: '',
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving WiFi clients to localStorage:', e);
    }
  }, [clients]);

  // Statistics Calculations
  const stats = useMemo(() => {
    let totalClients = clients.length;
    let totalBill = 0;
    let totalPaid = 0;
    let totalDue = 0;

    const floorStats = {
      '1st': { count: 0, paid: 0, due: 0, total: 0 },
      '3rd': { count: 0, paid: 0, due: 0, total: 0 },
      '4th': { count: 0, paid: 0, due: 0, total: 0 },
    };

    clients.forEach((c) => {
      const bill = Number(c.billAmount) || 0;
      const paid = Number(c.paidAmount) || 0;
      const due = Math.max(0, bill - paid);

      totalBill += bill;
      totalPaid += paid;
      totalDue += due;

      if (floorStats[c.floor]) {
        floorStats[c.floor].count += 1;
        floorStats[c.floor].paid += paid;
        floorStats[c.floor].due += due;
        floorStats[c.floor].total += bill;
      }
    });

    return {
      totalClients,
      totalBill,
      totalPaid,
      totalDue,
      floorStats,
    };
  }, [clients]);

  // Filtered Clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Floor filter
      if (activeFloor !== 'all' && c.floor !== activeFloor) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && c.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (c.name || '').toLowerCase().includes(q);
        const matchesRoom = (c.room || '').toLowerCase().includes(q);
        const matchesPhone = (c.phone || '').toLowerCase().includes(q);
        const matchesNote = (c.note || '').toLowerCase().includes(q);
        return matchesName || matchesRoom || matchesPhone || matchesNote;
      }
      return true;
    });
  }, [clients, activeFloor, statusFilter, searchQuery]);

  // Quick Action: Mark as Fully Paid
  const handleQuickMarkPaid = (id) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            paidAmount: c.billAmount,
            status: 'paid',
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return c;
      })
    );
  };

  // Delete client
  const handleDeleteClient = (id, name) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${name}"-কে তালিকা থেকে মুছে ফেলতে চান?`)) {
      setClients((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Open modal for add or edit
  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name || '',
        floor: client.floor || '1st',
        room: client.room || '',
        phone: client.phone || '',
        duration: client.duration || '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
        billAmount: client.billAmount || 500,
        paidAmount: client.paidAmount || 0,
        note: client.note || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        name: '',
        floor: activeFloor !== 'all' ? activeFloor : '1st',
        room: '',
        phone: '',
        duration: '১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)',
        billAmount: 500,
        paidAmount: 500,
        note: '',
      });
    }
    setIsModalOpen(true);
  };

  // Save modal form
  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('অনুগ্রহ করে গ্রাহকের নাম লিখুন।');
      return;
    }

    const bill = Number(formData.billAmount) || 0;
    const paid = Number(formData.paidAmount) || 0;
    let status = 'paid';
    if (paid <= 0) {
      status = 'unpaid';
    } else if (paid < bill) {
      status = 'partial';
    }

    if (editingClient) {
      // Edit existing
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? {
                ...c,
                name: formData.name.trim(),
                floor: formData.floor,
                room: formData.room.trim(),
                phone: formData.phone.trim(),
                duration: formData.duration.trim(),
                billAmount: bill,
                paidAmount: paid,
                status,
                note: formData.note.trim(),
                updatedAt: new Date().toISOString().split('T')[0],
              }
            : c
        )
      );
    } else {
      // Create new
      const newClient = {
        id: `wf-${Date.now()}`,
        name: formData.name.trim(),
        floor: formData.floor,
        room: formData.room.trim(),
        phone: formData.phone.trim(),
        duration: formData.duration.trim(),
        billAmount: bill,
        paidAmount: paid,
        status,
        note: formData.note.trim(),
        updatedAt: new Date().toISOString().split('T')[0],
      };
      setClients((prev) => [newClient, ...prev]);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/80 border border-cyan-500/20 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wider">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>GMX HIGH-SPEED MESH // 3-FLOOR SUITE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-300 to-purple-400 font-heading tracking-wide">
              ওয়াইফাই কন্ট্রোল ও কালেকশন হাব
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
              একতলা, তিনতলা এবং চারতলার ওয়াইফাই ব্যবহারকারীদের তালিকা, মেয়াদ (ডিউরেশন), বিল ও পেমেন্ট কালেকশন পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openModal()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold font-mono text-xs sm:text-sm shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন গ্রাহক যুক্ত করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/30 transition-all backdrop-blur-xl group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 font-medium">মোট গ্রাহক সংখ্যা</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.totalClients} জন</div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-sans">
            <span className="text-emerald-400 font-bold">৩টি ফ্লোরে সক্রিয়</span> • ৩টি রাউটার নোড
          </p>
        </div>

        {/* Total Paid / Collected */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all backdrop-blur-xl group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 font-medium">মোট আদায়কৃত টাকা</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            ৳ {stats.totalPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            মোট বিল: <span className="text-slate-200">৳ {stats.totalBill.toLocaleString()}</span>
          </p>
        </div>

        {/* Total Due */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/30 transition-all backdrop-blur-xl group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 font-medium">মোট বাকি টাকা</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            ৳ {stats.totalDue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            {stats.totalDue > 0 ? (
              <span className="text-amber-400">বকেয়া বিল সংগ্রহ করুন</span>
            ) : (
              <span className="text-emerald-400">কোনো বকেয়া নেই (সব পেইড)</span>
            )}
          </p>
        </div>

        {/* Router Status */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/30 transition-all backdrop-blur-xl group shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-400 font-medium">ওয়াইফাই নেটওয়ার্ক হেলথ</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>৩টি নোডই অনলাইন</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">
            একতলা • তিনতলা • চারতলা (Gigabit)
          </p>
        </div>
      </div>

      {/* 3 Floor Quick Router Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(FLOOR_CONFIG).map(([flKey, flData]) => {
          const flStats = stats.floorStats[flKey] || { count: 0, paid: 0, due: 0 };
          const isSelected = activeFloor === flKey;

          return (
            <div
              key={flKey}
              onClick={() => setActiveFloor(flKey)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className={`w-4 h-4 ${flKey === '1st' ? 'text-emerald-400' : flKey === '3rd' ? 'text-cyan-400' : 'text-purple-400'}`} />
                  <span className="text-sm font-bold text-white font-heading">{flData.label}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {flData.speed}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mb-3">{flData.router}</div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">গ্রাহক: <strong className="text-slate-200">{flStats.count} জন</strong></span>
                <span className="text-emerald-400">আদায়: <strong>৳{flStats.paid}</strong></span>
                <span className={flStats.due > 0 ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                  বাকি: ৳{flStats.due}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Table Card Section */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Table Toolbar & Floor Switcher Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Floor Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveFloor('all')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFloor === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>সব ফ্লোর ({stats.totalClients})</span>
            </button>

            <button
              onClick={() => setActiveFloor('1st')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFloor === '1st'
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>🏢 একতলা ({stats.floorStats['1st'].count})</span>
            </button>

            <button
              onClick={() => setActiveFloor('3rd')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFloor === '3rd'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>🏢 তিনতলা ({stats.floorStats['3rd'].count})</span>
            </button>

            <button
              onClick={() => setActiveFloor('4th')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeFloor === '4th'
                  ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>🏢 চারতলা ({stats.floorStats['4th'].count})</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম, ফোন বা রুম খুঁজুন..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-cyan-500/50 transition-colors"
            >
              <option value="all">সব পেমেন্ট স্ট্যাটাস</option>
              <option value="paid">পেইড (পরিশোধিত)</option>
              <option value="partial">আংশিক বাকি</option>
              <option value="unpaid">বকেয়া (Unpaid)</option>
            </select>
          </div>
        </div>

        {/* Client Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">গ্রাহকের নাম ও রুম</th>
                <th className="py-3.5 px-4 font-semibold">ফ্লোর</th>
                <th className="py-3.5 px-4 font-semibold">ডিউরেশন (মেয়াদ)</th>
                <th className="py-3.5 px-4 font-semibold">মোট বিল</th>
                <th className="py-3.5 px-4 font-semibold">পরিশোধিত</th>
                <th className="py-3.5 px-4 font-semibold">বাকি টাকা</th>
                <th className="py-3.5 px-4 font-semibold">স্ট্যাটাস</th>
                <th className="py-3.5 px-4 font-semibold text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Wifi className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-400">কোনো গ্রাহক পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-600 mt-1">
                      ফিল্টার পরিবর্তন করুন অথবা উপরে "নতুন গ্রাহক যুক্ত করুন" বাটনে ক্লিক করুন।
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const due = Math.max(0, Number(client.billAmount) - Number(client.paidAmount));
                  const flInfo = FLOOR_CONFIG[client.floor] || FLOOR_CONFIG['1st'];

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm flex items-center gap-2">
                          <span>{client.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-[11px] mt-0.5">
                          {client.room && (
                            <span className="flex items-center gap-1">
                              <Home className="w-3 h-3 text-slate-500" />
                              {client.room}
                            </span>
                          )}
                          {client.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {client.phone}
                            </span>
                          )}
                        </div>
                        {client.note && (
                          <div className="text-[10px] text-slate-500 mt-0.5 italic">
                            নোট: {client.note}
                          </div>
                        )}
                      </td>

                      {/* Floor Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${flInfo.badgeBg}`}>
                          {flInfo.short}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 font-mono text-slate-300 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{client.duration}</span>
                        </div>
                      </td>

                      {/* Total Bill */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        ৳ {Number(client.billAmount).toLocaleString()}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        ৳ {Number(client.paidAmount).toLocaleString()}
                      </td>

                      {/* Due Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {due > 0 ? (
                          <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                            ৳ {due.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-500">৳ 0</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {client.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            পেইড
                          </span>
                        ) : client.status === 'partial' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold text-[11px]">
                            <Clock className="w-3 h-3" />
                            আংশিক
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-mono font-bold text-[11px]">
                            <AlertCircle className="w-3 h-3" />
                            বকেয়া
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Mark Paid if not fully paid */}
                          {client.status !== 'paid' && (
                            <button
                              onClick={() => handleQuickMarkPaid(client.id)}
                              title="এক ক্লিকে ফুল পেইড মার্ক করুন"
                              className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => openModal(client)}
                            title="তথ্য এডিট করুন"
                            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            title="ডিলিট করুন"
                            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Wifi className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {editingClient ? 'গ্রাহকের তথ্য এডিট করুন' : 'নতুন ওয়াইফাই গ্রাহক যুক্ত করুন'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">
                  গ্রাহকের নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: তানভীর আহমেদ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Floor Selection & Room */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    ফ্লোর নির্বাচন <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="1st">🏢 একতলা (1st Floor)</option>
                    <option value="3rd">🏢 তিনতলা (3rd Floor)</option>
                    <option value="4th">🏢 চারতলা (4th Floor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    রুম বা ফ্ল্যাট নং
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="যেমন: ফ্ল্যাট ৩-এ"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Phone & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    ফোন নম্বর
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XX-XXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    মেয়াদ / ডিউরেশন
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="১ মাস (০১ সেপ্টেম্বর - ৩০ সেপ্টেম্বর)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Money: Bill Amount & Paid Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    মোট বিল (টাকা ৳) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.billAmount}
                    onChange={(e) => setFormData({ ...formData, billAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    পরিশোধিত টাকা (পেইড ৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Calculated Due Preview */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">হিসাব অনুযায়ী বাকি থাকবে:</span>
                <span className="text-rose-400 font-bold">
                  ৳ {Math.max(0, (Number(formData.billAmount) || 0) - (Number(formData.paidAmount) || 0)).toLocaleString()}
                </span>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">নোট বা মন্তব্য</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="যেমন: বিকাশে দিয়েছে, বা বিশেষ রিকোয়েস্ট"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-mono text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95"
                >
                  {editingClient ? 'সংরক্ষণ করুন' : 'যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
