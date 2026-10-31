# ReadVibe Ecosystem Launcher (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "                     READVIBE ECOSYSTEM LAUNCHER                              " -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting all three standalone services in dedicated terminal windows..." -ForegroundColor Yellow
Write-Host ""

$baseDir = $PSScriptRoot

# 1. Launch VibeCore API (:3360)
Write-Host "[1/3] Launching VibeCore Backend API (Port 3360)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\vibecore'; Write-Host '--- VibeCore Backend API (Port 3360) ---' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 2

# 2. Launch VibeDesk CMS (:3355)
Write-Host "[2/3] Launching VibeDesk CMS Backoffice (Port 3355)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\vibedesk'; Write-Host '--- VibeDesk CMS Backoffice (Port 3355) ---' -ForegroundColor Magenta; npm run dev"

# 3. Launch ReadVibe Client (:3350)
Write-Host "[3/3] Launching ReadVibe Client Web (Port 3350)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\readvibe'; Write-Host '--- ReadVibe Client Web (Port 3350) ---' -ForegroundColor Yellow; npm run dev"

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "                  ALL READVIBE SERVICES ARE LAUNCHING!                        " -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "  * ReadVibe Client    : http://localhost:3350" -ForegroundColor White
Write-Host "  * VibeDesk CMS       : http://localhost:3355" -ForegroundColor White
Write-Host "  * VibeCore REST API  : http://localhost:3360/api" -ForegroundColor White
Write-Host ""
Write-Host "Demo Accounts:" -ForegroundColor Gray
Write-Host "  - Admin       : admin@vibedesk.app (password123)" -ForegroundColor Gray
Write-Host "  - Librarian   : librarian@vibedesk.app (password123)" -ForegroundColor Gray
Write-Host "  - Member      : member@readvibe.app (password123)" -ForegroundColor Gray
Write-Host ""
Write-Host "To shut down all services, run ./stop-ecosystem.ps1" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan
