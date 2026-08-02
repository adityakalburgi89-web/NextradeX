#!/usr/bin/env bash
# Shell script for full system build verification (Linux / macOS)

set -e

echo "[INFO] Verifying NexTradeX Backend & Frontend Builds..."

echo "[INFO] Running Backend Compilation..."
(cd backend && ./mvnw clean test-compile)

echo "[INFO] Running Frontend Build..."
(cd frontend && npm run build)

echo "[SUCCESS] All system verification checks passed successfully!"
