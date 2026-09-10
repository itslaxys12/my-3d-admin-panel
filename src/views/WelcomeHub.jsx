import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Crown, Shield, ShieldCheck, Hash, MessageSquare, Image as ImageIcon,
  Check, AlertTriangle, ExternalLink, Save, Send, RefreshCw, Lock, Unlock, X,
  Zap, Info, Radio, Server, CheckCircle2, ChevronDown, Smile, Video, ArrowRight,
  Flame, Heart, Bell, Music, Play, Layers, Eye
} from 'lucide-react';
import GlassCard from '../components/UI/GlassCard';
import AnimatedButton from '../components/UI/AnimatedButton';
import { getApiBase } from '../utils/apiConfig';

const API = getApiBase();

// 20+ High-Tech Cyberpunk, Anime, Gaming, Retrowave Animated GIF & Video Templates
const ANIMATION_TEMPLATES = [
  {
    id: 'danger_hex_panel',
    name: 'DANGER HEX Matrix Banner',
    category: 'Cyber Glitch',
    badge: 'HEX OFFICIAL',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHp1MGpqY2Z4Z285Nmd4YnY3Y201Z2tzc3B1YW5pOWZqMWo5dWhqZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9IgzoKnwFNmISR8I/giphy.gif',
    preview_image: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/200.gif',
    recommended_headline: 'DANGER HEX ⚡ || Panel.Project.Chilling .',
    recommended_slogan: 'Stay With Us !! ❤️',
  },
  {
    id: 'cyber_ninja_red',
    name: 'Red Aura Cyber Ninja',
    category: 'Anime Gaming',
    badge: 'VIP ELITE',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDVnNnM2Ym1jYm10bmdyeXRidmhrZTNudmdyeW5wY2tpdGZ0dWxpeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/f6P20EYU672FdR0gfQ/giphy.gif',
    preview_image: 'https://media.giphy.com/media/f6P20EYU672FdR0gfQ/200.gif',
    recommended_headline: 'HEX COMMUNITY 💥 | Cyber Warrior Portal',
    recommended_slogan: 'Unleash The Cyber Matrix! ⚔️',
  },
  {
    id: 'neon_tokyo_rain',
    name: 'Tokyo Midnight Rain',
    category: 'Anime Aesthetic',
    badge: 'CHILL VIBES',
    media_type: 'gif',
    gif_url: 'https://i.giphy.com/media/3o7TKTDnUxE0gpn344/giphy.gif',
    preview_image: 'https://i.giphy.com/media/3o7TKTDnUxE0gpn344/200.gif',
    recommended_headline: 'Welcome to Tokyo Midnight 🌧️',
    recommended_slogan: 'Chill in Voice & Listen to 192kbps Lofi ❤️',
  },
  {
    id: 'cyber_samurai_glow',
    name: 'Neon Blade Samurai',
    category: 'Cyberpunk',
    badge: 'LEGENDARY',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3Q5dWl6MTRwbWJqYmt4dGlhN3dpNzN1NDV2bDBhOHJucnV4aDhnZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L1R1tvI9svkIWwpVYr/giphy.gif',
    preview_image: 'https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/200.gif',
    recommended_headline: '⚡ THE SHADOW GUILD // Welcome',
    recommended_slogan: 'Rules in #rules • Enter the Battleground 🛡️',
  },
  {
    id: 'matrix_code_stream',
    name: 'Quantum Matrix Terminal',
    category: 'Sci-Fi Code',
    badge: 'QUANTUM',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW82bmN5a3J4NDdvZXoxYWNmdmhpZWZ0dDF4czVwdG45bXZkZXh3ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPnAiaMCws8nOsE/giphy.gif',
    preview_image: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/200.gif',
    recommended_headline: 'GMX QUANTUM COMMAND // Node Verified',
    recommended_slogan: 'Security Protocols Active 24/7 🚀',
  },
  {
    id: 'neon_dragon_plasma',
    name: 'Neon Dragon Plasma Burst',
    category: 'Gaming VIP',
    badge: 'DRAGON',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2psZWg4Z3R5OWtzbXB4a3QzaGQwNnQ0dXozOGN2dHlzZWtrZDFzOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif',
    preview_image: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/200.gif',
    recommended_headline: '🐉 DRAGON REALM // Royal Welcomer',
    recommended_slogan: 'Honor the Guild • Rise in Ranks ⚔️',
  },
  {
    id: 'synthwave_sunset_runner',
    name: 'Synthwave Sunset Highway',
    category: 'Retrowave',
    badge: 'RETRO 80S',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGxleDN4NDQxb2N0M2Z2b2I3azFpcnVxdXpnN3drMzFndzF2NzdiciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ov9jG3eSUe9t9i2vK/giphy.gif',
    preview_image: 'https://media.giphy.com/media/3ov9jG3eSUe9t9i2vK/200.gif',
    recommended_headline: '🌴 RETROWAVE PARADISE // Night City',
    recommended_slogan: 'Cruising into the Future ✨',
  },
  {
    id: 'anime_sakura_storm',
    name: 'Sakura Petal Blizzard',
    category: 'Anime Nature',
    badge: 'BLOSSOM',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWl6aW5zNzZmaDNkOHV3dGhhazlzbjkyNWtrMmxyOW9zM3F2czRmaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YrkK0A2mS3EPRyIHz7/giphy.gif',
    preview_image: 'https://media.giphy.com/media/YrkK0A2mS3EPRyIHz7/200.gif',
    recommended_headline: '🌸 SAKURA SANCTUARY // Welcome Home',
    recommended_slogan: 'Peace, Friendship & Gaming 💖',
  },
  {
    id: 'shadow_monarch_purple',
    name: 'Shadow Monarch Purple Void',
    category: 'Anime VIP',
    badge: 'ARISE',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjFhNnVnd3RjZ3h2bnY0cnhkY3h6ODR1b2d3ZjJ4c2Vld2J6d2F4dSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/DYB4CXrXI95BQEPdX3/giphy.gif',
    preview_image: 'https://media.giphy.com/media/DYB4CXrXI95BQEPdX3/200.gif',
    recommended_headline: '👑 THE SHADOW LEGION // Welcome',
    recommended_slogan: 'Arise and claim your destiny 🛡️',
  },
  {
    id: 'cyber_hacker_terminal_green',
    name: 'Cyber Breach Terminal CLI',
    category: 'Hacker',
    badge: 'ROOT ACCESS',
    media_type: 'gif',
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExenFscWZtc2tmdXpsZjNwbTN2MDR5c3N3YWd6NHdpdHVzdTN3MWU0MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eCqFYAVjjD0GY/giphy.gif',
    preview_image: 'https://media.giphy.com/media/eCqFYAVjjD0GY/200.gif',
    recommended_headline: '💻 GMX MAINFRAME // Access Granted',
    recommended_slogan: 'Root User Detected • Welcome 🌐',
  },
];

// Preset Emoji suggestions
const EMOJI_OPTIONS = {
  rules: ['📜', '🛡️', '⚖️', '📌', '⚔️', '📕', '🔒'],
  chat: ['💬', '⚡', '☕', '🎮', '💭', '🚀', '🔥'],
  announce: ['📢', '🔔', '💎', '🚨', '🌟', '📣', '✨'],
  headline: ['✨', '🎉', '👑', '🧿', '💫', '⚡', '🌸'],
  slogan: ['❤️', '🔥', '⚡', '💫', '💎', '⚔️', '💖'],
};

export function WelcomeHub({ userRole = 'owner' }) {
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('glitch_auth_user') || '{}');
    } catch {
      return {};
    }
  })();

  const isMasterOwner =
    userRole === 'owner' ||
    localStorage.getItem('glitch_user_role') === 'owner' ||
    currentUser?.username?.toLowerCase() === 'shahon' ||
    currentUser?.role === 'owner';

  // Guilds fetched from the bot
  const [guilds, setGuilds] = useState([]);
  const [guildsLoading, setGuildsLoading] = useState(false);
  const [selectedGuildId, setSelectedGuildId] = useState(() => {
    return localStorage.getItem('gmx_welcome_guild_id') || '';
  });

  // Welcome configuration state
  const [isVip, setIsVip] = useState(false);
  const [welcomeChannelId, setWelcomeChannelId] = useState('');
  const [rulesChannelId, setRulesChannelId] = useState('');
  const [chatChannelId, setChatChannelId] = useState('');
  const [announceChannelId, setAnnounceChannelId] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [welcomeHeadline, setWelcomeHeadline] = useState('');
  const [customMessage, setCustomMessage] = useState('Stay With Us !!');
  const [bannerGifUrl, setBannerGifUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [footerText, setFooterText] = useState('Thanks for joining! 🧿');
  const [autoRoleName, setAutoRoleName] = useState('Member');
  const [mediaType, setMediaType] = useState('gif');

  // Custom Emoji states
  const [rulesEmoji, setRulesEmoji] = useState('📜');
  const [chatEmoji, setChatEmoji] = useState('💬');
  const [announceEmoji, setAnnounceEmoji] = useState('📢');
  const [headlineEmoji, setHeadlineEmoji] = useState('✨');
  const [sloganEmoji, setSloganEmoji] = useState('❤️');

  // Security Toggles
  const [antiToxicEnabled, setAntiToxicEnabled] = useState(true);
  const [antiNukeEnabled, setAntiNukeEnabled] = useState(true);
  const [mediaShieldEnabled, setMediaShieldEnabled] = useState(true);

  // Status & Templates
  const [templates, setTemplates] = useState(ANIMATION_TEMPLATES);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingWelcome, setTestingWelcome] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // VIP Modal
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipKeyInput, setVipKeyInput] = useState('');
  const [vipActivating, setVipActivating] = useState(false);
  const [vipError, setVipError] = useState('');

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Fetch connected Guilds
  const fetchGuilds = useCallback(async () => {
    setGuildsLoading(true);
    try {
      const res = await fetch(`${API}/api/bot/guilds`);
      if (res.ok) {
        const data = await res.json();
        if (data.guilds && data.guilds.length > 0) {
          setGuilds(data.guilds);
          if (!selectedGuildId) {
            setSelectedGuildId(data.guilds[0].id);
          }
        }
      }
    } catch {
      showToast('Could not connect to Bot API.', 'error');
    } finally {
      setGuildsLoading(false);
    }
  }, [selectedGuildId]);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  // Filter accessible guilds (Master Owner can see all; Regular User sees only their assigned server)
  const accessibleGuilds = isMasterOwner
    ? guilds
    : guilds.slice(0, 1);

  const currentGuild =
    accessibleGuilds.find((g) => g.id === selectedGuildId) || accessibleGuilds[0];

  // 2. Fetch templates from server
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(`${API}/api/bot/welcome_templates`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setTemplates(data);
          }
        }
      } catch {}
    };
    fetchTemplates();
  }, []);

  // 3. Load configuration for active guild
  const loadGuildConfig = useCallback(async (guildId) => {
    if (!guildId) return;
    setLoadingConfig(true);
    try {
      const res = await fetch(`${API}/api/bot/guild/${guildId}/welcome_config`);
      if (res.ok) {
        const data = await res.json();
        setIsVip(!!data.is_premium);
        setWelcomeChannelId(data.welcome_channel_id || '');
        setRulesChannelId(data.rules_channel_id || '');
        setChatChannelId(data.chat_channel_id || '');
        setAnnounceChannelId(data.announce_channel_id || '');
        setAuthorName(data.author_name || (currentGuild ? `${currentGuild.name} ⚡ || Panel.Project.Chilling .` : 'HEX COMMUNITY ⚡ || Panel.Project.Chilling .'));
        setWelcomeHeadline(data.welcome_headline || (currentGuild ? `Welcome to ${currentGuild.name}!!` : 'Welcome to our server!!'));
        setCustomMessage(data.custom_message || 'Stay With Us !!');
        setBannerGifUrl(data.banner_gif_url || '');
        setThumbnailUrl(data.thumbnail_url || '');
        setFooterText(data.footer_text || 'Thanks for joining! 🧿');
        setAutoRoleName(data.auto_role_name || 'Member');
        setMediaType(data.media_type || 'gif');

        setRulesEmoji(data.rules_emoji || '📜');
        setChatEmoji(data.chat_emoji || '💬');
        setAnnounceEmoji(data.announce_emoji || '📢');
        setHeadlineEmoji(data.headline_emoji || '✨');
        setSloganEmoji(data.slogan_emoji || '❤️');

        setAntiToxicEnabled(data.anti_toxic_enabled !== 0);
        setAntiNukeEnabled(data.anti_nuke_enabled !== 0);
        setMediaShieldEnabled(data.media_shield_enabled !== 0);
      }
    } catch {
      showToast('Could not load guild configuration.', 'error');
    } finally {
      setLoadingConfig(false);
    }
  }, [currentGuild]);

  useEffect(() => {
    if (currentGuild?.id) {
      loadGuildConfig(currentGuild.id);
      localStorage.setItem('gmx_welcome_guild_id', currentGuild.id);
    }
  }, [currentGuild?.id, loadGuildConfig]);

  // Handle template selection
  const handleSelectTemplate = (tpl) => {
    if (!isVip) {
      setShowVipModal(true);
      return;
    }
    setBannerGifUrl(tpl.gif_url);
    setMediaType(tpl.media_type || 'gif');
    if (tpl.recommended_headline && !authorName) {
      setAuthorName(tpl.recommended_headline);
    }
    if (tpl.recommended_slogan && (!customMessage || customMessage === 'Stay With Us !!')) {
      setCustomMessage(tpl.recommended_slogan);
    }
    showToast(`Applied animation: "${tpl.name}"!`);
  };

  // Handle Emoji Selection
  const handleSelectEmoji = (field, emojiVal) => {
    if (!isVip) {
      setShowVipModal(true);
      return;
    }
    if (field === 'rules') setRulesEmoji(emojiVal);
    if (field === 'chat') setChatEmoji(emojiVal);
    if (field === 'announce') setAnnounceEmoji(emojiVal);
    if (field === 'headline') setHeadlineEmoji(emojiVal);
    if (field === 'slogan') setSloganEmoji(emojiVal);
  };

  // Save Config
  const handleSaveConfig = async () => {
    if (!currentGuild?.id) return;
    setSavingConfig(true);
    try {
      const payload = {
        welcome_channel_id: welcomeChannelId,
        rules_channel_id: rulesChannelId,
        chat_channel_id: chatChannelId,
        announce_channel_id: announceChannelId,
        server_title: currentGuild.name,
        author_name: authorName,
        welcome_headline: welcomeHeadline,
        custom_message: customMessage,
        banner_gif_url: bannerGifUrl,
        thumbnail_url: thumbnailUrl,
        footer_text: footerText,
        auto_role_name: autoRoleName,
        rules_emoji: rulesEmoji,
        chat_emoji: chatEmoji,
        announce_emoji: announceEmoji,
        headline_emoji: headlineEmoji,
        slogan_emoji: sloganEmoji,
        media_type: mediaType,
        anti_toxic_enabled: antiToxicEnabled,
        anti_nuke_enabled: antiNukeEnabled,
        media_shield_enabled: mediaShieldEnabled,
      };

      const res = await fetch(`${API}/api/bot/guild/${currentGuild.id}/welcome_config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 403) {
        setShowVipModal(true);
        return;
      }

      if (res.ok) {
        showToast('Configuration saved successfully!');
      } else {
        const err = await res.json();
        showToast(err.detail || err.error || 'Failed to save configuration.', 'error');
      }
    } catch {
      showToast('Network error while saving.', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  // Send Live Test to Discord
  const handleTestWelcome = async () => {
    if (!currentGuild?.id) return;
    if (!welcomeChannelId) {
      showToast('Please select a Welcome Channel first before testing.', 'error');
      return;
    }

    setTestingWelcome(true);
    try {
      await handleSaveConfig();
      const res = await fetch(`${API}/api/bot/guild/${currentGuild.id}/test_welcome`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Test Welcome Embed posted to Discord successfully!');
      } else {
        showToast(data.detail || data.error || 'Failed to dispatch test card.', 'error');
      }
    } catch {
      showToast('Network error triggering test welcome.', 'error');
    } finally {
      setTestingWelcome(false);
    }
  };

  // Activate VIP Key
  const handleActivateVip = async (e) => {
    e.preventDefault();
    if (!vipKeyInput.trim() || !currentGuild?.id) return;

    setVipActivating(true);
    setVipError('');

    try {
      const res = await fetch(`${API}/api/bot/guild/${currentGuild.id}/activate_vip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: vipKeyInput.trim(),
          username: currentUser?.username || 'Owner',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsVip(true);
        setShowVipModal(false);
        setVipKeyInput('');
        showToast('👑 VIP Premium Lifetime activated successfully for this server!');
      } else {
        setVipError(data.detail || 'Invalid VIP Activation Key. Please verify or contact @shahon.');
      }
    } catch {
      setVipError('Network connection failed. Please try again.');
    } finally {
      setVipActivating(false);
    }
  };

  const textChannels = currentGuild?.text_channels || [];
  const rulesChannelObj = textChannels.find((c) => c.id === rulesChannelId);
  const chatChannelObj = textChannels.find((c) => c.id === chatChannelId);
  const announceChannelObj = textChannels.find((c) => c.id === announceChannelId);

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 font-mono text-xs border backdrop-blur-xl transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-500 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
          }`}
        >
          {toastMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner: Server Identity & Plan Status */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,157,0.12)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {currentGuild?.icon ? (
              <img
                src={currentGuild.icon}
                alt={currentGuild.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-[0_0_20px_rgba(0,255,157,0.3)]"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-2xl font-mono shadow-[0_0_20px_rgba(0,255,157,0.2)]">
                {currentGuild?.name ? currentGuild.name.substring(0, 2).toUpperCase() : 'GX'}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-emerald-500/50">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {isVip ? (
                <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>VIP LIFETIME ACTIVE</span>
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>FREE PLAN ACTIVE</span>
                </span>
              )}

              {isMasterOwner && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
                  ★ MASTER OWNER ACCESS
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-heading mt-1 flex items-center gap-2">
              <span>{currentGuild?.name || 'Discord Welcome Hub'}</span>
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Dedicated server welcome builder, custom emojis, animated GIF/video banners, and security defense matrix.
            </p>
          </div>
        </div>

        {/* Server Switcher Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {accessibleGuilds.length > 1 && (
            <div className="relative">
              <select
                value={selectedGuildId}
                onChange={(e) => setSelectedGuildId(e.target.value)}
                className="appearance-none bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 text-slate-200 text-xs font-mono rounded-xl px-4 py-2.5 pr-9 focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer shadow-lg"
              >
                {accessibleGuilds.map((g) => (
                  <option key={g.id} value={g.id} className="bg-slate-950 text-slate-200">
                    {g.name} ({g.id})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          )}

          {!isVip && (
            <button
              onClick={() => setShowVipModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95"
            >
              <Crown className="w-4 h-4 fill-slate-950" />
              <span>Upgrade to VIP</span>
            </button>
          )}

          <AnimatedButton
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={() => loadGuildConfig(currentGuild?.id)}
            disabled={loadingConfig}
            className={loadingConfig ? 'animate-spin' : ''}
          >
            Sync Config
          </AnimatedButton>
        </div>
      </div>

      {/* Side-By-Side Plan Overview (Free Plan vs VIP Premium Plan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Plan 1: Free Tier */}
        <div className={`p-5 rounded-2xl border transition-all ${
          !isVip
            ? 'bg-slate-900/80 border-emerald-500/40 shadow-[0_0_20px_rgba(0,255,157,0.15)]'
            : 'bg-slate-950/60 border-slate-800 opacity-70'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200 font-mono">🟢 FREE PLAN</h3>
            </div>
            {!isVip && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                CURRENT SERVER PLAN
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Essential automated welcome embed and security for everyday servers.</p>
          <div className="mt-3 space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Basic Welcome Embed card on new member join</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Channel routing selector (#welcome, #rules, #chat)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standard Auto-Role assignment (e.g. Member)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full Music & Voice commands (!song, !join, !stop)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 line-through">
              <X className="w-3.5 h-3.5 text-slate-600" />
              <span>Animated GIF / Video Banners (Locked)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 line-through">
              <X className="w-3.5 h-3.5 text-slate-600" />
              <span>Custom Emoji Selector (Locked)</span>
            </div>
          </div>
        </div>

        {/* Plan 2: VIP Premium Plan */}
        <div className={`p-5 rounded-2xl border transition-all ${
          isVip
            ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-black border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
            : 'bg-slate-950/80 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
              <h3 className="text-sm font-bold text-amber-300 font-mono">👑 GMX VIP PREMIUM</h3>
            </div>
            {isVip ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                LIFETIME UNLOCKED
              </span>
            ) : (
              <button
                onClick={() => setShowVipModal(true)}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
              >
                ENTER LICENSE KEY
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">Maximum aesthetic customization, rich animated media, and anti-nuke defense.</p>
          <div className="mt-3 space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2 text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>20+ Animated Cyberpunk & Anime GIF/Video Banners</span>
            </div>
            <div className="flex items-center gap-2 text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom GIF & MP4 Video URL / Direct Uploads</span>
            </div>
            <div className="flex items-center gap-2 text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom Emojis for Rules, Chat, Announce & Slogans</span>
            </div>
            <div className="flex items-center gap-2 text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Custom Cyber Ninja / Anime Avatars & Server Logos</span>
            </div>
            <div className="flex items-center gap-2 text-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Advanced Anti-Nuke Shield (Instant Ban on channel/role delete)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Configuration Panel (Left) & Real-Time Discord Live Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Channel Routing */}
          <GlassCard
            title="Channel Routing Matrix"
            subtitle="Configure which Discord channels receive the welcome card and rich mentions"
            icon={Hash}
            glowColor="cyan"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Welcome Channel */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold text-cyan-300 flex items-center justify-between">
                  <span>🚪 Welcome Card Channel</span>
                  <span className="text-[10px] text-slate-400 font-normal">Where the join card is sent</span>
                </label>
                <select
                  value={welcomeChannelId}
                  onChange={(e) => setWelcomeChannelId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="">Select text channel...</option>
                  {textChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rules Channel Mention */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>📜 Rules Channel</span>
                  <span className="text-[10px] text-slate-500">Mentioned in card</span>
                </label>
                <select
                  value={rulesChannelId}
                  onChange={(e) => setRulesChannelId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
                >
                  <option value="">No mention (or select channel)</option>
                  {textChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Public Chat Mention */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>💬 Public Chat Channel</span>
                  <span className="text-[10px] text-slate-500">Mentioned in card</span>
                </label>
                <select
                  value={chatChannelId}
                  onChange={(e) => setChatChannelId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
                >
                  <option value="">No mention (or select channel)</option>
                  {textChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Announcements Channel Mention */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>📢 Announcements Channel</span>
                  <span className="text-[10px] text-slate-500">Mentioned in card</span>
                </label>
                <select
                  value={announceChannelId}
                  onChange={(e) => setAnnounceChannelId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
                >
                  <option value="">No mention (or select channel)</option>
                  {textChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </GlassCard>

          {/* Card 2: Custom Emoji Selection Center */}
          <GlassCard
            title="Custom Emoji Customizer"
            subtitle="Pick your preferred emojis for rules, chat, announcements, headline and slogan"
            icon={Smile}
            glowColor="emerald"
            action={
              !isVip && (
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP
                </span>
              )
            }
          >
            <div className="space-y-4">
              {/* Rules Emoji */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{rulesEmoji}</span>
                  <span className="text-xs font-mono text-slate-300">Rules Line Emoji</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.rules.map((em) => (
                    <button
                      key={em}
                      onClick={() => handleSelectEmoji('rules', em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        rulesEmoji === em
                          ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(0,255,157,0.5)] scale-110'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={rulesEmoji}
                    onChange={(e) => isVip ? setRulesEmoji(e.target.value) : setShowVipModal(true)}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-slate-200"
                    placeholder="Custom"
                  />
                </div>
              </div>

              {/* Chat Emoji */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{chatEmoji}</span>
                  <span className="text-xs font-mono text-slate-300">Public Chat Emoji</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.chat.map((em) => (
                    <button
                      key={em}
                      onClick={() => handleSelectEmoji('chat', em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        chatEmoji === em
                          ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(0,255,157,0.5)] scale-110'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={chatEmoji}
                    onChange={(e) => isVip ? setChatEmoji(e.target.value) : setShowVipModal(true)}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-slate-200"
                    placeholder="Custom"
                  />
                </div>
              </div>

              {/* Announcements Emoji */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{announceEmoji}</span>
                  <span className="text-xs font-mono text-slate-300">Announcements Emoji</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.announce.map((em) => (
                    <button
                      key={em}
                      onClick={() => handleSelectEmoji('announce', em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        announceEmoji === em
                          ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(0,255,157,0.5)] scale-110'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={announceEmoji}
                    onChange={(e) => isVip ? setAnnounceEmoji(e.target.value) : setShowVipModal(true)}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-slate-200"
                    placeholder="Custom"
                  />
                </div>
              </div>

              {/* Slogan Emoji */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sloganEmoji}</span>
                  <span className="text-xs font-mono text-slate-300">Slogan Accent Emoji</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {EMOJI_OPTIONS.slogan.map((em) => (
                    <button
                      key={em}
                      onClick={() => handleSelectEmoji('slogan', em)}
                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                        sloganEmoji === em
                          ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(0,255,157,0.5)] scale-110'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={sloganEmoji}
                    onChange={(e) => isVip ? setSloganEmoji(e.target.value) : setShowVipModal(true)}
                    className="w-14 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-center text-slate-200"
                    placeholder="Custom"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Card 3: Embed Text Customizer */}
          <GlassCard
            title="Embed Typography & Content"
            subtitle="Author line, greeting headline, custom slogan, and footer text"
            icon={MessageSquare}
            glowColor="purple"
          >
            <div className="space-y-4">
              {/* Author Row */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>Author / Header Title</span>
                  <span className="text-[10px] text-slate-500">Top of embed card</span>
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="HEX COMMUNITY ⚡ || Panel.Project.Chilling ."
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Welcome Headline</span>
                  <span className="text-[10px] text-slate-500">First line in description</span>
                </label>
                <input
                  type="text"
                  value={welcomeHeadline}
                  onChange={(e) => setWelcomeHeadline(e.target.value)}
                  placeholder="Welcome to our server!!"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Slogan */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Slogan / Closing Message</span>
                  <span className="text-[10px] text-slate-500">Bold text under links</span>
                </label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Stay With Us !!"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Footer Text */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Footer Text</label>
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Thanks for joining! 🧿"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                {/* Auto-Role Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300">Auto-Role on Join</label>
                  <input
                    type="text"
                    value={autoRoleName}
                    onChange={(e) => setAutoRoleName(e.target.value)}
                    placeholder="Member"
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Card 4: VIP Animated Banners & Video Library */}
          <GlassCard
            title="Animated Video & GIF Banners Gallery"
            subtitle="Pick any animation or video from the gallery or enter your custom GIF / MP4 URL"
            icon={Video}
            glowColor="purple"
            action={
              !isVip && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP ONLY
                </span>
              )
            }
          >
            <div className="space-y-4">
              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
                {templates.map((tpl) => {
                  const isSelected = bannerGifUrl === tpl.gif_url;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => handleSelectTemplate(tpl)}
                      className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'border-emerald-400 shadow-[0_0_20px_rgba(0,255,157,0.4)] scale-[1.02]'
                          : 'border-slate-800 hover:border-slate-600 bg-slate-950'
                      }`}
                    >
                      <div className="h-28 w-full overflow-hidden bg-black relative">
                        <img
                          src={tpl.preview_image || tpl.gif_url}
                          alt={tpl.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                        <div className="absolute top-2 right-2">
                          {isSelected ? (
                            <span className="p-1 rounded-md bg-emerald-500 text-black font-bold">
                              <Check className="w-3.5 h-3.5" />
                            </span>
                          ) : !isVip ? (
                            <span className="p-1 rounded-md bg-black/70 text-amber-400 border border-amber-500/40">
                              <Lock className="w-3 h-3" />
                            </span>
                          ) : null}
                        </div>

                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-300 border border-emerald-500/40">
                          {tpl.badge}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-900/90">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{tpl.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{tpl.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom GIF / Video URL Input */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-purple-400" />
                    <span>Custom Animated GIF / Video Banner URL</span>
                  </span>
                  {!isVip && (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> VIP Feature
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={bannerGifUrl}
                    onChange={(e) => {
                      if (!isVip && e.target.value.trim()) {
                        setShowVipModal(true);
                      } else {
                        setBannerGifUrl(e.target.value);
                      }
                    }}
                    placeholder="https://media.giphy.com/.../banner.gif or https://.../banner.mp4"
                    className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-400"
                  />
                  {bannerGifUrl && (
                    <button
                      onClick={() => setBannerGifUrl('')}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Avatar Thumbnail */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Custom Top-Right Thumbnail Avatar (Ninja / Server Logo)</span>
                  <span className="text-[10px] text-slate-500">Leave blank for member's avatar</span>
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://.../ninja_avatar.png"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </GlassCard>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-mono text-slate-400">
              Active Channel: <strong className="text-emerald-300">#{textChannels.find((c) => c.id === welcomeChannelId)?.name || 'None'}</strong>
            </div>

            <div className="flex items-center gap-3">
              <AnimatedButton
                variant="secondary"
                size="md"
                icon={Send}
                onClick={handleTestWelcome}
                disabled={testingWelcome || !welcomeChannelId}
                className="active:scale-95"
              >
                {testingWelcome ? 'Sending...' : 'Send Test Welcome'}
              </AnimatedButton>

              <AnimatedButton
                variant="primary"
                size="md"
                icon={Save}
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold shadow-[0_0_20px_rgba(0,255,157,0.4)] active:scale-95"
              >
                {savingConfig ? 'Saving...' : 'Save Configuration'}
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Discord Live Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Discord Message Preview</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Client Live Simulation
            </span>
          </div>

          {/* Mock Discord Chat Container */}
          <div className="rounded-2xl bg-[#313338] border border-slate-700/60 p-4 font-sans text-slate-200 shadow-2xl space-y-3 select-none">
            {/* Channel header */}
            <div className="flex items-center gap-2 pb-2 border-b border-[#3f4147] text-xs font-semibold text-slate-400">
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="text-slate-200">
                {textChannels.find((c) => c.id === welcomeChannelId)?.name || 'welcome'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">| Gateway</span>
            </div>

            {/* Message Row */}
            <div className="flex items-start gap-3">
              {/* Bot Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden bg-black shrink-0 border border-[#232428]">
                <img
                  src="/assets/images/gmx_logo.jpg"
                  alt="GMX BOT"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                {/* Author info */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">GMX BOT</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#5865f2] text-white text-[10px] font-bold tracking-wide">
                    BOT
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Today at 10:28 PM</span>
                </div>

                {/* Plain Greeting */}
                <div className="text-xs text-slate-200">
                  👋 Welcome <span className="text-[#00a8fc] hover:underline cursor-pointer">@Shahon</span>! 🎉
                </div>

                {/* THE RICH EMBED CARD (Exact clone of user screenshot) */}
                <div className="rounded-md bg-[#2b2d31] border-l-4 border-[#00ff9d] p-3.5 space-y-3 mt-1.5 shadow-md">
                  {/* Author Line */}
                  <div className="flex items-center gap-2">
                    {currentGuild?.icon ? (
                      <img
                        src={currentGuild.icon}
                        alt="Guild"
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-black text-[10px] text-emerald-400 flex items-center justify-center font-bold">
                        HX
                      </div>
                    )}
                    <span className="text-xs font-semibold text-white truncate">
                      {authorName || `${currentGuild?.name || 'HEX COMMUNITY'} ⚡ || Panel.Project.Chilling .`}
                    </span>
                  </div>

                  {/* Body: Thumbnail on right, text on left */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 text-xs leading-relaxed flex-1">
                      {/* Headline with custom emoji */}
                      <div className="font-bold text-slate-100 text-sm">
                        {headlineEmoji} {welcomeHeadline || `Welcome to ${currentGuild?.name || 'our server'}!!`}
                      </div>

                      {/* Rules Link with custom emoji */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span>{rulesEmoji}</span>
                        <span className="font-semibold text-slate-200">Rules</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#35373c] text-[#00a8fc] font-mono text-[11px] hover:underline cursor-pointer">
                          #{rulesChannelObj?.name || 'rules'}
                        </span>
                        <span className="text-slate-400 font-bold">· RULES</span>
                      </div>

                      {/* Public Chat Link with custom emoji */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span>{chatEmoji}</span>
                        <span className="font-semibold text-slate-200">Chat in</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#35373c] text-[#00a8fc] font-mono text-[11px] hover:underline cursor-pointer">
                          #{chatChannelObj?.name || 'public-chat'}
                        </span>
                        <span className="text-slate-400 font-bold">· PUBLIC · CHAT</span>
                      </div>

                      {/* Announcement Link with custom emoji */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span>{announceEmoji}</span>
                        <span className="font-semibold text-slate-200">Announce</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#35373c] text-[#00a8fc] font-mono text-[11px] hover:underline cursor-pointer">
                          #{announceChannelObj?.name || 'announcements'}
                        </span>
                        <span className="text-slate-400 font-bold">· ANNOUNCEMENTS</span>
                      </div>

                      {/* Slogan with custom emoji */}
                      <div className="pt-2 font-bold text-slate-100 text-sm">
                        {customMessage || 'Stay With Us !!'} {sloganEmoji}
                      </div>
                    </div>

                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 border border-slate-700">
                      <img
                        src={thumbnailUrl || currentGuild?.icon || '/assets/images/gmx_logo.jpg'}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Animated Banner GIF Image (VIP Feature) */}
                  {bannerGifUrl ? (
                    <div className="rounded-lg overflow-hidden border border-slate-800 bg-black mt-2">
                      <img
                        src={bannerGifUrl}
                        alt="Welcome Banner"
                        className="w-full h-44 object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setShowVipModal(true)}
                      className="rounded-lg border-2 border-dashed border-slate-700 hover:border-amber-400/60 p-4 text-center cursor-pointer transition-all bg-slate-950/40 mt-2 group"
                    >
                      <Crown className="w-6 h-6 text-amber-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono font-bold text-amber-300 block">
                        👑 VIP Animated GIF & Video Banner Slot
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Click to select an aesthetic anime/cyberpunk animation
                      </span>
                    </div>
                  )}

                  {/* Footer Row */}
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-sans">
                    {currentGuild?.icon && (
                      <img
                        src={currentGuild.icon}
                        alt="Server"
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    )}
                    <span>{footerText || 'Thanks for joining! 🧿'}</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">Today at 10:28 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 👑 VIP UPGRADE MODAL 👑 */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button
              onClick={() => setShowVipModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                <Crown className="w-8 h-8 text-slate-950 fill-slate-950" />
              </div>
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-heading">
                GMX VIP Premium Studio
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Unlock high-fidelity animated GIF banners, custom emojis & anti-nuke defense for <strong>{currentGuild?.name}</strong>.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-slate-900/60 border border-amber-500/20 text-xs font-mono">
              <div className="flex items-center gap-2.5 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>20+ Animated GIF & MP4 Banners (DANGER HEX, Matrix, Cyber Samurai)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Emoji Picker (Rules, Chat, Announce & Slogan)</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Anime & Cyber Ninja Thumbnail Avatars</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Advanced Anti-Nuke Shield & Attachment Media Protection</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Permanent Lifetime Guild License (No monthly fee)</span>
              </div>
            </div>

            {/* License Key Activation Form */}
            <form onSubmit={handleActivateVip} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-amber-300 flex items-center justify-between">
                  <span>VIP License / Promo Key</span>
                  <span className="text-[10px] text-slate-500 font-normal">e.g. GMX-VIP-2026</span>
                </label>
                <input
                  type="text"
                  value={vipKeyInput}
                  onChange={(e) => setVipKeyInput(e.target.value)}
                  placeholder="Enter key (e.g. GMX-VIP-2026)"
                  className="w-full bg-slate-950 border-2 border-amber-500/40 rounded-xl px-4 py-3 text-xs font-mono text-amber-200 uppercase tracking-widest focus:outline-none focus:border-amber-400"
                />
              </div>

              {vipError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{vipError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={vipActivating || !vipKeyInput.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs font-mono uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all active:scale-95 disabled:opacity-50"
              >
                {vipActivating ? 'Verifying License...' : 'Activate Lifetime VIP Now'}
              </button>

              {isMasterOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setVipKeyInput('SHAHON-OWNER-CLEARANCE');
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-mono border border-amber-500/30"
                >
                  ★ Fill Owner Clearance Key
                </button>
              )}
            </form>

            <div className="text-center text-[11px] font-mono text-slate-500">
              Need a license key? Contact Server Owner <span className="text-amber-400 font-bold">@shahon</span> or enter your promotional code.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeHub;
