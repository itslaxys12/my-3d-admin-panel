export const APP_CONFIG = {
  appName: 'Glitch Matrix',
  version: 'v3.2.0-CYBER',
  adminName: 'Glitch Matrix',
  adminRole: 'Matrix Commander',
};

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Matrix Core', icon: 'LayoutDashboard', badge: null },
  { id: 'bot_control', label: 'GMX Bot Hub', icon: 'Bot', badge: 'Discord' },
  { id: 'bot_invite', label: 'Bot Invite Studio', icon: 'Bot', badge: 'GMX' },
  { id: 'analytics', label: '3D Analytics', icon: 'Activity', badge: 'Live' },
  { id: 'media', label: 'Media & Visuals', icon: 'Film', badge: 'New' },
  { id: 'crypto_radar', label: 'Crypto Moonshot Radar', icon: 'Coins', badge: 'VIP Owner', ownerOnly: true },
  { id: 'wifi_manager', label: 'WiFi Control Hub', icon: 'Wifi', badge: '3 Floors' },
  { id: 'settings', label: 'Settings', icon: 'Settings', badge: null },
];

export const KPI_METRICS = [
  {
    id: 'discord_bot_engine',
    title: 'Discord Bot Engine',
    value: 'ACTIVE 24/7',
    change: 'Shield ON',
    isPositive: true,
    icon: 'ShieldCheck',
    color: 'emerald',
  },
  {
    id: 'bot_guilds',
    title: 'Discord & Telegram Bots',
    value: '64 Guilds • 18 TG Groups',
    change: 'Active',
    isPositive: true,
    icon: 'Bot',
    color: 'purple',
  },
  {
    id: 'voice_ai_stream',
    title: 'Voice AI Stream',
    value: '18.4 kbit/s',
    change: 'Ultra Low Ping',
    isPositive: true,
    icon: 'Mic',
    color: 'pink',
  },
  {
    id: 'security_shield',
    title: 'Quantum Shield',
    value: '100% Secure',
    change: 'Anti-Inspect Armed',
    isPositive: true,
    icon: 'ShieldCheck',
    color: 'green',
  },
];

export const RECENT_LOGS = [
  { id: 1, time: '13:58:15', event: 'Discord Gateway & Telegram Webhook synchronized', status: 'success', tag: 'Bot Gateway' },
  { id: 2, time: '13:56:50', event: 'Planet Earth Satellite Orbital Sync: Node Dhaka connected', status: 'info', tag: '3D Earth' },
  { id: 3, time: '13:52:12', event: 'Voice AI Neural TTS Synthesizer active on GPU #1', status: 'success', tag: 'Voice AI' },
  { id: 4, time: '13:48:01', event: 'Security Shield: Developer Tools & Right-Click protection armed', status: 'success', tag: 'Security Shield' },
  { id: 5, time: '13:45:22', event: 'Matrix Engine locked at 400+ FPS (1.8ms Frame Time)', status: 'info', tag: 'WebGL' },
];

export const EARTH_GEO_NODES = [
  { id: 'dhaka', name: 'Dhaka Node', lat: 23.8103, lon: 90.4125, status: 'Online', ping: '8ms', color: '#00f0ff' },
  { id: 'tokyo', name: 'Tokyo Core', lat: 35.6762, lon: 139.6503, status: 'Active', ping: '22ms', color: '#00ff9d' },
  { id: 'london', name: 'London Hub', lat: 51.5074, lon: -0.1278, status: 'Optimal', ping: '18ms', color: '#a855f7' },
  { id: 'newyork', name: 'New York Relay', lat: 40.7128, lon: -74.0060, status: 'Active', ping: '14ms', color: '#ff007f' },
  { id: 'singapore', name: 'Singapore Gateway', lat: 1.3521, lon: 103.8198, status: 'Optimal', ping: '12ms', color: '#00f0ff' },
  { id: 'frankfurt', name: 'Frankfurt Cluster', lat: 50.1109, lon: 8.6821, status: 'Online', ping: '20ms', color: '#eab308' },
];

export const BOT_STATUS_DATA = {
  discordBot: {
    name: 'Glitch Matrix Discord Bot',
    status: 'Online',
    ping: '14ms',
    guilds: 64,
    users: '28,450',
    voiceChannels: 12,
  },
  telegramBot: {
    name: 'Glitch Matrix Telegram Bot (@GlitchMatrixBot)',
    status: 'Online',
    webhook: 'Connected (HTTPS)',
    groups: 18,
    activeSubscribers: '9,240',
  },
};

export const BOT_COMMANDS = [
  { command: '/status', desc: 'Display real-time Bot cluster health and WebGL latency', category: 'General' },
  { command: '/tg broadcast [msg]', desc: 'Broadcast instant announcement to all Telegram channels', category: 'Telegram' },
  { command: '/voice join', desc: 'Connect Glitch Voice AI synthesizer to voice channel', category: 'Voice AI' },
  { command: '/security audit', desc: 'Perform real-time role & permission security vulnerability scan', category: 'Security' },
  { command: '/matrix sync', desc: 'Synchronize 3D Earth nodes with Discord & Telegram telemetry', category: '3D Matrix' },
  { command: '/play [query]', desc: 'Stream high-fidelity cyber audio with spatial equalizer', category: 'Music' },
  { command: '/purge [count]', desc: 'Safely bulk delete spam messages with security logging', category: 'Admin' },
];

export const MODEL_PRESETS = [
  {
    id: 'planet_earth',
    name: 'Interactive 3D Planet Earth',
    geometry: 'Earth',
    color: '#00f0ff',
    roughness: 0.2,
    metalness: 0.3,
    wireframe: false,
    speed: 0.008,
    description: 'High-detail 3D Earth globe with original satellite artwork, lunar orbit, and spatial nodes.',
  },
  {
    id: 'cyber_core',
    name: 'Quantum Cyber Core',
    geometry: 'Icosahedron',
    color: '#00f0ff',
    roughness: 0.15,
    metalness: 0.85,
    wireframe: false,
    speed: 0.015,
    description: 'High-density holographic data kernel with dynamic vertex displacement.',
  },
  {
    id: 'plasma_torus',
    name: 'Plasma Torus Knot',
    geometry: 'TorusKnot',
    color: '#a855f7',
    roughness: 0.2,
    metalness: 0.9,
    wireframe: true,
    speed: 0.02,
    description: 'Electromagnetic energy field visualization with cyber wireframe harmonics.',
  },
];

export const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'GMX. Premium Cyber Core',
    category: 'GMX Brand',
    tag: 'Official Emblem',
    url: '/assets/images/gmx_logo.jpg',
    prompt: 'Hyper-detailed 3D metallic cyberpunk GMX logo with radiant green neon matrix illumination, deep obsidian reflections, encrypted admin HUD markers, and glowing high-voltage grid geometry.',
    description: 'The official GMX Glitch Matrix core identity. High-contrast neon green with encrypted administrative telemetry and metallic bevels.',
  },
  {
    id: 2,
    title: 'Monarch of the Shadow Matrix',
    category: 'Dark Anime',
    tag: 'Monochrome',
    url: '/assets/images/dark_monarch.jpg',
    prompt: 'Masterpiece dark anime illustration, crowned white-haired sovereign in high-collar dark coat, blackened ink splatter crown halo, dramatic cloudy storm sky, high contrast cinematic monochrome.',
    description: 'Dark anime monarch silhouette crowned with a blackened stardust halo amidst a brooding atmospheric rainstorm.',
  },
  {
    id: 3,
    title: 'Spider-Verse Cyber Urban Graffiti',
    category: 'Spider Cyber',
    tag: 'Comic Art',
    url: '/assets/images/spider_cyber.jpg',
    prompt: 'Stylized comic book Spider-Man action portrait with layered halftone typography, bold graffiti lettering, urban web-slinger reflections, vibrant red suit with glowing white lens eyes.',
    description: 'Dynamic street-art inspired Spider-Man composition layered over comic newsprint, halftone dots, and gritty urban textures.',
  },
  {
    id: 4,
    title: 'Earth Satellite Orbital Matrix',
    category: '3D Planet',
    tag: 'Orbital Art',
    url: '/assets/images/earth_original.png',
    prompt: 'Original photorealistic satellite perspective of planet Earth with luminous atmospheric halo, active oceanic depth, satellite telemetry nodes, and deep cosmos void.',
    description: 'Original high-definition satellite artwork of Earth with spatial orbital telemetry and celestial lighting.',
  },
];
