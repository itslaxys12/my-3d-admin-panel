import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Maximize,
  Minimize,
  SlidersHorizontal,
  User,
  Shield,
  LogOut,
  Bot,
  Crown,
  Menu,
} from 'lucide-react';
import AnimatedButton from '../UI/AnimatedButton';
import { APP_CONFIG } from '../../utils/constants';

export function Navbar({ isCollapsed, onOpenSettings, onLogout, onOpenRoleManager, onToggleMobileMenu, onOpenWallpapers }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 border-b border-cyan-500/20 bg-slate-950/45 backdrop-blur-xl transition-all duration-300 flex items-center justify-between px-3 sm:px-6 left-0 ${
        isCollapsed ? 'md:left-20' : 'md:left-64'
      }`}
    >
      {/* Mobile Menu Hamburger Button & Compact Brand */}
      <div className="flex items-center gap-2.5 md:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:text-white hover:border-emerald-500/40 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,255,157,0.2)]"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-400/50 shadow-[0_0_10px_rgba(0,255,157,0.3)] bg-black flex-shrink-0">
            <img src="/assets/images/gmx_logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-xs tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-heading">
            GMX MATRIX
          </span>
        </div>
      </div>
      {/* Search Bar */}
      <div className="relative max-w-md w-full hidden sm:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search Earth nodes, bots, slash commands... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-12 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 transition-all font-sans"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live Cluster Pill */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>GLITCH BOT ONLINE • 14ms</span>
        </div>

        {/* Anime Nature Live Wallpapers Switcher */}
        {onOpenWallpapers && (
          <button
            onClick={onOpenWallpapers}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:border-emerald-400/60 hover:shadow-[0_0_15px_rgba(0,255,157,0.35)] active:scale-95 transition-all flex items-center gap-1.5"
            title="Anime Nature Live Wallpapers (MotionBGS)"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline text-xs font-mono font-bold">Wallpapers</span>
          </button>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Quick Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
            title="3D Render Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        )}

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ff007f]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-slate-950/95 border border-cyan-500/30 p-4 shadow-2xl backdrop-blur-2xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-200">Matrix Alerts</span>
                <span className="text-[10px] font-mono text-cyan-400">3 New</span>
              </div>
              <div className="space-y-2 mt-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-cyan-500/20">
                  <p className="font-semibold text-cyan-300">Earth Node Dhaka Synced</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">3D telemetry latency 8ms</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/20">
                  <p className="font-semibold text-purple-300">Glitch Bot Shield Active</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Anti-nuke verified across 64 guilds</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dynamic Role Clearance */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="relative cursor-pointer group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-emerald-400 shadow-[0_0_12px_rgba(0,255,157,0.3)] bg-black">
              <img src="/assets/images/gmx_logo.jpg" alt="User Profile" className="w-full h-full object-cover" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
          </div>

          <div className="hidden md:block text-left">
            {(() => {
              let user = {};
              try {
                user = JSON.parse(localStorage.getItem('glitch_auth_user') || '{}');
              } catch {}
              const role = user.role || localStorage.getItem('glitch_user_role') || 'owner';
              const isOwner = role === 'owner';
              const isManager = role === 'manager';
              return (
                <>
                  <p className="text-xs font-bold text-slate-200 leading-tight font-heading">
                    {user.username || APP_CONFIG.adminName}
                  </p>
                  <p className={`text-[10px] font-mono font-bold ${
                    isOwner ? 'text-amber-400' : isManager ? 'text-cyan-400' : 'text-purple-400'
                  }`}>
                    {isOwner ? '★ OWNER COMMANDER' : isManager ? '⚡ MATRIX MANAGER' : '👤 MEMBER USER'}
                  </p>
                </>
              );
            })()}
          </div>

          {/* Owner Role Manager Button */}
          {(() => {
            let role = 'owner';
            try {
              const u = JSON.parse(localStorage.getItem('glitch_auth_user') || '{}');
              role = u.role || localStorage.getItem('glitch_user_role') || 'owner';
            } catch {}
            if (role === 'owner' && onOpenRoleManager) {
              return (
                <button
                  onClick={onOpenRoleManager}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                  title="Manage User Roles"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Roles</span>
                </button>
              );
            }
            return null;
          })()}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all ml-1"
              title="Logout from Matrix"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
