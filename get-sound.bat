@echo off
REM StradiFans - download a Twitch clip's audio as mp3 (sounds\_raw)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0get-sound.ps1" %*
echo.
pause
