@echo off
title ReadVibe Ecosystem Launcher
color 0b

echo ==============================================================================
echo                      READVIBE ECOSYSTEM LAUNCHER
echo ==============================================================================
echo.
echo Starting all three standalone services in dedicated terminal windows...
echo.

cd /d "%~dp0"

:: 1. Launch VibeCore API (:3360)
echo [1/3] Launching VibeCore Backend API (Port 3360)...
start "VibeCore API [:3360]" cmd /k "cd /d "%~dp0vibecore" && echo [VibeCore API] Starting Express server on port 3360... && npm run dev"

:: Short delay to allow backend to bind port
timeout /t 2 /nobreak >nul

:: 2. Launch VibeDesk CMS (:3355)
echo [2/3] Launching VibeDesk CMS Backoffice (Port 3355)...
start "VibeDesk CMS [:3355]" cmd /k "cd /d "%~dp0vibedesk" && echo [VibeDesk CMS] Starting Vite server on port 3355... && npm run dev"

:: 3. Launch ReadVibe Client (:3350)
echo [3/3] Launching ReadVibe Client Web (Port 3350)...
start "ReadVibe Client [:3350]" cmd /k "cd /d "%~dp0readvibe" && echo [ReadVibe Client] Starting Next.js on port 3350... && npm run dev"

echo.
echo ==============================================================================
echo                   ALL READVIBE SERVICES ARE LAUNCHING!
echo ==============================================================================
echo.
echo   * ReadVibe Client    : http://localhost:3350
echo   * VibeDesk CMS       : http://localhost:3355
echo   * VibeCore REST API  : http://localhost:3360/api
echo.
echo Demo Accounts:
echo   - Admin       : admin@vibedesk.app (password123)
echo   - Librarian   : librarian@vibedesk.app (password123)
echo   - Member      : member@readvibe.app (password123)
echo.
echo To shut down all services, run stop-ecosystem.bat
echo ==============================================================================
pause
