# Port forward the API Gateway for local access

Write-Host "Forwarding Gateway port 8080 to localhost:5000..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Green
Write-Host "  Health:  http://localhost:5000/health"
Write-Host "  Metrics: http://localhost:5000/metrics"
Write-Host "  API:     http://localhost:5000/api/..."
Write-Host ""
Write-Host "Press Ctrl+C to stop port forwarding" -ForegroundColor Yellow
Write-Host ""

kubectl port-forward deployment/mentorplatform-gateway 5000:8080
