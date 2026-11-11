# CampusPulse College Portal Runner
Write-Host "Starting CampusPulse Development Servers..." -ForegroundColor Cyan

# 1. Start Backend in separate window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# 2. Start Frontend in separate window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Backend launching at:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend launching at: http://localhost:5173" -ForegroundColor Green
Write-Host "If database is not running, start Docker Desktop and run: docker compose up -d db" -ForegroundColor Yellow
