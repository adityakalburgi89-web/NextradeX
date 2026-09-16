# PowerShell script for full system build verification

Write-Host "[INFO] Verifying NexTradeX Backend & Frontend Builds..." -ForegroundColor Cyan

# 1. Verify Backend
Write-Host "[INFO] Running Backend Compilation & Test Compile..." -ForegroundColor Yellow
Push-Location backend
.\mvnw clean test-compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Backend compilation failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "[SUCCESS] Backend Build Passed!" -ForegroundColor Green

# 2. Verify Frontend
Write-Host "[INFO] Running Frontend Build..." -ForegroundColor Yellow
Push-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Frontend build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "[SUCCESS] Frontend Build Passed!" -ForegroundColor Green

Write-Host "[SUCCESS] All system verification checks passed successfully!" -ForegroundColor Green
