/**
 * Official Discord Bot OAuth2 Authorization Utility
 * Automatically resolves and opens the real Discord Bot Invite screen
 * Prevents raw JSON strings from displaying in browser tabs.
 */

export const OFFICIAL_DISCORD_INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1543226513871339550&permissions=2147601408&scope=bot%20applications.commands';

export async function openDiscordBotInvite(e) {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch('http://localhost:5000/api/discord/invite', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.invite_url) {
        window.open(data.invite_url, '_blank');
        return;
      }
    }
  } catch (err) {
    // Fallback directly to verified Discord OAuth2 URL
  }

  window.open(OFFICIAL_DISCORD_INVITE_URL, '_blank');
}

export default openDiscordBotInvite;
