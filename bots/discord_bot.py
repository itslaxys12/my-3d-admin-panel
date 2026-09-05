import asyncio
import os
import re
import shutil
import sqlite3
import sys
import time
from collections import defaultdict, deque
from datetime import timedelta

from dotenv import load_dotenv

# Ensure FFmpeg is available in PATH automatically
try:
    import static_ffmpeg
    static_ffmpeg.add_paths()
except Exception:
    pass

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.remove(PROJECT_DIR) if PROJECT_DIR in sys.path else None
import discord
from discord.ext import commands
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

# Ensure Opus is loaded for crystal-clear voice streaming
if not discord.opus.is_loaded():
    for opus_candidate in ["libopus.so.0", "libopus.so", "opus", "libopus-0.x86.dll", "libopus-0.x64.dll"]:
        try:
            discord.opus.load_opus(opus_candidate)
            if discord.opus.is_loaded():
                break
        except Exception:
            pass

try:
    import davey
except ImportError:
    pass

load_dotenv()


def parse_ids(raw_value: str):
    values = []
    for item in str(raw_value or "").split(","):
        cleaned = item.strip()
        if not cleaned:
            continue
        try:
            values.append(int(cleaned))
        except ValueError:
            continue
    return set(values)


TOKEN = os.getenv("DISCORD_BOT_TOKEN", "").strip()
PREFIX = os.getenv("DISCORD_PREFIX", "!")
LOG_CHANNEL_ID = int(os.getenv("DISCORD_LOG_CHANNEL_ID", "0") or 0)
WELCOME_CHANNEL_ID = int(os.getenv("DISCORD_WELCOME_CHANNEL_ID", "0") or 0)
WELCOME_MESSAGE = os.getenv("DISCORD_WELCOME_MESSAGE", "Welcome to the server! 🎉")
SECURITY_MODE = os.getenv("SECURITY_MODE", "ON").strip().upper() in {"1", "ON", "TRUE", "YES", "Y"}
OWNER_IDS = parse_ids(os.getenv("DISCORD_OWNER_IDS", ""))
FOUNDER_IDS = parse_ids(os.getenv("DISCORD_FOUNDER_IDS", ""))
LEGACY_OWNER_IDS = parse_ids(os.getenv("ADMIN_ID", "")) | parse_ids(os.getenv("ALLOWED_DISCORD_USER_ID", ""))
OWNER_IDS = OWNER_IDS or LEGACY_OWNER_IDS
WHITE_LIST_IDS = parse_ids(os.getenv("DISCORD_WHITELIST_IDS", ""))
ALLOWED_USER_IDS = OWNER_IDS | FOUNDER_IDS | WHITE_LIST_IDS
ACTIVE_SECURITY_MODE = SECURITY_MODE and bool(ALLOWED_USER_IDS)
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "data", "discord.db"))
BANNED_KEYWORDS = {
    "khankir", "khanjir", "kharap", "bogra", "bastard", "fuck", "shit", "bitch", "saala", "sala",
    "maderchod", "madarchod", "bhenchod", "behenchod", "pola", "mangetar", "bainchot", "hujur",
    "harami", "jhamela", "gandu", "gand", "kuttar", "kutta", "bapchu", "sawwa", "wassa", "nigga",
    "dick", "sex", "porn", "xxx", "nude", "nigga", "fucker", "motherfucker",
}

intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.voice_states = True

bot = commands.Bot(command_prefix=PREFIX, intents=intents, help_command=None)
message_history = defaultdict(lambda: deque(maxlen=8))
timeouts = {}


def voice_requirements_ready():
    missing = []
    try:
        import nacl  # noqa: F401
    except Exception:
        missing.append("PyNaCl")
    if not shutil.which("ffmpeg"):
        missing.append("FFmpeg")
    return missing


async def send_voice_dependency_error(ctx):
    missing = voice_requirements_ready()
    if not missing:
        return False
    msg = "Voice features are unavailable because these are missing: " + ", ".join(missing) + ". Install them and restart the bot."
    if "FFmpeg" in missing:
        msg += " Download FFmpeg and add it to PATH, then restart the bot."
    if "PyNaCl" in missing:
        msg += " Install PyNaCl with: .\\venv\\Scripts\\python.exe -m pip install PyNaCl"
    await ctx.send(msg)
    return True


def db_query(sql, params=(), fetch=False):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as connection:
        connection.execute(sql, params)
        rows = connection.fetchall() if fetch else None
        connection.commit()
    return rows


def init_db():
    db_query("""CREATE TABLE IF NOT EXISTS warnings (
        guild_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
        count INTEGER NOT NULL DEFAULT 0, reason TEXT DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (guild_id, user_id)
    )""")
    db_query("""CREATE TABLE IF NOT EXISTS fines (
        id INTEGER PRIMARY KEY AUTOINCREMENT, guild_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL, amount INTEGER NOT NULL,
        reason TEXT DEFAULT '', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )""")


async def send_log(guild, message):
    channel = guild.get_channel(LOG_CHANNEL_ID) if LOG_CHANNEL_ID else None
    if channel is None:
        channel = guild.system_channel or next((c for c in guild.text_channels if c.permissions_for(guild.me).send_messages), None)
    if channel:
        await channel.send(message)


async def send_ban_log(member, reason):
    if not member or not getattr(member, "guild", None):
        return
    guild = member.guild
    channel = guild.get_channel(LOG_CHANNEL_ID) if LOG_CHANNEL_ID else None
    if channel is None:
        channel = guild.system_channel or next((c for c in guild.text_channels if c.permissions_for(guild.me).send_messages), None)
    if not channel:
        return
    embed = discord.Embed(
        title="🚫 Ban Log",
        description=f"**Reason:** {reason}",
        color=discord.Color.red(),
        timestamp=discord.utils.utcnow(),
    )
    embed.add_field(name="User", value=f"{member.mention} ({member.name})", inline=True)
    embed.add_field(name="User ID", value=str(member.id), inline=True)
    embed.add_field(name="Server", value=guild.name, inline=False)
    await channel.send(embed=embed)


async def punish(member, reason):
    try:
        await member.timeout(discord.utils.utcnow() + timedelta(minutes=10), reason=reason)
        return "timeout"
    except (discord.Forbidden, discord.HTTPException):
        try:
            await member.kick(reason=reason)
            return "kick"
        except (discord.Forbidden, discord.HTTPException):
            return "failed"


def is_link(message):
    return bool(re.search(r"https?://|discord\.gg/", message.content, re.I))


def is_authorized_user(user_id: int) -> bool:
    return user_id in ALLOWED_USER_IDS


def is_whitelisted_user(user_id: int) -> bool:
    return user_id in OWNER_IDS or user_id in FOUNDER_IDS or user_id in WHITE_LIST_IDS


def should_ban_non_whitelisted_member(user_id: int, message_content: str = "", has_attachment: bool = False) -> bool:
    if not SECURITY_MODE:
        return False
    if is_whitelisted_user(user_id):
        return False
    return True


def contains_banned_keyword(message_text: str) -> bool:
    text = (message_text or "").lower()
    if not text:
        return False
    normalized = re.sub(r"[^a-z0-9]", "", text)
    if any(word in normalized for word in ["khankir", "khanjir", "maderchod", "madarchod", "bhenchod", "gandu", "harami", "bitch", "fuck", "shit", "saala", "sala", "dick", "porn", "nude", "pola", "bainchot"]):
        return True
    for word in BANNED_KEYWORDS:
        if word in text:
            return True
    return False


def has_malicious_activity(message):
    text = message.content.strip()
    if message.attachments:
        return True
    if re.search(r"https?://|discord\.gg/|@everyone|@here", text, re.I):
        return True
    if contains_banned_keyword(text):
        return True
    return False


def save_whitelist_ids():
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".env"))
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as env_file:
            lines = env_file.read().splitlines()
    updated = []
    seen = False
    whitelist_value = ",".join(str(user_id) for user_id in sorted(WHITE_LIST_IDS))
    for line in lines:
        if line.strip().startswith("DISCORD_WHITELIST_IDS="):
            updated.append(f"DISCORD_WHITELIST_IDS={whitelist_value}")
            seen = True
        else:
            updated.append(line)
    if not seen:
        updated.append(f"DISCORD_WHITELIST_IDS={whitelist_value}")
    with open(env_path, "w", encoding="utf-8") as env_file:
        env_file.write("\n".join(updated) + "\n")


async def security_ban_user(member, reason):
    if member.bot:
        return
    try:
        await member.send(f"Security check failed. You are not allowed in this server. Reason: {reason}")
    except Exception:
        pass
    try:
        await member.ban(reason=reason, delete_message_days=0)
    except discord.Forbidden:
        try:
            await member.kick(reason=reason)
        except discord.Forbidden:
            pass
    await send_ban_log(member, reason)


async def send_welcome_message(member):
    if not WELCOME_CHANNEL_ID:
        return
    channel = member.guild.get_channel(WELCOME_CHANNEL_ID)
    if not channel:
        return

    embed = discord.Embed(
        title="Welcome to the server! 🎉",
        description=f"{WELCOME_MESSAGE}\n\n{member.mention} has joined us!",
        color=discord.Color.from_rgb(128, 255, 196),
        timestamp=discord.utils.utcnow(),
    )
    embed.set_author(name=member.display_name, icon_url=member.display_avatar.url)
    embed.set_thumbnail(url=member.display_avatar.url)
    embed.add_field(name="User", value=f"{member.mention}", inline=True)
    embed.add_field(name="ID", value=str(member.id), inline=True)
    embed.add_field(name="Joined", value=member.joined_at.strftime("%d %b %Y %H:%M UTC") if member.joined_at else "Unknown", inline=False)
    embed.set_footer(text=f"{member.guild.name} • We are happy to have you!", icon_url=member.guild.icon.url if member.guild.icon else None)
    await channel.send(embed=embed)


@bot.event
async def setup_hook():
    init_db()
    await bot.tree.sync()


@bot.event
async def on_ready():
    print(f"Discord bot online: {bot.user} ({bot.user.id})")
    print(f"Security status: {'ON' if ACTIVE_SECURITY_MODE else 'OFF'}")
    print(f"Authorized users: {sorted(ALLOWED_USER_IDS)}")
    if SECURITY_MODE and not ALLOWED_USER_IDS:
        print("WARNING: SECURITY_MODE is ON but no DISCORD_OWNER_IDS / DISCORD_FOUNDER_IDS were configured. Security is disabled until at least one owner ID is set.")
    missing = voice_requirements_ready()
    if missing:
        print(f"Voice dependencies missing: {', '.join(missing)}")


AUTO_ROLE_NAME = os.getenv("DISCORD_AUTO_ROLE", "Member").strip()

async def assign_auto_role(member):
    """Automatically assigns lowest/default member role."""
    if member.bot or not member.guild.me.guild_permissions.manage_roles:
        return
    role = None
    if AUTO_ROLE_NAME:
        for r in member.guild.roles:
            if r.name.lower() == AUTO_ROLE_NAME.lower() and not r.managed:
                role = r
                break
    if not role:
        for name in ["member", "members", "verified", "user", "general"]:
            for r in member.guild.roles:
                if r.name.lower() == name and not r.managed:
                    role = r
                    break
            if role:
                break
    if not role:
        assignable = [r for r in member.guild.roles if r.name != "@everyone" and not r.managed and r.position < member.guild.me.top_role.position]
        if assignable:
            assignable.sort(key=lambda r: r.position)
            role = assignable[0]
    if role and role not in member.roles:
        try:
            await member.add_roles(role, reason="[GMX Auto-Role] Automated member welcome assignment")
            print(f"[AUTO-ROLE] ✅ Assigned '{role.name}' to {member.name} in '{member.guild.name}'")
        except Exception as err:
            print(f"[AUTO-ROLE ERROR] {err}")


@bot.event
async def on_member_join(member):
    if member.bot:
        return
    await assign_auto_role(member)
    await send_welcome_message(member)


@bot.event
async def on_message(message):
    if message.author.bot or not message.guild:
        return await bot.process_commands(message)

    if SECURITY_MODE and not is_whitelisted_user(message.author.id):
        if has_malicious_activity(message):
            try:
                await message.delete()
            except Exception:
                pass
            await security_ban_user(
                message.author,
                "Not on whitelist. Malicious or abusive content is not allowed.",
            )
            return

    now = time.monotonic()
    key = (message.guild.id, message.author.id)
    history = message_history[key]
    history.append((now, message.content.strip().lower()))
    recent = [item for item in history if now - item[0] <= 8]
    repeated = len(recent) >= 5 and len({item[1] for item in recent}) <= 2
    excessive_caps = len(message.content) >= 12 and sum(c.isupper() for c in message.content) / max(len(message.content), 1) > 0.8

    if is_link(message) and not (message.author.guild_permissions.manage_messages or message.author.guild_permissions.administrator):
        try:
            await message.delete()
            await message.channel.send(f"{message.author.mention}, links are not allowed here.", delete_after=5)
            await send_log(message.guild, f"Removed unauthorised link from {message.author} in #{message.channel}.")
        except discord.HTTPException:
            pass
    elif repeated or excessive_caps:
        action = await punish(message.author, "Automatic anti-spam protection")
        await send_log(message.guild, f"Anti-spam action `{action}` for {message.author} in #{message.channel}.")

    await bot.process_commands(message)


async def mod_check(ctx):
    if not ctx.guild or not ctx.author.guild_permissions.moderate_members:
        await ctx.send("You need the Moderate Members permission.", delete_after=6)
        return False
    return True


@bot.command()
@commands.guild_only()
async def security(ctx):
    allowed = ", ".join(str(user_id) for user_id in sorted(ALLOWED_USER_IDS)) or "None"
    await ctx.send(
        f"**Security Status: {'ON' if ACTIVE_SECURITY_MODE else 'OFF'}**\n"
        f"Owner IDs: {', '.join(str(user_id) for user_id in sorted(OWNER_IDS)) or 'None'}\n"
        f"Whitelist IDs: {', '.join(str(user_id) for user_id in sorted(WHITE_LIST_IDS)) or 'None'}\n"
        f"Owner check: {'enabled' if ACTIVE_SECURITY_MODE else 'disabled'}"
    )


@bot.command()
@commands.guild_only()
async def whitelist(ctx, action: str = "list", member: discord.Member = None):
    global WHITE_LIST_IDS

    if not is_authorized_user(ctx.author.id):
        return await ctx.send("Only the owner can manage the whitelist.")

    action = action.lower()
    if action == "list":
        users = ", ".join(str(user_id) for user_id in sorted(WHITE_LIST_IDS)) or "None"
        return await ctx.send(f"Whitelist users: {users}")

    if member is None:
        return await ctx.send("Usage: `!whitelist add @user` or `!whitelist remove @user`")

    if action == "add":
        WHITE_LIST_IDS.add(member.id)
        save_whitelist_ids()
        ALLOWED_USER_IDS.add(member.id)
        return await ctx.send(f"Added {member.mention} to the whitelist.")
    if action == "remove":
        WHITE_LIST_IDS.discard(member.id)
        save_whitelist_ids()
        ALLOWED_USER_IDS.discard(member.id)
        return await ctx.send(f"Removed {member.mention} from the whitelist.")

    return await ctx.send("Action must be `add`, `remove`, or `list`.")


@bot.command()
@commands.guild_only()
async def help(ctx):
    await ctx.send(
        f"**Commands**\n`{PREFIX}security`\n"
        f"`{PREFIX}warn @user reason`  `{PREFIX}warnings @user`\n"
        f"`{PREFIX}fine @user amount reason`  `{PREFIX}fines @user`\n"
        f"`{PREFIX}timeout @user minutes reason`  `{PREFIX}kick @user reason`\n"
        f"`{PREFIX}ban @user reason`  `{PREFIX}clear number`  `{PREFIX}lock` / `{PREFIX}unlock`\n"
        f"Music: `{PREFIX}join`, `{PREFIX}play song`, `{PREFIX}stop`"
    )


@bot.command()
@commands.guild_only()
async def warn(ctx, member: discord.Member, *, reason="No reason provided"):
    if not await mod_check(ctx):
        return
    row = db_query("SELECT count FROM warnings WHERE guild_id=? AND user_id=?", (ctx.guild.id, member.id), True)
    count = (row[0][0] if row else 0) + 1
    db_query("INSERT INTO warnings(guild_id,user_id,count,reason) VALUES(?,?,?,?) ON CONFLICT(guild_id,user_id) DO UPDATE SET count=excluded.count, reason=excluded.reason, updated_at=CURRENT_TIMESTAMP", (ctx.guild.id, member.id, count, reason))
    await ctx.send(f"Warned {member.mention}. Total warnings: **{count}**. Reason: {reason}")
    await send_log(ctx.guild, f"{ctx.author} warned {member} ({count}): {reason}")


@bot.command()
@commands.guild_only()
async def warnings(ctx, member: discord.Member):
    row = db_query("SELECT count, reason FROM warnings WHERE guild_id=? AND user_id=?", (ctx.guild.id, member.id), True)
    count, reason = row[0] if row else (0, "-")
    await ctx.send(f"{member.mention} has **{count}** warning(s). Last reason: {reason}")


@bot.command()
@commands.guild_only()
async def fine(ctx, member: discord.Member, amount: int, *, reason="No reason provided"):
    if not await mod_check(ctx):
        return
    if amount <= 0 or amount > 1_000_000:
        return await ctx.send("Amount must be between 1 and 1,000,000.")
    db_query("INSERT INTO fines(guild_id,user_id,amount,reason) VALUES(?,?,?,?)", (ctx.guild.id, member.id, amount, reason))
    await ctx.send(f"Fine recorded for {member.mention}: **{amount}**. Reason: {reason}")
    await send_log(ctx.guild, f"{ctx.author} fined {member} {amount}: {reason}")


@bot.command()
@commands.guild_only()
async def fines(ctx, member: discord.Member):
    rows = db_query("SELECT amount, reason, created_at FROM fines WHERE guild_id=? AND user_id=? ORDER BY id DESC LIMIT 10", (ctx.guild.id, member.id), True)
    total = sum(row[0] for row in rows)
    details = "\n".join(f"- {amount}: {reason}" for amount, reason, _ in rows) or "None"
    await ctx.send(f"**{member}** total fines: **{total}**\n{details}")


@bot.command()
@commands.guild_only()
async def timeout(ctx, member: discord.Member, minutes: int = 10, *, reason="No reason provided"):
    if not await mod_check(ctx):
        return
    if minutes < 1 or minutes > 28 * 24 * 60:
        return await ctx.send("Minutes must be between 1 and 40320.")
    try:
        await member.timeout(discord.utils.utcnow() + timedelta(minutes=minutes), reason=reason)
        await ctx.send(f"Timed out {member.mention} for {minutes} minutes.")
    except discord.Forbidden:
        await ctx.send("I cannot timeout this member. Check my role position and permissions.")


@bot.command()
@commands.guild_only()
async def kick(ctx, member: discord.Member, *, reason="No reason provided"):
    if not await mod_check(ctx):
        return
    try:
        await member.kick(reason=reason)
        await ctx.send(f"Kicked {member}.")
        await send_log(ctx.guild, f"{ctx.author} kicked {member}: {reason}")
    except discord.Forbidden:
        await ctx.send("I cannot kick this member. Check role hierarchy.")


@bot.command()
@commands.guild_only()
async def ban(ctx, member: discord.Member, *, reason="No reason provided"):
    if not await mod_check(ctx):
        return
    try:
        await member.ban(reason=reason, delete_message_seconds=0)
        await ctx.send(f"Banned {member}.")
        await send_log(ctx.guild, f"{ctx.author} banned {member}: {reason}")
    except discord.Forbidden:
        await ctx.send("I cannot ban this member. Check role hierarchy.")


@bot.command()
@commands.guild_only()
async def clear(ctx, amount: int = 10):
    if not await mod_check(ctx):
        return
    if amount < 1 or amount > 100:
        return await ctx.send("Choose a number between 1 and 100.")
    deleted = await ctx.channel.purge(limit=amount + 1)
    await ctx.send(f"Deleted {len(deleted) - 1} messages.", delete_after=5)


@bot.command()
@commands.guild_only()
async def lock(ctx):
    if not await mod_check(ctx):
        return
    await ctx.channel.set_permissions(ctx.guild.default_role, send_messages=False)
    await ctx.send("Channel locked.")


@bot.command()
@commands.guild_only()
async def unlock(ctx):
    if not await mod_check(ctx):
        return
    await ctx.channel.set_permissions(ctx.guild.default_role, send_messages=None)
    await ctx.send("Channel unlocked.")


@bot.command()
@commands.guild_only()
async def join(ctx):
    if not ctx.author.voice:
        return await ctx.send("Join a voice channel first.")
    if await send_voice_dependency_error(ctx):
        return
    try:
        await ctx.author.voice.channel.connect()
        await ctx.send("Joined the voice channel.")
    except RuntimeError as exc:
        await ctx.send(f"Voice setup failed: {exc}. Install FFmpeg and PyNaCl, then restart the bot.")
    except Exception as exc:
        await ctx.send(f"Could not join the voice channel: {exc}")


@bot.command()
@commands.guild_only()
async def stop(ctx):
    if ctx.voice_client:
        ctx.voice_client.stop()
        await ctx.voice_client.disconnect()
        await ctx.send("Music stopped and disconnected.")


song_cache_cyber = {}

@bot.command(name="song", aliases=["play", "p", "music"])
@commands.guild_only()
async def play(ctx, *, query: str):
    if not ctx.author.voice:
        return await ctx.send("Join a voice channel first.")
    if await send_voice_dependency_error(ctx):
        return

    if not query or not query.strip():
        return await ctx.send("Use: `!play song name` or `!play https://youtube.com/...`")

    cache_key = query.strip().lower()
    now_ts = time.time()
    cached = song_cache_cyber.get(cache_key)

    search_msg = None
    if cached and (now_ts - cached.get("timestamp", 0) < 7200):
        entry = cached
    else:
        search_msg = await ctx.send(f"⚡ Loading **'{query}'** instantly...")
        try:
            import yt_dlp
        except ImportError:
            return await search_msg.edit(content="Music dependency missing: install `yt-dlp` and `FFmpeg`.")

        target = query.strip()
        if not target.startswith(("http://", "https://")):
            target = f"ytsearch1:{target}"

        options = {
            "format": "bestaudio/best",
            "quiet": True,
            "no_warnings": True,
            "noplaylist": True,
            "default_search": "ytsearch1",
            "skip_download": True,
            "cachedir": True,
            "socket_timeout": 10,
        }
        try:
            with yt_dlp.YoutubeDL(options) as ydl:
                info = await asyncio.to_thread(ydl.extract_info, target, download=False)

            if isinstance(info, dict) and info.get("_type") == "playlist":
                entry = info["entries"][0]
            elif isinstance(info, dict) and info.get("entries"):
                entry = info["entries"][0]
            else:
                entry = info

            if not isinstance(entry, dict) or not entry.get("url"):
                raise ValueError("No valid audio result was found for that query.")

            song_cache_cyber[cache_key] = {
                "url": entry.get("url"),
                "title": entry.get("title", "audio"),
                "timestamp": now_ts,
            }
        except Exception as err:
            if search_msg:
                return await search_msg.edit(content=f"Could not find song: {err}")
            return await ctx.send(f"Could not find song: {err}")

    try:
        if not ctx.voice_client:
            await ctx.author.voice.channel.connect(reconnect=True, timeout=10.0)
        elif ctx.voice_client.channel != ctx.author.voice.channel:
            await ctx.voice_client.move_to(ctx.author.voice.channel)

        stream_url = entry.get("url")
        title = entry.get("title", "audio")

        ffmpeg_opts = {
            "before_options": "-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5 -probesize 32k -analyzeduration 0",
            "options": "-vn -b:a 192k -ar 48000",
        }
        source = discord.FFmpegPCMAudio(stream_url, **ffmpeg_opts)
        if ctx.voice_client.is_playing():
            ctx.voice_client.stop()
        ctx.voice_client.play(source)

        if search_msg:
            await search_msg.delete()
        await ctx.send(f"🎶 Now playing: **{title}**")
    except Exception as error:
        await ctx.send(f"Could not play that song: {error}")


if __name__ == "__main__":
    if not TOKEN:
        raise SystemExit("Set DISCORD_BOT_TOKEN in .env before starting the Discord bot.")
    bot.run(TOKEN)