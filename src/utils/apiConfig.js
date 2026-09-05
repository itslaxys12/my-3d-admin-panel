// Centralized API & WebSocket Configuration
// Automatically routes to Railway backend when running on Vercel

export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    // When hosted on Vercel, connect directly to Railway backend
    if (window.location.hostname.includes('vercel.app')) {
      return 'https://web-production-038e0.up.railway.app';
    }
  }
  return '';
};

export const getWsBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('vercel.app')) {
      return 'wss://web-production-038e0.up.railway.app';
    }
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${window.location.host}`;
  }
  return 'ws://localhost:8765';
};

export const safeFetchJson = async (endpoint, options = {}) => {
  const base = getApiBase();
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();

  let data = {};
  if (text && text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned unexpected response (${res.status}): ${text.slice(0, 120)}`);
    }
  }

  if (!res.ok) {
    throw new Error(data.detail || data.message || `Request failed with status ${res.status}`);
  }

  return data;
};
