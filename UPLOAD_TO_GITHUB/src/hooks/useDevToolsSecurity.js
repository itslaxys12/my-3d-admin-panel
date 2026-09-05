import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiBase } from '../utils/apiConfig';

const LOCKDOWN_KEY = 'gmx_lockdown_until';
const BAN_DURATION_MS = 180 * 1000; // 3 minutes = 180 seconds

// Multi-storage persistence helpers (prevents bypass via simple localStorage clearing)
const persistBan = (untilTimestamp) => {
  const val = untilTimestamp.toString();
  try {
    localStorage.setItem(LOCKDOWN_KEY, val);
  } catch {}
  try {
    sessionStorage.setItem(LOCKDOWN_KEY, val);
  } catch {}
  try {
    const maxAge = Math.ceil((untilTimestamp - Date.now()) / 1000);
    if (maxAge > 0) {
      document.cookie = `${LOCKDOWN_KEY}=${val}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  } catch {}
};

const getPersistedBan = () => {
  // Check localStorage
  try {
    const ls = localStorage.getItem(LOCKDOWN_KEY);
    if (ls) return parseInt(ls, 10);
  } catch {}

  // Check sessionStorage
  try {
    const ss = sessionStorage.getItem(LOCKDOWN_KEY);
    if (ss) return parseInt(ss, 10);
  } catch {}

  // Check Cookie
  try {
    const match = document.cookie.match(new RegExp('(^|; )' + LOCKDOWN_KEY + '=([^;]+)'));
    if (match && match[2]) return parseInt(match[2], 10);
  } catch {}

  return null;
};

const clearPersistedBan = () => {
  try { localStorage.removeItem(LOCKDOWN_KEY); } catch {}
  try { sessionStorage.removeItem(LOCKDOWN_KEY); } catch {}
  try { document.cookie = `${LOCKDOWN_KEY}=; path=/; max-age=0`; } catch {}
};

export function useDevToolsSecurity() {
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const isLockedRef = useRef(false);
  isLockedRef.current = isLocked;

  // Report ban to backend server to enforce IP & account ban across all tabs and sessions
  const reportBanToBackend = async (reason = 'DevTools inspection violation') => {
    try {
      let username = '';
      const storedUser = localStorage.getItem('glitch_auth_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          username = parsed.username || '';
        } catch {
          username = storedUser;
        }
      }
      const apiBase = getApiBase();
      await fetch(`${apiBase}/api/security/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, reason }),
      });
    } catch {
      // Continue client lockdown even if network request fails
    }
  };

  // Trigger 3-minute lockdown
  const triggerBan = useCallback((reason = 'DevTools inspection detected') => {
    if (isLockedRef.current) return;
    const until = Date.now() + BAN_DURATION_MS;
    persistBan(until);
    setIsLocked(true);
    setRemainingSeconds(180);
    reportBanToBackend(reason);
  }, []);

  // Sync server ban status on startup (catches users opening fresh incognito tab or clearing local storage)
  const syncServerStatus = useCallback(async () => {
    try {
      let username = '';
      const storedUser = localStorage.getItem('glitch_auth_user');
      if (storedUser) {
        try {
          username = JSON.parse(storedUser).username || '';
        } catch {
          username = storedUser;
        }
      }
      const apiBase = getApiBase();
      const query = username ? `?username=${encodeURIComponent(username)}` : '';
      const res = await fetch(`${apiBase}/api/security/status${query}`);
      if (res.ok) {
        const data = await res.json();
        if (data.banned && data.remaining_seconds > 0) {
          const until = Date.now() + data.remaining_seconds * 1000;
          persistBan(until);
          setIsLocked(true);
          setRemainingSeconds(data.remaining_seconds);
        }
      }
    } catch {}
  }, []);

  const checkStatus = useCallback(() => {
    const until = getPersistedBan();
    if (!until) {
      setIsLocked(false);
      setRemainingSeconds(0);
      return;
    }
    const now = Date.now();
    if (now < until) {
      setIsLocked(true);
      setRemainingSeconds(Math.ceil((until - now) / 1000));
    } else {
      clearPersistedBan();
      setIsLocked(false);
      setRemainingSeconds(0);
    }
  }, []);

  // Tick countdown timer every 1s
  useEffect(() => {
    checkStatus();
    syncServerStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [checkStatus, syncServerStatus]);

  // Listen for API 403 Ban events dispatched across the app
  useEffect(() => {
    const handleSecurityBanEvent = (e) => {
      const rem = e.detail?.remaining_seconds || 180;
      const until = Date.now() + rem * 1000;
      persistBan(until);
      setIsLocked(true);
      setRemainingSeconds(rem);
    };

    window.addEventListener('gmx-security-ban', handleSecurityBanEvent);
    return () => window.removeEventListener('gmx-security-ban', handleSecurityBanEvent);
  }, []);

  // Multi-vector DevTools Detection Traps
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Keyboard Shortcut Trap (F12, Ctrl+Shift+I/J/C/M, Ctrl+U, Cmd+Option+I/J/C/M/U)
    const handleKeyDown = (e) => {
      const isF12 = e.key === 'F12' || e.keyCode === 123;
      const isCtrlInspect = (e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c', 'M', 'm'].includes(e.key);
      const isViewSource = (e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key);

      if (isF12 || isCtrlInspect || isViewSource) {
        e.preventDefault();
        e.stopPropagation();
        triggerBan(
          (e.key === 'M' || e.key === 'm')
            ? 'DevTools Device Toolbar shortcut violation (Ctrl+Shift+M)'
            : 'Keyboard shortcut inspect violation'
        );
        return false;
      }
    };

    // 2. Right-Click Context Menu Trap
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 3. Window Dimension Differential Trap (Detects docked devtools in any tab)
    const checkWindowSize = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        triggerBan('Window dimension differential (docked DevTools)');
      }
    };

    // 4. Debugger Timing Execution Trap (Catches detached DevTools and pre-opened tabs)
    const checkDebuggerTiming = () => {
      const start = performance.now();
      // eslint-disable-next-line no-debugger
      debugger;
      const elapsed = performance.now() - start;
      if (elapsed > 100) {
        triggerBan('Debugger timing execution anomaly (DevTools open)');
      }
    };

    // 5. Console Object Inspection Getter Trap
    const checkConsoleInspection = () => {
      try {
        const dummy = new Image();
        Object.defineProperty(dummy, 'id', {
          get: function () {
            triggerBan('Console element inspector triggered');
          },
        });
        console.log('%c', dummy);
        console.clear();
      } catch {}
    };

    // 6. Chrome DevTools Device Toolbar / Phone Emulation Trap
    const checkDeviceToolbarEmulation = () => {
      // Vector A: Responsive / Mobile viewport emulation inside desktop browser window
      if (window.outerWidth > 800 && window.innerWidth <= 550) {
        triggerBan('Device Toolbar emulation anomaly (viewport mismatch)');
        return;
      }

      // Vector B: User-Agent / Platform mismatch spoofing
      const ua = navigator.userAgent || '';
      const isMobileUA = /iPhone|iPad|Android|Mobile/i.test(ua);
      const isDesktopPlatform = /Win32|Win64|MacIntel/i.test(navigator.platform || '') || navigator.userAgentData?.platform === 'Windows';
      if (isMobileUA && isDesktopPlatform) {
        triggerBan('Device Toolbar mobile user-agent spoofing detected');
        return;
      }

      // Vector C: Responsive dimension disparity
      if (window.outerWidth > 1000 && window.outerWidth - window.innerWidth > 450) {
        triggerBan('Device Toolbar responsive dimension mismatch');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('resize', checkWindowSize);
    window.addEventListener('resize', checkDeviceToolbarEmulation);

    // Run initial checks on load
    checkWindowSize();
    checkDeviceToolbarEmulation();
    checkConsoleInspection();

    // Periodic detection loop for detached/pre-opened devtools and device toolbar
    const detectInterval = setInterval(() => {
      checkWindowSize();
      checkDeviceToolbarEmulation();
      checkDebuggerTiming();
    }, 2000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('resize', checkWindowSize);
      window.removeEventListener('resize', checkDeviceToolbarEmulation);
      clearInterval(detectInterval);
    };
  }, [triggerBan]);

  return {
    isLocked,
    remainingSeconds,
    triggerBan,
  };
}

export default useDevToolsSecurity;
