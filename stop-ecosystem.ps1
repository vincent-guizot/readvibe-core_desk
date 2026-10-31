# Stop ReadVibe Ecosystem (PowerShell)
Write-Host "==============================================================================" -ForegroundColor Red
Write-Host "                     STOPPING READVIBE ECOSYSTEM                              " -ForegroundColor Red
Write-Host "==============================================================================" -ForegroundColor Red
Write-Host ""
Write-Host "Stopping services on ports 3360, 3355, and 3350..." -ForegroundColor Yellow

$ports = 3360, 3355, 3350
foreach ($p in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pidx in $pids) {
            if ($pidx -gt 0) {
                Write-Host "Stopping process $pidx on port $p..." -ForegroundColor Red
                Stop-Process -Id $pidx -Force -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host "Port $p is already idle." -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "All ReadVibe ecosystem background processes stopped!" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Red
