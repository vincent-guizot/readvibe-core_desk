@echo off
title Stop ReadVibe Ecosystem
color 0c

echo ==============================================================================
echo                      STOPPING READVIBE ECOSYSTEM
echo ==============================================================================
echo.
echo Stopping services on ports 3360, 3355, and 3350...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ports = 3360, 3355, 3350; foreach ($p in $ports) { $procs = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($pidx in $procs) { if ($pidx -gt 0) { Write-Host \"Stopping process $pidx on port $p...\"; Stop-Process -Id $pidx -Force -ErrorAction SilentlyContinue } } }"

echo.
echo All ReadVibe ecosystem background processes stopped!
echo ==============================================================================
pause
