@echo off
REM StradiFans - commit and push to GitHub (Vercel deploys automatically on push)
setlocal
cd /d "%~dp0"
set "REPO=KillianTR/stradifans"
set "PATH=%PATH%;C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

REM ---- Tools ----
where git >nul 2>nul
if errorlevel 1 (
  echo Installing Git...
  winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
)
where gh >nul 2>nul
if errorlevel 1 (
  echo Installing GitHub CLI...
  winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements
)
where git >nul 2>nul || (echo [ERROR] Git not available. Restart this script. & pause & exit /b 1)
where gh >nul 2>nul || (echo [ERROR] GitHub CLI not available. Restart this script. & pause & exit /b 1)

REM ---- GitHub login (only the first time) ----
gh auth status >nul 2>nul
if errorlevel 1 (
  echo.
  echo Log in to GitHub: press ENTER, then paste the code shown below in the browser.
  gh auth login --web --git-protocol https -h github.com
)
gh auth setup-git >nul 2>nul

REM ---- Version from data.js ----
set "VERSION=dev"
for /f tokens^=2^ delims^=^" %%v in ('findstr /c:"version:" data.js') do set "VERSION=%%v"

REM ---- Local repo ----
if not exist ".git" (
  git init -b main
)
git config user.name >nul 2>nul || git config user.name "KillianTR"
git config user.email >nul 2>nul || git config user.email "KillianTR@users.noreply.github.com"

git add -A
git commit -m "StradiFans v%VERSION%" >nul 2>nul && echo Committed v%VERSION%. || echo Nothing new to commit.

REM ---- Remote repo ----
git remote get-url origin >nul 2>nul
if errorlevel 1 (
  gh repo view %REPO% >nul 2>nul
  if errorlevel 1 (
    echo Creating public repo %REPO%...
    gh repo create %REPO% --public --description "Unofficial fan hub for the Twitch streamer Stradi. Created by Vznum." --source . --remote origin
  ) else (
    git remote add origin https://github.com/%REPO%.git
  )
)

echo.
echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (echo [ERROR] Push failed. & pause & exit /b 1)

REM ---- Link Vercel project to the repo (only the first time) ----
if not exist ".git\vercel-linked" (
  where vercel >nul 2>nul && (
    echo.
    echo Connecting the Vercel project to GitHub...
    call vercel git connect https://github.com/%REPO% --yes --scope killiantrs-projects && type nul > ".git\vercel-linked"
  )
)

echo.
echo Done. https://github.com/%REPO%
echo Vercel will publish the new version at https://stradifans.vercel.app in a few seconds.
pause
