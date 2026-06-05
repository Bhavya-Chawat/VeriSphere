@echo off
title VeriSphere Demo Launcher
echo =======================================================
echo          VeriSphere Hackathon Demo Launcher
echo =======================================================
echo.

echo [SETUP] Killing any processes on ports 3000 and 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 :4000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [SETUP] Ports cleared.
echo.

echo [SETUP] Clearing Next.js cache for clean start...
if exist "apps\web\.next" (
    rmdir /S /Q "apps\web\.next"
    echo [SETUP] Cache cleared.
) else (
    echo [SETUP] No cache found, skipping.
)
echo.

echo [1/2] Starting Backend API Server (Port 4000)...
start "VeriSphere API" cmd /k "pnpm --filter api dev"

echo [2/2] Starting Frontend Next.js Web App (Port 3000)...
start "VeriSphere Web" cmd /k "pnpm --filter web dev"

echo.
echo -------------------------------------------------------
echo  Both servers are starting in separate windows!
echo  Wait ~15 seconds for Next.js to compile on first run.
echo -------------------------------------------------------
echo.
echo  Frontend:  http://localhost:3000
echo  Backend:   http://localhost:4000/health
echo.
echo  Login: admin@verisphere.ai  /  password
echo =======================================================
pause
