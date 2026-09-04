@echo off
title Glitch Matrix - Cloudflare Global Public Tunnel
color 0a
cd /d "%~dp0"
echo ================================================================
echo       GLITCH MATRIX 3D ADMIN PANEL - GLOBAL PUBLIC LINK
echo ================================================================
echo.
echo [*] Exposing Port 3000 to the entire World via Cloudflare Tunnel...
echo [*] Anyone in the world can visit this HTTPS link on mobile/PC!
echo.
echo ================================================================
echo.
cloudflared.exe tunnel --url http://localhost:3000
pause
