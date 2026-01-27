# Port forward Gateway, Backend API, and Frontend for local access

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "MentorPlatform Port Forwarding" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting port forwarding for:" -ForegroundColor Yellow
Write-Host "  - Gateway (default namespace)"
Write-Host "  - Backend API (mentorplatform namespace)"
Write-Host "  - Frontend (default namespace)"
Write-Host ""

# Kill existing port-forwards
Write-Host "Stopping any existing port-forwards..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "kubectl" -and $_.CommandLine -like "*port-forward*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start port-forwards in background
Write-Host "Starting Gateway port-forward (localhost:30000)..." -ForegroundColor Green
Start-Job -ScriptBlock { kubectl port-forward -n default svc/mentorplatform-gateway-nodeport 30000:80 } | Out-Null

Write-Host "Starting Backend API port-forward (localhost:32080)..." -ForegroundColor Green
Start-Job -ScriptBlock { kubectl port-forward -n mentorplatform svc/mentorplatform-api-service 32080:80 } | Out-Null

Write-Host "Starting Frontend port-forward (localhost:30081)..." -ForegroundColor Green
Start-Job -ScriptBlock { kubectl port-forward -n default svc/mentorplatform-frontend-service 30081:80 } | Out-Null

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Port Forwarding Active" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Cyan
Write-Host "  Gateway:  http://localhost:30000" -ForegroundColor White
Write-Host "    - Health: http://localhost:30000/health"
Write-Host "    - API:    http://localhost:30000/api/..."
Write-Host ""
Write-Host "  Backend:  http://localhost:32080" -ForegroundColor White
Write-Host "    - Health: http://localhost:32080/health"
Write-Host "    - Swagger: http://localhost:32080/swagger"
Write-Host ""
Write-Host "  Frontend: http://localhost:30081" -ForegroundColor White
Write-Host ""
Write-Host "Active Jobs:" -ForegroundColor Cyan
Get-Job | Format-Table -AutoSize
Write-Host ""
Write-Host "Press Ctrl+C to stop, or run 'Get-Job | Stop-Job' to stop all" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Keep script running
try {
    Write-Host "Monitoring port-forwards (press Ctrl+C to stop)..." -ForegroundColor Yellow
    while ($true) {
        Start-Sleep -Seconds 5
        $jobs = Get-Job | Where-Object { $_.State -eq 'Running' }
        if ($jobs.Count -eq 0) {
            Write-Host "All port-forwards stopped" -ForegroundColor Red
            break
        }
    }
}
finally {
    Write-Host ""
    Write-Host "Stopping all port-forwards..." -ForegroundColor Yellow
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "Done" -ForegroundColor Green
}
