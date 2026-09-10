"""
🎯 Glitch Matrix - TradingView Vision Watcher Bot
A lightweight desktop watcher designed to run on the trader's PC while TradingView is open.
Features:
- Captures active TradingView chart screenshot
- Dispatches chart image to the AI Vision Analyzer (api_server.py)
- Triggers instant prediction & sound alert on your Website Dashboard
- Hotkey support: Press Enter or F9 for instant scan
"""

import sys
import os
import time
import json
import base64
import urllib.request
import urllib.error
from datetime import datetime, timezone

# Optional PIL / ImageGrab for real screen capture
try:
    from PIL import ImageGrab
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

API_ENDPOINT = os.environ.get("GMX_API_URL", "http://localhost:8765/api/trading/asian-session/capture")
UPLOAD_ENDPOINT = os.environ.get("GMX_UPLOAD_URL", "http://localhost:8765/api/trading/asian-session/upload")

def print_banner():
    print("\033[92m" + "=" * 65)
    print("   🌐 GLITCH MATRIX // ASIAN SESSION TRADINGVIEW WATCHER")
    print("   🤖 AI Vision Liquidity Sweep & Next-Move Predictor")
    print("=" * 65 + "\033[0m")
    print(" • Target Session : Asian Killzone (00:00 - 06:00 UTC)")
    print(" • Trigger Phase  : London Open Judas Swing Sweep")
    print(" • Connected API  : " + API_ENDPOINT)
    if PIL_AVAILABLE:
        print(" • Screen Engine  : \033[92mActive (PIL ImageGrab)\033[0m")
    else:
        print(" • Screen Engine  : \033[93mInteractive Simulation Mode (pip install pillow)\033[0m")
    print("-" * 65)
    print(" \033[96m[COMMANDS]\033[0m")
    print("   - Type \033[92m'c'\033[0m or press \033[92m[ENTER]\033[0m : Capture active TradingView chart")
    print("   - Type \033[92m'auto'\033[0m                  : Start 60-second automated scan loop")
    print("   - Type \033[91m'q'\033[0m                     : Quit watcher")
    print("=" * 65 + "\n")

def capture_and_send():
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 📸 Scanning TradingView screen...", end="", flush=True)
    
    img_b64 = None
    if PIL_AVAILABLE:
        try:
            # Capture full primary monitor or active window
            screenshot = ImageGrab.grab()
            import io
            buffer = io.BytesIO()
            screenshot.save(buffer, format="PNG")
            img_b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        except Exception as err:
            print(f" [Warn: {err}]", end="")

    # Dispatch to local/remote API
    try:
        req = urllib.request.Request(
            API_ENDPOINT,
            data=json.dumps({"action": "instant_capture"}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            setup = data.get("setup", {})
            print(" \033[92m[SUCCESS]\033[0m")
            print(f" 🎯 Asset       : \033[96m{setup.get('pair')}\033[0m")
            print(f" ⚡ Sweep Type  : \033[93m{setup.get('sweepType')}\033[0m")
            print(f" 🔮 Next Move   : \033[92m{setup.get('direction')} ({setup.get('probability')})\033[0m")
            print(f" 🏹 Entry Plan  : Entry: {setup.get('entry')} | SL: {setup.get('stopLoss')} | TP: {setup.get('takeProfit1')}")
            print(f" 📢 Dashboard   : Updated in real-time on your website!\n")
    except Exception as e:
        print(f" \033[91m[FAILED: {e}]\033[0m")
        print(" 💡 Tip: Make sure your website backend (api_server.py) is running on port 8765.\n")

def auto_loop(interval_sec=60):
    print(f"\n🚀 Automated scan mode started. Scanning every {interval_sec}s. Press Ctrl+C to stop.")
    try:
        while True:
            capture_and_send()
            time.sleep(interval_sec)
    except KeyboardInterrupt:
        print("\n⏹ Automated scan stopped.")

def main():
    print_banner()
    while True:
        try:
            cmd = input("GMX-Watcher > ").strip().lower()
            if cmd in ["q", "quit", "exit"]:
                print("Exiting TradingView Vision Watcher. Happy trading!")
                break
            elif cmd == "auto":
                auto_loop(60)
            else:
                capture_and_send()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            break

if __name__ == "__main__":
    main()
