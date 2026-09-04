import os
import signal
import subprocess
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PID_FILE = BASE_DIR / "bot.pid"
BOT_SCRIPT = BASE_DIR / "discord_bot_service.py"
LOG_FILE = BASE_DIR / "bot.log"


def get_pid():
    if not PID_FILE.exists():
        return None
    try:
        return int(PID_FILE.read_text(encoding="utf-8").strip())
    except ValueError:
        return None


def is_process_running(pid):
    if pid is None:
        return False

    try:
        if os.name == "nt":
            result = subprocess.run(
                ["tasklist", "/FI", f"PID eq {pid}"],
                capture_output=True,
                text=True,
                shell=True,
                check=False,
            )
            return str(pid) in result.stdout
        os.kill(pid, 0)
        return True
    except Exception:
        return False


def start_bot():
    pid = get_pid()
    if pid and is_process_running(pid):
        return {"status": "already_running", "pid": pid}

    with LOG_FILE.open("ab") as log_handle:
        process = subprocess.Popen(
            [sys.executable, str(BOT_SCRIPT)],
            stdout=log_handle,
            stderr=subprocess.STDOUT,
            stdin=subprocess.DEVNULL,
            start_new_session=True,
        )

    PID_FILE.write_text(str(process.pid), encoding="utf-8")
    return {"status": "started", "pid": process.pid}


def stop_bot():
    pid = get_pid()
    if not pid:
        return {"status": "not_running"}

    try:
        if os.name == "nt":
            subprocess.run(
                ["taskkill", "/PID", str(pid), "/F"],
                check=False,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        else:
            os.kill(pid, signal.SIGTERM)
    except Exception:
        pass

    time.sleep(1)

    if PID_FILE.exists():
        PID_FILE.unlink()

    return {"status": "stopped"}


def get_bot_status():
    pid = get_pid()
    return {
        "running": bool(pid and is_process_running(pid)),
        "pid": pid,
    }
