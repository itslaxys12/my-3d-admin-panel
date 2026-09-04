@echo off
title Glitch Matrix 3D Admin Panel & Bot Engine
color 0b
echo ===================================================
echo     Launching Glitch Matrix 3D Panel + Bot API
echo ===================================================
echo.
cd /d "%~dp0"

echo [1/3] Starting Python Bot API Backend (Port 8765)...
start "Glitch Bot API Server" cmd /k "cd /d %~dp0bots && python api_server.py"

timeout /t 2 /nobreak >nul

echo [2/3] Opening Browser...
start "" "http://localhost:3000"

echo [3/3] Starting 3D Web Dashboard (Vite on Port 3000)...
npm run dev

pause
