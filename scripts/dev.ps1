# PowerShell script for single-command developer environment setup

Write-Host "🚀 Starting NexTradeX Local Development Environment..." -ForegroundColor Green

# 1. Start Redis container if Docker is running
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "🐳 Starting Docker containers..." -ForegroundColor Cyan
    docker compose -f infrastructure/docker/docker-compose.monitoring.yml up -d
} else {
    Write-Host "⚠️ Docker not detected. Please ensure local Redis is running on port 6379." -ForegroundColor Yellow
}

# 2. Launch Backend in separate process
Write-Host "☕ Starting Backend (Spring Boot)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\mvnw spring-boot:run"

# 3. Launch Frontend in current terminal or separate process
Write-Host "⚛️ Starting Frontend (React)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "✅ NexTradeX local dev environment launched!" -ForegroundColor Green
