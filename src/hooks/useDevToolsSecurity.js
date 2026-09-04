import { useState, useEffect, useCallback } from 'react';

const LOCKDOWN_KEY = 'gmx_lockdown_until';
const BAN_DURATION_MS = 180 * 1000; // 3 minutes = 180 seconds

export function useDevToolsSecurity() {
  const [isLocked, setIsLocked] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Trigger 3-minute ban
  const triggerBan = useCallback(() => {
    const until = Date.now() + BAN_DURATION_MS;
    localStorage.setItem(LOCKDOWN_KEY, until.toString());
    setIsLocked(true);
    setRemainingSeconds(180);
  }, []);

  const checkStatus = useCallback(() => {
    const stored = localStorage.getItem(LOCKDOWN_KEY);
    if (!stored) {
      setIsLocked(false);
      setRemainingSeconds(0);
      return;
    }
    const until = parseInt(stored, 10);
    const now = Date.now();
    if (now < until) {
      setIsLocked(true);
      setRemainingSeconds(Math.ceil((until - now) / 1000));
    } else {
      localStorage.removeItem(LOCKDOWN_KEY);
      setIsLocked(false);
      setRemainingSeconds(0);
    }
  }, []);

  // Tick countdown timer every 1s
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 1000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Security event listeners: keydown, contextmenu, resize/devtools check
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Keyboard Shortcut Trap (F12, Ctrl+Shift+I/J/C, Ctrl+U)
    const handleKeyDown = (e) => {
      const isF12 = e.key === 'F12' || e.keyCode === 123;
      const isInspect = e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key);
      const isViewSource = e.ctrlKey && ['U', 'u'].includes(e.key);

      if (isF12 || isInspect || isViewSource) {
        e.preventDefault();
        e.stopPropagation();
        triggerBan();
        return false;
      }
    };

    // 2. Right Click Trap
    const handleContextMenu = (e) => {
      e.preventDefault();
      // Right-click contextmenu blocked without ban or with ban if repeatedly tried
      return false;
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
    };
  }, [triggerBan]);

  return {
    isLocked,
    remainingSeconds,
    triggerBan,
  };
}

export default useDevToolsSecurity;
