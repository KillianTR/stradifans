@echo off
REM StradiFans - publish (commit + push to GitHub, Vercel deploys automatically)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish.ps1"
echo.
pause
