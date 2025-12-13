@echo off
echo ========================================
echo   Starting Sugarbum Development
echo ========================================
echo.

REM Start backend in new window
echo [1/2] Starting backend server...
start "Sugarbum Backend" cmd /k "cd /d %~dp0backend && npm run dev"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

REM Start Expo in new window
echo [2/2] Starting Expo mobile app...
start "Sugarbum Mobile (Expo)" cmd /k "cd /d %~dp0mobile && npx expo start --tunnel"

echo.
echo ========================================
echo   Both services are starting!
echo ========================================
echo.
echo Backend:  Will open in new window
echo Mobile:   Will open in new window (scan QR code)
echo.
echo Press any key to close this window...
pause >nul
