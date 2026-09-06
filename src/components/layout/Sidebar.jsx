import React, { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  Film,
  Box,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Layers,
  Bot,
  Globe,
  Lock,
  Coins,
  X,
  Wifi,
  TrendingUp,
} from 'lucide-react';
import { NAV_ITEMS, APP_CONFIG } from '../../utils/constants';

const ICON_MAP = {
  LayoutDashboard,
  Bot,
  Activity,
  Film,
  Globe,
  Coins,
  Wifi,
  TrendingUp,
  Settings,
  Box,
};

export function Sidebar({ currentTab, setCurrentTab, isCollapsed, setIsCollapsed, isMobileOpen = false, setIsMobileOpen, userRole = 'owner' }) {
  const [laserActiveTab, setLaserActiveTab] = useState(null);

  const handleTabClick = (tabId) => {
    setCurrentTab(tabId);
    setLaserActiveTab(tabId);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
    setTimeout(() => {
      setLaserActiveTab(null);
    }, 800);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col justify-between transition-all duration-300 ease-in-out border-r border-cyan-500/20 bg-slate-950/45 md:bg-slate-950/35 backdrop-blur-xl shadow-[4px_0_30px_rgba(0,0,0,0.6)] ${
          isMobileOpen ? 'left-0 w-72 shadow-2xl shadow-emerald-500/10' : '-left-full md:left-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="h-16 flex items-center justify-between px-4 border-b border-cyan-500/20 bg-slate-900/30">
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-400 shadow-[0_0_15px_rgba(0,255,157,0.4)] flex-shrink-0 bg-black">
                  <img src="/assets/images/gmx_logo.jpg" alt="GMX Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-wider font-heading text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400 leading-tight">
                    GLITCH MATRIX
                  </h1>
                  <p className="text-[10px] font-mono text-emerald-400">GMX // CYBER COMMAND</p>
                </div>
              </div>
            )}

            {isCollapsed && !isMobileOpen && (
              <div className="w-10 h-10 mx-auto rounded-xl overflow-hidden border border-emerald-400 shadow-[0_0_15px_rgba(0,255,157,0.4)] flex items-center justify-center bg-black">
                <img src="/assets/images/gmx_logo.jpg" alt="GMX Logo" className="w-full h-full object-cover" />
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors hidden md:block"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Close button for Mobile Drawer */}
            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors md:hidden"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Navigation Items with Laser Line Beam Click Effect */}
        <nav className="p-3 space-y-2 mt-2">
          {NAV_ITEMS.map((item) => {
            // Strictly hide ownerOnly modules (e.g. Crypto Radar) from non-owner accounts
            if (item.ownerOnly && userRole !== 'owner') {
              return null;
            }

            const Icon = ICON_MAP[item.icon] || Box;
            const isActive = currentTab === item.id;
            const isLaserShooting = laserActiveTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`group relative w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden active:scale-95 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_25px_rgba(0,255,157,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active Neon Line Indicator on Left */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_10px_#00ff9d]" />
                )}

                {/* Shooting Cyber Laser Line Beam Effect on Click */}
                {isLaserShooting && (
                  <div className="animate-laser-line" />
                )}

                {/* Top Border Glow Sweep for Active Tab */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                )}

                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-all duration-200 group-hover:scale-125 group-active:scale-90 group-hover:drop-shadow-[0_0_10px_rgba(0,255,157,0.9)] ${
                    isActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(0,255,157,0.8)]' : 'text-slate-400'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {userRole === 'user' && ['bot_control', 'settings'].includes(item.id) ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Lock
                      </span>
                    ) : item.badge ? (
                      <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  </>
);
}

export default Sidebar;
