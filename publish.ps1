# StradiFans - commit and push to GitHub (Vercel deploys automatically on push)
$ErrorActionPreference = "Continue"
Set-Location -LiteralPath $PSScriptRoot
$Repo = "KillianTR/stradifans"
$env:Path += ";C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

Start-Transcript -Path (Join-Path $PSScriptRoot ".publish.log") -Force | Out-Null

function Fail($msg) {
    Write-Host "[ERROR] $msg" -ForegroundColor Red
    Stop-Transcript | Out-Null
    exit 1
}

# ---- Tools ----
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Git..."
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements
}
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "Installing GitHub CLI..."
    winget install --id GitHub.cli -e --source winget --accept-package-agreements --accept-source-agreements
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail "Git not available. Run this script again." }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { Fail "GitHub CLI not available. Run this script again." }

# ---- GitHub login (only the first time) ----
gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Log in to GitHub: press ENTER, then paste the code shown below in the browser."
    gh auth login --web --git-protocol https -h github.com
}
gh auth setup-git *> $null

# ---- Version from data.js ----
$Version = "dev"
$m = Select-String -Path "data.js" -Pattern 'version:\s*"([^"]+)"' | Select-Object -First 1
if ($m) { $Version = $m.Matches[0].Groups[1].Value }

# ---- Local repo ----
if (-not (Test-Path ".git")) { git init -b main }
if (-not (git config user.name))  { git config user.name "KillianTR" }
if (-not (git config user.email)) { git config user.email "KillianTR@users.noreply.github.com" }

git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "StradiFans v$Version"
} else {
    Write-Host "Nothing new to commit."
}

# ---- Remote repo ----
git remote get-url origin *> $null
if ($LASTEXITCODE -ne 0) {
    gh repo view $Repo *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Creating public repo $Repo..."
        gh repo create $Repo --public --description "Unofficial fan hub for the Twitch streamer Stradi. Created by Vznum." --source . --remote origin
        if ($LASTEXITCODE -ne 0) { Fail "Could not create the GitHub repo." }
    } else {
        git remote add origin "https://github.com/$Repo.git"
    }
}

Write-Host ""
Write-Host "Pushing to GitHub..."
git push -u origin main
if ($LASTEXITCODE -ne 0) { Fail "Push failed." }

# ---- Link Vercel project to the repo (only the first time) ----
if (-not (Test-Path ".git\vercel-linked") -and (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "Connecting the Vercel project to GitHub..."
    vercel git connect "https://github.com/$Repo" --yes --scope killiantrs-projects
    if ($LASTEXITCODE -eq 0) { New-Item ".git\vercel-linked" -ItemType File -Force | Out-Null }
}

Write-Host ""
Write-Host "Done. https://github.com/$Repo" -ForegroundColor Green
Write-Host "Vercel will publish v$Version at https://stradifans.vercel.app in a few seconds."
Stop-Transcript | Out-Null
