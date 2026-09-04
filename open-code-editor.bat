@echo off
title Nexus 3D - Open Code Editor
color 0a
echo ===================================================
echo     Opening Project in Code Editor & Explorer...
echo ===================================================
echo.
cd /d "D:\my-3d-admin-panel"

where code >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Opening in VS Code...
    code .
) else (
    echo VS Code not found in PATH, opening Windows Explorer...
    explorer .
)

echo Done!
timeout /t 3
