#!/usr/bin/env bash
# Shell script for full system build verification (Linux / macOS)

set -e

echo "🔍 Verifying NexTradeX Backend & Frontend Builds..."

echo "☕ Running Backend Compilation..."
(cd backend && ./mvnw clean test-compile)

echo "⚛️ Running Frontend Build..."
(cd frontend && npm run build)

echo "🎉 All system verification checks passed successfully!"
