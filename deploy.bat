@echo off
REM StradiFans - deploy to Vercel (production)
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js / npm not found. Install Node.js from https://nodejs.org and run this again.
  pause
  exit /b 1
)

where vercel >nul 2>nul
if errorlevel 1 (
  echo Installing Vercel CLI...
  call npm i -g vercel
)

call vercel whoami >nul 2>nul
if errorlevel 1 (
  echo.
  echo Not logged in to Vercel. Opening the login page in your browser...
  call vercel login
)

echo.
echo Deploying StradiFans to Vercel...
call vercel deploy --prod --yes
echo.
echo Done. The production URL is shown above.
pause
