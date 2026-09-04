import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundCanvas from './components/3d/BackgroundCanvas';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Dashboard from './views/Dashboard';
import BotController from './views/BotController';
import BotInvitePage from './views/BotInvitePage';
import Analytics from './views/Analytics';
import Settings from './views/Settings';
import Login from './views/Login';
import WifiManager from './views/WifiManager';
import ScrollVideoPlayer from './components/media/ScrollVideoPlayer';
import ImageGallery from './components/media/ImageGallery';
import CryptoRadarView from './components/crypto/CryptoRadarView';
import InteractiveEarth from './components/3d/InteractiveEarth';
import InteractiveModel from './components/3d/InteractiveModel';
import GlassCard from './components/UI/GlassCard';
import SecurityLockdown from './components/security/SecurityLockdown';
import BackgroundMusicPlayer from './components/media/BackgroundMusicPlayer';
import AnimatedWallpaperBackground from './components/media/AnimatedWallpaperBackground';
import UserRoleManagerModal from './components/modals/UserRoleManagerModal';
import useDevToolsSecurity from './hooks/useDevToolsSecurity';
import use3DScene from './hooks/use3DScene';
import { MODEL_PRESETS, APP_CONFIG } from './utils/constants';
import { Box, Sparkles, Film, Eye, Globe, Bot, Lock, Crown, ShieldAlert } from 'lucide-react';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('glitch_auth') === 'true';
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(MODEL_PRESETS[0]);
  const [activeBgTexture, setActiveBgTexture] = useState(() => {
    return localStorage.getItem('gmx_active_background') || '';
  });
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);

  const [userRole, setUserRole] = useState(() => {
    let role = 'user';
    try {
      const u = JSON.parse(localStorage.getItem('glitch_auth_user') || '{}');
      role = u.role || localStorage.getItem('glitch_user_role') || 'user';
    } catch {}
    return role;
  });

  useEffect(() => {
    const handleRoleChange = () => {
      try {
        const u = JSON.parse(localStorage.getItem('glitch_auth_user') || '{}');
        setUserRole(u.role || localStorage.getItem('glitch_user_role') || 'owner');
      } catch {}
    };
    window.addEventListener('gmx_roles_updated', handleRoleChange);
    return () => window.removeEventListener('gmx_roles_updated', handleRoleChange);
  }, []);

  useEffect(() => {
    const handleBgChange = (e) => {
      setActiveBgTexture(e.detail || '');
    };
    window.addEventListener('gmx-background-change', handleBgChange);
    return () => window.removeEventListener('gmx-background-change', handleBgChange);
  }, []);

  // 3-Minute DevTools / Inspect Element Lockdown Protection
  const { isLocked, remainingSeconds } = useDevToolsSecurity();

  const {
    mousePos,
    fps,
    quality,
    updateQuality,
    bloomEnabled,
    setBloomEnabled,
    particlesCount,
  } = use3DScene();

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    localStorage.setItem('glitch_auth', 'true');
    if (user && user.role) {
      setUserRole(user.role);
      localStorage.setItem('glitch_user_role', user.role);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('glitch_auth');
    localStorage.removeItem('glitch_auth_user');
    localStorage.removeItem('glitch_user_role');
  };

  // If 3-minute security lockdown is active, lock down entire application
  if (isLocked) {
    return <SecurityLockdown remainingSeconds={remainingSeconds} />;
  }

  // If user is not logged in, render the aesthetic Cyberpunk Login Page
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;

      case 'bot_control':
        // Regular users cannot access internal Bot Controller
        if (userRole === 'user') {
          return (
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-950/90 border border-purple-500/30 text-center space-y-5 max-w-xl mx-auto my-12 shadow-2xl backdrop-blur-xl font-mono">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                <Lock className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">
                  RESTRICTED ACCESS LEVEL
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-3 font-heading">
                  Requires Manager or Owner Clearance
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                  Your account currently has standard <strong>User</strong> privileges. Access to the Discord Bot Controller, .env configuration, audit logs, and Web Terminal is restricted exclusively to the <strong>Owner</strong>.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentTab('bot_invite')}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 text-white font-mono text-xs font-bold hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                >
                  Bot Invite Studio
                </button>
                <button
                  onClick={() => setCurrentTab('media')}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-mono text-xs font-bold hover:bg-slate-700 transition-all"
                >
                  View Showcase Media
                </button>
              </div>
            </div>
          );
        }
        return <BotController onOpenInvitePage={() => setCurrentTab('bot_invite')} />;

      case 'bot_invite':
        return <BotInvitePage onBackToDashboard={() => setCurrentTab('bot_control')} />;

      case 'analytics':
        return <Analytics />;

      case 'media':
        return (
          <div className="space-y-8 pb-12">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-1">
                <Film className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-slate-100 font-heading">3D Visuals & Media Center</h2>
              </div>
              <p className="text-xs text-slate-400">
                Experience volumetric high-definition video playback with 1-click fullscreen, audio unmute, and parallax galleries.
              </p>
            </div>

            {/* High-Definition Smooth Video Player */}
            <ScrollVideoPlayer
              videoSrc="/assets/videos/earth_planet.mp4"
              title="3D Universe & Planet Earth Cinematic Stream"
              subtitle="Full 1080p stream with audio controls and 1-click full screen"
            />

            {/* 3D Perspective Image Showcase */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <h3 className="text-lg font-bold text-slate-100 font-heading">3D Parallax Texture Gallery</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Hover cards to tilt in 3D space</span>
              </div>
              <ImageGallery />
            </div>
          </div>
        );

      case 'earth_lab':
        return (
          <div className="space-y-6 pb-12">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-bold text-slate-100 font-heading">3D Planet Earth & Universe Theater</h2>
              </div>
              <p className="text-xs text-slate-400">
                Direct cinematic space stream without spinning obstruction. Click video to play/pause or maximize to full screen.
              </p>
            </div>

            {/* Edge-to-Edge Cinematic Video Stream */}
            <InteractiveEarth
              height="580px"
              showControls={true}
              title="3D Universe & Planet Earth Cinematic Stream"
              videoSrc="/assets/videos/earth_planet.mp4"
            />
          </div>
        );

      case 'crypto_radar':
        // Strictly guarded for Owner only
        if (userRole !== 'owner') {
          return (
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-950/90 border border-purple-500/40 text-center space-y-5 max-w-xl mx-auto my-12 shadow-2xl backdrop-blur-xl font-mono">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.3)]">
                <Lock className="w-8 h-8 animate-pulse text-amber-400" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold">
                  VIP OWNER CLEARANCE REQUIRED
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-3 font-heading">
                  Restricted Quantum Moonshot Radar
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                  The real-time Crypto Moonshot Radar, live DEX new coin alerts, and 3D predictive analytics are restricted exclusively to the <strong>Server Owner</strong>.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-purple-500 text-white font-mono text-xs font-bold hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          );
        }
        return <CryptoRadarView />;

      case 'wifi_manager':
        return <WifiManager />;

      case 'settings':
        if (userRole === 'user') {
          return (
            <div className="p-8 rounded-3xl bg-slate-950/90 border border-purple-500/30 text-center space-y-4 max-w-lg mx-auto my-12 font-mono">
              <Lock className="w-10 h-10 text-purple-400 mx-auto" />
              <h2 className="text-lg font-bold text-white font-heading">Settings Restricted for User Role</h2>
              <p className="text-xs text-slate-400">
                সিস্টেম সেটিংস ও ব্যাকগ্রাউন্ড কনফিগারেশন পরিবর্তন করতে ম্যানেজার অথবা অনার রোল প্রয়োজন।
              </p>
            </div>
          );
        }
        return (
          <Settings
            quality={quality}
            updateQuality={updateQuality}
            bloomEnabled={bloomEnabled}
            setBloomEnabled={setBloomEnabled}
          />
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050713] text-slate-100 flex flex-col selection:bg-emerald-400 selection:text-black relative overflow-x-hidden">
      {/* Cinematic Animated Anime Warrior Background with Rain & Mist */}
      <AnimatedWallpaperBackground mousePos={mousePos} />

      {/* Top Navbar */}
      <Navbar
        isCollapsed={isCollapsed}
        onOpenSettings={() => setCurrentTab('settings')}
        onLogout={handleLogout}
        onOpenRoleManager={() => setIsRoleManagerOpen(true)}
      />

      {/* Collapsible Sidebar with Role awareness */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        userRole={userRole}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 transition-all duration-300 pt-20 pb-14 px-4 sm:px-8 relative z-10 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Background Welcome Theme Music Player */}
      <BackgroundMusicPlayer isOwner={userRole === 'owner'} />

      {/* Owner User & Role Management Modal */}
      <UserRoleManagerModal
        isOpen={isRoleManagerOpen}
        onClose={() => setIsRoleManagerOpen(false)}
      />

      {/* Bottom Telemetry Footer */}
      <Footer isCollapsed={isCollapsed} fps={fps} />
    </div>
  );
}

export default App;
