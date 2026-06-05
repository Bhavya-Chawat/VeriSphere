@echo off
echo ===================================================
echo VeriSphere Hackathon Server Launcher
echo ===================================================
echo.
echo NOTE: Ensure you have populated your .env file with
echo GROQ_API_KEY and DATABASE_URL before starting!
echo.
echo Starting the Backend API Server...
cd apps\api
call npm run dev
pause
