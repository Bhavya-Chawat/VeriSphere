@echo off
title VeriSphere Launcher
echo =======================================================
echo               VeriSphere Server Launcher
echo =======================================================
echo.

echo [SETUP] Killing any processes on ports 3000 and 4000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 :4000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo [SETUP] Ports cleared.
echo.

echo Starting Backend API Server (Port 4000)...
start "VeriSphere API" cmd /k "pnpm --filter api dev"

echo Starting Frontend Next.js Web App (Port 3000)...
start "VeriSphere Web" cmd /k "pnpm --filter web dev"

echo.
echo -------------------------------------------------------
echo  Both servers are starting in separate windows!
echo -------------------------------------------------------
echo  Frontend URL: http://localhost:3000
echo  Backend URL:  http://localhost:4000/health
echo =======================================================
