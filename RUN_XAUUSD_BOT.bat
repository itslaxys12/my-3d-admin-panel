@echo off
title GLITCH MATRIX - XAUUSD 5M LIVE TRADINGVIEW SNIPER BOT
color 0A
cd /d "D:\my-3d-admin-panel"

echo =============================================================================
echo    🏆 GLITCH MATRIX // XAUUSD (GOLD) 5M LIVE TRADINGVIEW SNIPER BOT
echo =============================================================================
echo.
echo  [1/2] Checking Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERROR] Python is not found in PATH!
    echo Please make sure Python 3.10+ is installed.
    echo.
    pause
    exit /b 1
)

echo  [2/2] Launching XAUUSD Live Sniper Bot (5M Timeframe)...
echo.
python bots/xauusd_tradingview_live_bot.py

if %errorlevel% neq 0 (
    echo.
    echo [!] Bot process stopped with an error code.
    pause
)
