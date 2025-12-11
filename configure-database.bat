@echo off
echo ========================================
echo Bubbles Database Configuration
echo ========================================
echo.
echo Current database configuration:
findstr /C:"DATABASE_URL" backend\.env 2>nul
echo.
echo ========================================
echo Choose your database option:
echo ========================================
echo.
echo [1] Use SQLite (Local Development - Recommended for getting started)
echo [2] Use Railway PostgreSQL (Production/Cloud)
echo [3] Show current configuration
echo [Q] Quit
echo.
set /p choice="Enter your choice (1, 2, 3, or Q): "

if /i "%choice%"=="1" goto sqlite
if /i "%choice%"=="2" goto railway
if /i "%choice%"=="3" goto show
if /i "%choice%"=="Q" goto end
goto end

:sqlite
echo.
echo Configuring for SQLite (local development)...
powershell -Command "(Get-Content backend\.env) -replace '^DATABASE_URL=', '# DATABASE_URL=' | Set-Content backend\.env"
echo Done! DATABASE_URL has been commented out.
echo The backend will now use SQLite database at backend\bubbles.db
echo.
echo Next steps:
echo 1. Run: cd backend
echo 2. Run: npm run migrate
echo 3. Run: npm run dev
echo.
pause
goto end

:railway
echo.
echo Configuring for Railway PostgreSQL...
powershell -Command "(Get-Content backend\.env) -replace '^# DATABASE_URL=', 'DATABASE_URL=' | Set-Content backend\.env"
echo Done! DATABASE_URL is now active.
echo The backend will use your Railway PostgreSQL database.
echo.
echo Next steps:
echo 1. Make sure your Railway database is running
echo 2. Run: cd backend
echo 3. Run: npm run migrate
echo 4. Run: npm run dev
echo.
pause
goto end

:show
echo.
echo Current .env configuration:
type backend\.env
echo.
pause
goto end

:end
