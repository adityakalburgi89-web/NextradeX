#!/usr/bin/env bash
# Shell script for single-command developer environment setup (Linux / macOS)

set -e

echo "🚀 Starting NexTradeX Local Development Environment..."

if command -v docker &> /dev/null; then
    echo "🐳 Starting Docker containers..."
    docker compose -f infrastructure/docker/docker-compose.monitoring.yml up -d
else
    echo "⚠️ Docker not detected. Please ensure local Redis is running on port 6379."
fi

echo "☕ Starting Backend (Spring Boot)..."
(cd backend && ./mvnw spring-boot:run) &
BACKEND_PID=$!

echo "⚛️ Starting Frontend (React)..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo "✅ NexTradeX processes running (Backend PID: $BACKEND_PID, Frontend PID: $FRONTEND_PID)"
wait
