# PowerShell script for full system build verification

Write-Host "🔍 Verifying NexTradeX Backend & Frontend Builds..." -ForegroundColor Cyan

# 1. Verify Backend
Write-Host "☕ Running Backend Compilation & Test Compile..." -ForegroundColor Yellow
Push-Location backend
.\mvnw clean test-compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend compilation failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Backend Build Passed!" -ForegroundColor Green

# 2. Verify Frontend
Write-Host "⚛️ Running Frontend Build..." -ForegroundColor Yellow
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Frontend Build Passed!" -ForegroundColor Green

Write-Host "🎉 All system verification checks passed successfully!" -ForegroundColor Green
