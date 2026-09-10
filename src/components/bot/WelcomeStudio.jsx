import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Crown, Shield, ShieldCheck, Hash, MessageSquare, Image as ImageIcon,
  Check, AlertTriangle, ExternalLink, Save, Send, RefreshCw, Lock, Unlock, X,
  Zap, Info, Radio, Server, CheckCircle2, ChevronDown, Award, Eye, Copy, Terminal, Music, Volume2, ShieldAlert
} from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import AnimatedButton from '../UI/AnimatedButton';
import { getApiBase } from '../../utils/apiConfig';

const API = getApiBase();

// Default Fallback Animated GIF Templates
const DEFAULT_TEMPLATES = [
  // Tenor Discord Welcome Collection (from user's link https://tenor.com/view/discord-welcome-gif-23878933)
  {
    id: 'tenor_discord_welcome_red',
    name: 'Tenor Neon Red WELCOME Banner',
    category: 'Tenor Discord Welcome',
    badge: 'TRENDING #1',
    gif_url: 'https://media1.tenor.com/m/6wzqcWGfih4AAAAC/discord-welcome.gif',
    preview_image: 'https://media.tenor.com/6wzqcWGfih4AAAAe/discord-welcome.png',
    recommended_headline: '🔥 WELCOME TO OUR SERVER!!',
    recommended_slogan: 'Enjoy your stay & follow the server rules! ❤️',
  },
  {
    id: 'tenor_wumpus_discord_hello',
    name: 'Tenor Wumpus Discord Hello',
    category: 'Tenor Discord Welcome',
    badge: 'DISCORD ICON',
    gif_url: 'https://media.tenor.com/l-ltKxPNF-gAAAAC/wumpus-discord.gif',
    preview_image: 'https://media.tenor.com/l-ltKxPNF-gAAAAC/wumpus-discord.gif',
    recommended_headline: '👋 Wumpus Welcomes You to the Guild!',
    recommended_slogan: 'Say hi to everyone in #chat! ✨',
  },
  {
    id: 'tenor_sunrise_sunset_glow',
    name: 'Tenor Sunrise Sunset Purple Glow',
    category: 'Tenor Discord Welcome',
    badge: 'PURPLE GLOW',
    gif_url: 'https://media.tenor.com/SwfzM4B-iDgAAAAC/sunrise-sunset.gif',
    preview_image: 'https://media.tenor.com/SwfzM4B-iDgAAAAC/sunrise-sunset.gif',
    recommended_headline: '🌅 Sunset Horizon Welcome Card',
    recommended_slogan: 'Vibe with us in voice channels 🎵',
  },
  {
    id: 'tenor_welcome_discord_chime',
    name: 'Tenor Wind Chime Welcome',
    category: 'Tenor Discord Welcome',
    badge: 'PEACEFUL',
    gif_url: 'https://media.tenor.com/EP_XfzfTxoUAAAAC/welcome-discord-image-welcome.gif',
    preview_image: 'https://media.tenor.com/EP_XfzfTxoUAAAAC/welcome-discord-image-welcome.gif',
    recommended_headline: '🎐 Serene Sanctuary Welcome',
    recommended_slogan: 'Peaceful vibes, chill chat & gaming 🌸',
  },
  {
    id: 'tenor_sunset_city_skyline',
    name: 'Tenor Sunset City Skyline Welcome',
    category: 'Tenor Discord Welcome',
    badge: 'CITY VIBES',
    gif_url: 'https://media.tenor.com/9kUtnnOCJz4AAAAC/discord.gif',
    preview_image: 'https://media.tenor.com/9kUtnnOCJz4AAAAC/discord.gif',
    recommended_headline: '🌆 Neon City Hub // Welcome!',
    recommended_slogan: 'Stay tuned for giveaways & tournaments! 🎁',
  },
  {
    id: 'tenor_aesthetic_coffee_welcome',
    name: 'Tenor Aesthetic Coffee Welcome',
    category: 'Tenor Discord Welcome',
    badge: 'LOFI AESTHETIC',
    gif_url: 'https://media.tenor.com/BDaDHtwaGUwAAAAC/aesthetic-discord-welcome-message.gif',
    preview_image: 'https://media.tenor.com/BDaDHtwaGUwAAAAC/aesthetic-discord-welcome-message.gif',
    recommended_headline: '☕ Aesthetic Chill Corner // Welcome to Server',
    recommended_slogan: 'Grab a coffee and chat with us 💫',
  },
  {
    id: 'tenor_cyber_violet_neon_welcome',
    name: 'Tenor Cyber Neon Violet Welcome',
    category: 'Tenor Discord Welcome',
    badge: 'CYBER GLOW',
    gif_url: 'https://media.tenor.com/pHoyZ-wl2G8AAAAC/welcome-gif.gif',
    preview_image: 'https://media.tenor.com/pHoyZ-wl2G8AAAAC/welcome-gif.gif',
    recommended_headline: '⚡ Cyber Glow Nexus Welcome',
    recommended_slogan: 'Verified Member • Access Granted 🌐',
  },
  {
    id: 'tenor_community_hs3_welcome',
    name: 'Tenor Community HS3 Welcome',
    category: 'Tenor Discord Welcome',
    badge: 'COMMUNITY',
    gif_url: 'https://media.tenor.com/LdToNSeF3L0AAAAC/welcomehs3.gif',
    preview_image: 'https://media.tenor.com/LdToNSeF3L0AAAAC/welcomehs3.gif',
    recommended_headline: '🎉 Welcome New Community Member!',
    recommended_slogan: 'Let\'s make memories together 🤝',
  },
  {
    id: 'danger_hex_panel',
    name: 'DANGER HEX Matrix Banner',
    category: 'Cyber Glitch',
    badge: 'HEX OFFICIAL',
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
    gif_url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW82bmN5a3J4NDdvZXoxYWNmdmhpZWZ0dDF4czVwdG45bXZkZXh3ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPnAiaMCws8nOsE/giphy.gif',
    preview_image: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/200.gif',
    recommended_headline: 'GMX QUANTUM COMMAND // Node Verified',
    recommended_slogan: 'Security Protocols Active 24/7 🚀',
  },
];

export function WelcomeStudio({ guilds = [], isOwner = false }) {
  // Current logged in user info
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('glitch_auth_user') || '{}');
    } catch {
      return {};
    }
  })();

  const isMasterOwner =
    isOwner ||
    localStorage.getItem('glitch_user_role') === 'owner' ||
    currentUser?.username?.toLowerCase() === 'shahon' ||
    currentUser?.role === 'owner';

  // Server selection state
  const [selectedGuildId, setSelectedGuildId] = useState(() => {
    return localStorage.getItem('gmx_welcome_guild_id') || (guilds[0]?.id || '');
  });

  // Filter accessible guilds based on user role
  const accessibleGuilds = isMasterOwner
    ? guilds
    : guilds.slice(0, 1); // Regular users are isolated to their primary server

  const currentGuild =
    accessibleGuilds.find((g) => g.id === selectedGuildId) || accessibleGuilds[0];

  // Config Form State
  const [isVip, setIsVip] = useState(false);
  const [welcomeChannelId, setWelcomeChannelId] = useState('');
  const [welcomeLogChannelId, setWelcomeLogChannelId] = useState('');
  const [banLogChannelId, setBanLogChannelId] = useState('');
  const [leaveLogChannelId, setLeaveLogChannelId] = useState('');
  const [rulesChannelId, setRulesChannelId] = useState('');
  const [chatChannelId, setChatChannelId] = useState('');
  const [announceChannelId, setAnnounceChannelId] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [welcomeHeadline, setWelcomeHeadline] = useState('');
  const [customMessage, setCustomMessage] = useState('Stay With Us !! ❤️');
  const [bannerGifUrl, setBannerGifUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [footerText, setFooterText] = useState('Thanks for joining! 🧿');
  const [autoRoleName, setAutoRoleName] = useState('Member');
  const [antiToxicEnabled, setAntiToxicEnabled] = useState(true);
  const [antiNukeEnabled, setAntiNukeEnabled] = useState(true);
  const [mediaShieldEnabled, setMediaShieldEnabled] = useState(true);
  const [voiceMusicEnabled, setVoiceMusicEnabled] = useState(true);
  const [autoBanEnabled, setAutoBanEnabled] = useState(true);
  const [activeFeatureTab, setActiveFeatureTab] = useState('security'); // 'security' | 'voice' | 'welcome'

  // Status & Templates State
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingWelcome, setTestingWelcome] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // VIP Modal & License System (150 BDT, bKash / Nagad / Rocket & Auto Key Generator)
  const [showVipModal, setShowVipModal] = useState(false);
  const [vipModalTab, setVipModalTab] = useState('buy'); // 'buy' | 'key' | 'owner'
  const [vipKeyInput, setVipKeyInput] = useState('');
  const [vipActivating, setVipActivating] = useState(false);
  const [vipError, setVipError] = useState('');

  // Auto-Purchase State
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [trxIdInput, setTrxIdInput] = useState('');
  const [buyerNameInput, setBuyerNameInput] = useState(currentUser?.username || '');
  const [autoBuying, setAutoBuying] = useState(false);
  const [autoGeneratedKey, setAutoGeneratedKey] = useState('');

  // Owner License Manager State
  const [ownerKeysList, setOwnerKeysList] = useState([]);
  const [loadingOwnerKeys, setLoadingOwnerKeys] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);

  // Show temporary toast notification
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch GIF templates
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
      } catch {
        // Fallback to local templates
      }
    };
    fetchTemplates();
  }, []);

  // Fetch Guild Welcome Config
  const loadGuildConfig = useCallback(async (guildId) => {
    if (!guildId) return;
    setLoadingConfig(true);
    try {
      const res = await fetch(`${API}/api/bot/guild/${guildId}/welcome_config`);
      if (res.ok) {
        let data = await res.json();
        // Auto-restore from localStorage cache if server had missing banner or channels
        try {
          const cachedStr = localStorage.getItem(`gmx_guild_config_${guildId}`);
          if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            if (!data.banner_gif_url && cached.banner_gif_url) {
              data = { ...cached, ...data, banner_gif_url: cached.banner_gif_url };
              fetch(`${API}/api/bot/guild/${guildId}/welcome_config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              }).catch(() => {});
            }
          }
        } catch {}

        setIsVip(!!data.is_premium);
        setWelcomeChannelId(data.welcome_channel_id || '');
        setWelcomeLogChannelId(data.welcome_log_channel_id || '');
        setBanLogChannelId(data.ban_log_channel_id || '');
        setLeaveLogChannelId(data.leave_log_channel_id || '');
        setRulesChannelId(data.rules_channel_id || '');
        setChatChannelId(data.chat_channel_id || '');
        setAnnounceChannelId(data.announce_channel_id || '');
        setAuthorName(data.author_name || (currentGuild ? `${currentGuild.name} ⚡ || Panel.Project.Chilling .` : 'HEX COMMUNITY ⚡ || Panel.Project.Chilling .'));
        setWelcomeHeadline(data.welcome_headline || (currentGuild ? `✨ Welcome to ${currentGuild.name}!!` : '✨ Welcome to our server!!'));
        setCustomMessage(data.custom_message || 'Stay With Us !! ❤️');
        setBannerGifUrl(data.banner_gif_url || '');
        setThumbnailUrl(data.thumbnail_url || '');
        setFooterText(data.footer_text || 'Thanks for joining! 🧿');
        setAutoRoleName(data.auto_role_name || 'Member');
        setAntiToxicEnabled(data.anti_toxic_enabled !== 0);
        setAntiNukeEnabled(data.anti_nuke_enabled !== 0);
        setMediaShieldEnabled(data.media_shield_enabled !== 0);
        setVoiceMusicEnabled(data.voice_music_enabled !== 0);
        setAutoBanEnabled(data.auto_ban_enabled !== 0);
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

  // Handle Server Switch
  const handleServerChange = (newGuildId) => {
    setSelectedGuildId(newGuildId);
  };

  // Attempt to select VIP template
  const handleSelectTemplate = (tpl) => {
    if (!isVip) {
      setShowVipModal(true);
      return;
    }
    setBannerGifUrl(tpl.gif_url);
    if (tpl.recommended_headline && !authorName) {
      setAuthorName(tpl.recommended_headline);
    }
    if (tpl.recommended_slogan && (!customMessage || customMessage === 'Stay With Us !! ❤️')) {
      setCustomMessage(tpl.recommended_slogan);
    }
    showToast(`Applied preset banner "${tpl.name}"!`);
  };

  // Save Welcome Config
  const handleSaveConfig = async () => {
    if (!currentGuild?.id) return;
    setSavingConfig(true);
    try {
      const payload = {
        welcome_channel_id: welcomeChannelId,
        welcome_log_channel_id: welcomeLogChannelId,
        ban_log_channel_id: banLogChannelId,
        leave_log_channel_id: leaveLogChannelId,
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
        anti_toxic_enabled: antiToxicEnabled,
        anti_nuke_enabled: antiNukeEnabled,
        media_shield_enabled: mediaShieldEnabled,
        voice_music_enabled: voiceMusicEnabled,
        auto_ban_enabled: autoBanEnabled,
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
        try {
          localStorage.setItem(`gmx_guild_config_${currentGuild.id}`, JSON.stringify(payload));
        } catch {}
        showToast('Welcome configuration saved successfully!');
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

  // Auto-buy 150 BDT VIP Key
  const handleAutoBuyVip = async (e) => {
    e.preventDefault();
    if (!currentGuild?.id) return;
    if (!trxIdInput.trim()) {
      setVipError('Please enter your payment Transaction ID (TrxID) to proceed.');
      return;
    }
    setAutoBuying(true);
    setVipError('');
    try {
      const res = await fetch(`${API}/api/bot/license/buy_auto_key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guild_id: currentGuild.id,
          payment_method: paymentMethod,
          trx_id: trxIdInput.trim(),
          buyer_name: buyerNameInput.trim() || currentUser?.username || 'Customer',
          price_bdt: 150,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsVip(true);
        setAutoGeneratedKey(data.license_key);
        showToast(`🎉 VIP Activated! Your License Key: ${data.license_key}`);
      } else {
        setVipError(data.detail || 'Could not process purchase. Please contact @shahon.');
      }
    } catch {
      setVipError('Network error while purchasing license.');
    } finally {
      setAutoBuying(false);
    }
  };

  // Fetch owner license keys list
  const fetchOwnerLicenses = useCallback(async () => {
    if (!isMasterOwner) return;
    setLoadingOwnerKeys(true);
    try {
      const res = await fetch(`${API}/api/bot/license/list`);
      if (res.ok) {
        const data = await res.json();
        setOwnerKeysList(data.keys || []);
      }
    } catch {}
    finally {
      setLoadingOwnerKeys(false);
    }
  }, [isMasterOwner]);

  // Generate new owner key (150 BDT)
  const handleGenerateOwnerKey = async () => {
    setGeneratingKey(true);
    try {
      const res = await fetch(`${API}/api/bot/license/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: 1,
          price_bdt: 150,
          created_by: currentUser?.username || 'shahon',
          notes: '150 BDT VIP Lifetime License',
        }),
      });
      const data = await res.json();
      if (res.ok && data.keys && data.keys.length > 0) {
        showToast(`Generated VIP key: ${data.keys[0]}`);
        fetchOwnerLicenses();
      }
    } catch {
      showToast('Failed to generate license key.', 'error');
    } finally {
      setGeneratingKey(false);
    }
  };

  // Send Test Welcome Card directly into Discord channel
  const handleTestWelcome = async () => {
    if (!currentGuild?.id) return;
    if (!welcomeChannelId) {
      showToast('Please select a Welcome Channel first before testing.', 'error');
      return;
    }

    setTestingWelcome(true);
    try {
      // First save current config so the test uses current values
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

  // Activate VIP key
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

  // Channel helpers from selected guild
  const textChannels = currentGuild?.text_channels || [];
  const rulesChannelObj = textChannels.find((c) => c.id === rulesChannelId);
  const chatChannelObj = textChannels.find((c) => c.id === chatChannelId);
  const announceChannelObj = textChannels.find((c) => c.id === announceChannelId);

  return (
    <div className="space-y-6">
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

      {/* Top Banner: Server Selector & VIP Status Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/30 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,255,157,0.1)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
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
                <span className="px-3 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-mono font-semibold flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>FREEMIUM BASIC TIER</span>
                </span>
              )}

              {isMasterOwner && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold">
                  ★ MASTER OWNER
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading mt-1 flex items-center gap-2">
              <span>{currentGuild?.name || 'GMX Welcome Studio'}</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Custom rich embeds, animated GIF banners, automated channel mentions, and server gate security.
            </p>
          </div>
        </div>

        {/* Server Switcher (Master Owner sees all, regular users see only their server) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {accessibleGuilds.length > 1 && (
            <div className="relative">
              <select
                value={selectedGuildId}
                onChange={(e) => handleServerChange(e.target.value)}
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

      {/* Main Studio Grid: Configuration Panel (Left) & Real-Time Discord Live Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Channel & Security Log Matrix */}
          <GlassCard
            title="Channel & Security Log Matrix"
            subtitle="Configure display channels, welcome audit logs, and instant ban notification channels"
            icon={Hash}
            glowColor="cyan"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Welcome Channel */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono font-bold text-cyan-300 flex items-center justify-between">
                  <span>🚪 Welcome Display Channel</span>
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

              {/* Welcome Log Channel (VIP / Staff Audit) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-emerald-300 flex items-center justify-between">
                  <span>📋 Welcome Log Channel</span>
                  <span className="text-[10px] text-amber-400 font-normal">VIP / Staff</span>
                </label>
                <select
                  value={welcomeLogChannelId}
                  onChange={(e) => setWelcomeLogChannelId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
                >
                  <option value="">Disabled (or select audit channel)</option>
                  {textChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ban Log Channel (VIP / Security Alert) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-rose-300 flex items-center justify-between">
                  <span>🔨 Ban Log Channel</span>
                  <span className="text-[10px] text-rose-400 font-normal">Auto Ban Alert</span>
                </label>
                <select
                  value={banLogChannelId}
                  onChange={(e) => setBanLogChannelId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-rose-500/40 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-400"
                >
                  <option value="">Disabled (or select ban log channel)</option>
                  {textChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave / Kick Log Channel */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>🚪 Leave / Kick Log Channel</span>
                  <span className="text-[10px] text-slate-500 font-normal">Optional Departure Tracker</span>
                </label>
                <select
                  value={leaveLogChannelId}
                  onChange={(e) => setLeaveLogChannelId(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400"
                >
                  <option value="">Disabled (or select leave channel)</option>
                  {textChannels.map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}
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

          {/* Card 2: Embed Text Customizer */}
          <GlassCard
            title="Embed Card Typography & Text"
            subtitle="Matches the exact aesthetic layout of HEX COMMUNITY / DANGER HEX"
            icon={MessageSquare}
            glowColor="emerald"
          >
            <div className="space-y-4">
              {/* Author Row */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>Author / Header Title</span>
                  <span className="text-[10px] text-slate-500">Appears at the very top</span>
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
                  placeholder="✨ Welcome to our server!!"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Slogan / Custom Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Slogan / Closing Message</span>
                  <span className="text-[10px] text-slate-500">Bold text below channel links</span>
                </label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Stay With Us !! ❤️"
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
                  <label className="text-xs font-mono text-slate-300">Auto-Assigned Role</label>
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

          {/* Card 3: VIP Animated GIF Gallery & Custom Banners */}
          <GlassCard
            title="VIP Animated GIF Banner Gallery"
            subtitle="Select from high-tech Cyberpunk & Anime GIF banners or supply your custom GIF URL"
            icon={ImageIcon}
            glowColor="purple"
            action={
              !isVip && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>VIP REQUIRED</span>
                </span>
              )
            }
          >
            <div className="space-y-4">
              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        
                        {/* VIP Lock or Check indicator */}
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

                      <div className="p-2.5 bg-slate-900/90">
                        <h4 className="text-xs font-bold text-slate-200 truncate">{tpl.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{tpl.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom GIF Banner Input */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span>Custom Animated GIF Banner URL</span>
                  </span>
                  {!isVip && (
                    <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                      <Crown className="w-3 h-3" /> VIP Only
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
                    placeholder="https://media.giphy.com/media/.../giphy.gif"
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

              {/* Custom Thumbnail Avatar URL */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>Custom Top-Right Thumbnail URL (Ninja Avatar / Server Logo)</span>
                  <span className="text-[10px] text-slate-500">Leave blank for joining member's avatar</span>
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

          {/* Card: Active Feature Modules & Discord Command Cheatsheet */}
          <GlassCard
            title="Active Feature Modules & Discord Command Cheatsheet"
            subtitle="Configure Security, Voice, and Welcome features. View live trigger commands for your server."
            icon={Terminal}
            glowColor="amber"
          >
            <div className="space-y-4 font-mono text-xs">
              {/* Feature Selector Tabs */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveFeatureTab('security')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeFeatureTab === 'security'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>🛡️ Ban & Anti-Nuke ({antiNukeEnabled ? 'ON' : 'OFF'})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFeatureTab('voice')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeFeatureTab === 'voice'
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                  <span>🎵 Voice & Music ({voiceMusicEnabled ? 'ON' : 'OFF'})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFeatureTab('welcome')}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeFeatureTab === 'welcome'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🚪 Welcome Check (!welcome)</span>
                </button>
              </div>

              {/* TAB 1: BAN & SECURITY SYSTEM */}
              {activeFeatureTab === 'security' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Master Anti-Nuke Toggle */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-rose-500/30 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">Anti-Nuke & Auto-Ban Defense Shield</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          antiNukeEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950 text-rose-400 border border-rose-500/40'
                        }`}>
                          {antiNukeEnabled ? 'Active 🟢' : 'Disabled 🔴'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Blocks unauthorized channel deletions, role tampering, and raiders with instant auto-ban and audit logging.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !antiNukeEnabled;
                        setAntiNukeEnabled(next);
                        showToast(next ? '🛡️ Anti-Nuke & Auto-Ban Enabled!' : '⚠️ Anti-Nuke Disabled');
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        antiNukeEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        antiNukeEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Media Shield Toggle */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">Media & Malicious Attachment Shield</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          mediaShieldEnabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {mediaShieldEnabled ? 'Active 🟢' : 'Disabled 🔴'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Auto-removes malicious .exe, .bat files and suspicious attachments, warning or banning non-whitelisted senders.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !mediaShieldEnabled;
                        setMediaShieldEnabled(next);
                        showToast(next ? '📁 Media Shield Enabled!' : 'Media Shield Disabled');
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        mediaShieldEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        mediaShieldEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Commands Cheatsheet Box */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-rose-300 flex items-center justify-between px-1">
                      <span>⚡ Active Security & Ban Commands (Click Copy to use in Discord):</span>
                      <span className="text-slate-500 text-[10px]">Permission: Admin/Ban</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { cmd: '!ban @user [reason]', desc: 'Ban member directly and dispatch audit log to Ban Log channel' },
                        { cmd: '!unban <user_id>', desc: 'Unban a previously banned user by their Discord User ID' },
                        { cmd: '!kick @user [reason]', desc: 'Kick unauthorized member from the server' },
                        { cmd: '!testban', desc: 'Test if the Ban Log channel receives security ban alerts properly' },
                        { cmd: '!whitelist @user', desc: 'Add trusted staff member to security bypass whitelist' },
                        { cmd: '!clear 20', desc: 'Quickly clean up unwanted spam messages from chat' },
                      ].map((item) => (
                        <div
                          key={item.cmd}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 flex items-center justify-between gap-2 group transition-all"
                        >
                          <div className="min-w-0">
                            <code className="text-amber-300 font-bold text-xs block truncate">{item.cmd}</code>
                            <span className="text-[10px] text-slate-400 font-sans block truncate">{item.desc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(item.cmd);
                              showToast(`Copied ${item.cmd} to clipboard!`);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 hover:text-black text-slate-300 transition-colors shrink-0"
                            title="Copy Command"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VOICE & MUSIC SYSTEM */}
              {activeFeatureTab === 'voice' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Master Voice Toggle */}
                  <div className="p-3.5 rounded-xl bg-slate-950/90 border border-purple-500/30 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">Voice Channel Connect & 192kbps Audio Player</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          voiceMusicEnabled ? 'bg-purple-950 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {voiceMusicEnabled ? 'Active 🟢' : 'Disabled 🔴'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans">
                        192kbps crystal-clear audio streaming and low-latency voice playback for music and tracks.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const next = !voiceMusicEnabled;
                        setVoiceMusicEnabled(next);
                        showToast(next ? '🎵 Voice & Music System Enabled!' : 'Voice System Disabled');
                      }}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        voiceMusicEnabled ? 'bg-purple-500' : 'bg-slate-800'
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        voiceMusicEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Commands Cheatsheet Box */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-purple-300 flex items-center justify-between px-1">
                      <span>⚡ Voice & Music Commands (Click Copy to use in Discord):</span>
                      <span className="text-slate-500 text-[10px]">192kbps Opus Audio</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { cmd: '!join', desc: 'Connect bot to your current voice channel (!vjoin)' },
                        { cmd: '!song <name or URL>', desc: 'Play 192kbps high-fidelity audio track (!play)' },
                        { cmd: '!stop', desc: 'Stop music playback and clear the playlist queue' },
                        { cmd: '!volume 80', desc: 'Adjust audio playback volume percentage (1-200)' },
                        { cmd: '!leave', desc: 'Disconnect bot from voice channel (!dc)' },
                        { cmd: '!drag @user', desc: 'Relocate mentioned user into your current voice channel' },
                      ].map((item) => (
                        <div
                          key={item.cmd}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 flex items-center justify-between gap-2 group transition-all"
                        >
                          <div className="min-w-0">
                            <code className="text-amber-300 font-bold text-xs block truncate">{item.cmd}</code>
                            <span className="text-[10px] text-slate-400 font-sans block truncate">{item.desc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(item.cmd);
                              showToast(`Copied ${item.cmd} to clipboard!`);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-500 hover:text-black text-slate-300 transition-colors shrink-0"
                            title="Copy Command"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: WELCOME VERIFICATION SYSTEM */}
              {activeFeatureTab === 'welcome' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Verification Highlight Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 via-slate-950 to-emerald-950/40 border-2 border-emerald-500/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="font-bold text-emerald-300 text-sm">Welcome Check & Live Verification Command</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                        READY TO TEST
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      To test whether your welcome system is really working, run the command below directly in your Discord chat. The bot will immediately post your live welcome card with the Tenor animated banner and channel links.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <div className="flex-1 w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 font-mono text-xs">
                        <span className="text-amber-300 font-bold select-all">!welcome</span>
                        <span className="text-slate-500 text-[10px]">(or !testwelcome)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('!welcome');
                          showToast('Copied "!welcome" to clipboard! Paste it into your Discord channel.');
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy !welcome</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleTestWelcome}
                        disabled={testingWelcome || !welcomeChannelId}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-cyan-500/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{testingWelcome ? 'Sending...' : 'Trigger Discord Test Now'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Commands Cheatsheet Box */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-emerald-300 flex items-center justify-between px-1">
                      <span>⚡ Welcome & Channel Setup Commands:</span>
                      <span className="text-slate-500 text-[10px]">Permission: Admin</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { cmd: '!welcome', desc: 'Live test welcome card and verify delivery in chat' },
                        { cmd: '!testwelcome', desc: 'Alternative test command (triggers same live welcome preview)' },
                        { cmd: '!setwelcome #welcome', desc: 'Configure welcome channel directly from Discord chat' },
                        { cmd: '!setlog #staff-logs', desc: 'Configure security and ban log audit channel directly from Discord' },
                        { cmd: '!autorole Member', desc: 'Configure automatic role assignment for new joining members' },
                        { cmd: '!userinfo @user', desc: 'Inspect member profile telemetry and server join date' },
                      ].map((item) => (
                        <div
                          key={item.cmd}
                          className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between gap-2 group transition-all"
                        >
                          <div className="min-w-0">
                            <code className="text-amber-300 font-bold text-xs block truncate">{item.cmd}</code>
                            <span className="text-[10px] text-slate-400 font-sans block truncate">{item.desc}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(item.cmd);
                              showToast(`Copied ${item.cmd} to clipboard!`);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-500 hover:text-black text-slate-300 transition-colors shrink-0"
                            title="Copy Command"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xs font-mono text-slate-400">
              Target: <strong className="text-emerald-300">#{textChannels.find((c) => c.id === welcomeChannelId)?.name || 'None'}</strong>
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
                {testingWelcome ? 'Dispatching...' : 'Send Test Welcome'}
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
              Exact Client Simulation
            </span>
          </div>

          {/* Mock Discord Chat Message Container */}
          <div className="rounded-2xl bg-[#313338] border border-slate-700/60 p-4 font-sans text-slate-200 shadow-2xl space-y-3 select-none">
            {/* Discord Channel Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-[#3f4147] text-xs font-semibold text-slate-400">
              <Hash className="w-4 h-4 text-slate-400" />
              <span className="text-slate-200">
                {textChannels.find((c) => c.id === welcomeChannelId)?.name || 'welcome'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">| Member Gateway</span>
            </div>

            {/* Discord Message Row */}
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

                {/* Plain message greeting text */}
                <div className="text-xs text-slate-200">
                  👋 Welcome <span className="text-[#00a8fc] hover:underline cursor-pointer">@Shahon</span>! 🎉
                </div>

                {/* THE RICH EMBED CARD (Exact clone of uploaded screenshot) */}
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
                      {/* Headline */}
                      <div className="font-bold text-slate-100 text-sm">
                        {welcomeHeadline || `✨ Welcome to ${currentGuild?.name || 'our server'}!!`}
                      </div>

                      {/* Rules Link */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span>📜</span>
                        <span className="font-semibold text-slate-200">Rules</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#35373c] text-[#00a8fc] font-mono text-[11px] hover:underline cursor-pointer">
                          #{rulesChannelObj?.name || 'rules'}
                        </span>
                        <span className="text-slate-400 font-bold">· RULES</span>
                      </div>

                      {/* Public Chat Link */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span>💬</span>
                        <span className="font-semibold text-slate-200">Chat in</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#35373c] text-[#00a8fc] font-mono text-[11px] hover:underline cursor-pointer">
                          #{chatChannelObj?.name || 'public-chat'}
                        </span>
                        <span className="text-slate-400 font-bold">· PUBLIC · CHAT</span>
                      </div>

                      {/* Announcement Link */}
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span>📢</span>
                        <span className="font-semibold text-slate-200">Announce</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#35373c] text-[#00a8fc] font-mono text-[11px] hover:underline cursor-pointer">
                          #{announceChannelObj?.name || 'announcements'}
                        </span>
                        <span className="text-slate-400 font-bold">· ANNOUNCEMENTS</span>
                      </div>

                      {/* Custom Message / Slogan */}
                      <div className="pt-2 font-bold text-slate-100 text-sm">
                        {customMessage || 'Stay With Us !! ❤️'}
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
                        👑 VIP Animated GIF Banner Slot
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Click to select an aesthetic anime/cyberpunk GIF
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

      {/* 👑 VIP UPGRADE MODAL (150 BDT LIFETIME) 👑 */}
      {showVipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/50 shadow-[0_0_60px_rgba(245,158,11,0.35)] p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200 my-8">
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
                GMX VIP Premium Suite (150 BDT)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Full server customization for <strong>{currentGuild?.name || 'Your Server'}</strong> • Price: <span className="text-amber-400 font-bold">150 Taka Lifetime</span>
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 font-mono text-xs">
              <button
                type="button"
                onClick={() => { setVipModalTab('buy'); setVipError(''); }}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  vipModalTab === 'buy'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Buy VIP (150 BDT)</span>
              </button>
              <button
                type="button"
                onClick={() => { setVipModalTab('key'); setVipError(''); }}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  vipModalTab === 'key'
                    ? 'bg-slate-800 text-amber-300 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>🔑 Enter Key</span>
              </button>
              {isMasterOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setVipModalTab('owner');
                    setVipError('');
                    fetchOwnerLicenses();
                  }}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                    vipModalTab === 'owner'
                      ? 'bg-purple-900/80 text-purple-200 border border-purple-500/40 shadow-md'
                      : 'text-purple-400 hover:text-purple-200'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <span>👑 Owner Generator</span>
                </button>
              )}
            </div>

            {/* TAB 1: BUY VIP (150 BDT) */}
            {vipModalTab === 'buy' && (
              <div className="space-y-4">
                {/* Features Highlights */}
                <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs font-mono space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2 text-amber-200 font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>What VIP Access Unlocks (150 BDT Lifetime):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Tenor & Custom GIFs / Video</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Welcome Log Channel (Staff)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Ban Log Channel (Reason & Mod)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Leave / Departure Log Channel</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>5x Custom Emojis (Rules, Chat)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Automatic VIP License Key Generation</span>
                    </div>
                  </div>
                </div>

                {/* Payment Numbers Box */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Payment Method (Send Money 150 BDT)</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      150 BDT Personal
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-pink-400 font-bold block text-[11px]">bKash (Personal)</span>
                      <span className="text-slate-200 font-bold select-all">01878486009</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-orange-400 font-bold block text-[11px]">Nagad (Personal)</span>
                      <span className="text-slate-200 font-bold select-all">01878486009</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
                      <span className="text-purple-400 font-bold block text-[11px]">Rocket (Personal)</span>
                      <span className="text-slate-200 font-bold select-all">01878486009</span>
                    </div>
                  </div>
                </div>

                {/* Purchase / Auto License Form */}
                <form onSubmit={handleAutoBuyVip} className="space-y-3 font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Payment Method</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      >
                        <option value="bKash">bKash (Personal)</option>
                        <option value="Nagad">Nagad (Personal)</option>
                        <option value="Rocket">Rocket (Personal)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-300">Your Name / Discord Tag</label>
                      <input
                        type="text"
                        value={buyerNameInput}
                        onChange={(e) => setBuyerNameInput(e.target.value)}
                        placeholder="e.g. shahon / member"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-300 flex items-center justify-between">
                      <span>Transaction ID (TrxID)</span>
                      <span className="text-[10px] text-slate-500 font-normal">Transaction code received after sending money</span>
                    </label>
                    <input
                      type="text"
                      value={trxIdInput}
                      onChange={(e) => setTrxIdInput(e.target.value)}
                      placeholder="e.g. BLA79X9Q12"
                      className="w-full bg-slate-950 border-2 border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs text-amber-200 uppercase tracking-wider focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {vipError && (
                    <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{vipError}</span>
                    </div>
                  )}

                  {/* Auto-Generated Key Success Alert */}
                  {autoGeneratedKey && (
                    <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-center space-y-2">
                      <div className="flex items-center justify-center gap-1.5 text-emerald-300 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>VIP Successfully Activated!</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 font-mono text-xs text-amber-300 font-bold select-all tracking-wider">
                        {autoGeneratedKey}
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Save your license key! Lifetime VIP is now permanently unlocked for this server.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={autoBuying}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {autoBuying ? 'Verifying & Generating...' : '⚡ Verify & Generate VIP License Key (150 BDT)'}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setTrxIdInput('INSTANT-150-VIP-' + Math.floor(100000 + Math.random() * 900000));
                    }}
                    className="w-full py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-amber-300 transition-colors"
                  >
                    Quick Fill Instant TrxID Demo
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: ENTER LICENSE KEY */}
            {vipModalTab === 'key' && (
              <form onSubmit={handleActivateVip} className="space-y-4 font-mono">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>VIP License Key</span>
                    <span className="text-[10px] text-slate-500 font-normal">e.g. GMX-VIP-150-XXXX-XXXX</span>
                  </label>
                  <input
                    type="text"
                    value={vipKeyInput}
                    onChange={(e) => setVipKeyInput(e.target.value)}
                    placeholder="Enter 150 BDT License Key"
                    className="w-full bg-slate-950 border-2 border-amber-500/40 rounded-xl px-4 py-3 text-xs text-amber-200 uppercase tracking-widest focus:outline-none focus:border-amber-400"
                  />
                </div>

                {vipError && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{vipError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={vipActivating || !vipKeyInput.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {vipActivating ? 'Verifying License...' : 'Activate Lifetime VIP Now'}
                </button>

                {isMasterOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setVipKeyInput('SHAHON-OWNER-CLEARANCE');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs border border-amber-500/30"
                  >
                    ★ Fill Owner Clearance Key
                  </button>
                )}
              </form>
            )}

            {/* TAB 3: OWNER KEY GENERATOR */}
            {vipModalTab === 'owner' && isMasterOwner && (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                  <div>
                    <h4 className="font-bold text-purple-200">👑 Master Owner License Generator</h4>
                    <p className="text-[11px] text-slate-400">Generate 150 BDT authentic VIP license keys for buyers.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateOwnerKey}
                    disabled={generatingKey}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{generatingKey ? 'Generating...' : '+ Generate 150 BDT Key'}</span>
                  </button>
                </div>

                {/* Keys List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>Generated Keys ({ownerKeysList.length})</span>
                    <button onClick={fetchOwnerLicenses} className="text-purple-400 hover:underline">Refresh</button>
                  </div>
                  {loadingOwnerKeys ? (
                    <div className="p-4 text-center text-slate-400">Loading licenses...</div>
                  ) : ownerKeysList.length === 0 ? (
                    <div className="p-4 text-center text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                      No custom keys generated yet. Click above to generate one.
                    </div>
                  ) : (
                    ownerKeysList.map((k) => (
                      <div
                        key={k.id || k.license_key}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-300 text-xs tracking-wider select-all">{k.license_key}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              k.is_used ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {k.is_used ? `Used by #${k.used_by_guild}` : '🟢 Available'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Price: 150 BDT • Created: {k.created_at ? k.created_at.substring(0, 10) : 'Today'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(k.license_key);
                            showToast(`Copied ${k.license_key}!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px]"
                        >
                          Copy
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="text-center text-[11px] font-mono text-slate-500">
              Need assistance? Contact Master Owner <span className="text-amber-400 font-bold">@shahon</span>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeStudio;
