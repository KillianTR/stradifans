# StradiFans - download the audio of a Twitch clip as mp3 into sounds/_raw/
# Usage: get-sound.bat <clip url> [name]
param(
    [string]$Url = "https://www.twitch.tv/stradi/clip/RepleteCuteMetalMikeHogu-e8h4Km65hfCf9-AM",
    [string]$Name = "verstappen-clip"
)
Set-Location -LiteralPath $PSScriptRoot
$env:Path += ";$env:LOCALAPPDATA\Microsoft\WinGet\Links"

if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
    Write-Host "Installing yt-dlp (and FFmpeg)..."
    winget install --id yt-dlp.yt-dlp -e --source winget --accept-package-agreements --accept-source-agreements
    $env:Path += ";$env:LOCALAPPDATA\Microsoft\WinGet\Links"
}
if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    winget install --id Gyan.FFmpeg -e --source winget --accept-package-agreements --accept-source-agreements
    $env:Path += ";$env:LOCALAPPDATA\Microsoft\WinGet\Links"
}
if (-not (Get-Command yt-dlp -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] yt-dlp not available. Run this script again." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path "sounds\_raw" | Out-Null
$Url = $Url.Split("?")[0]
yt-dlp -x --audio-format mp3 --audio-quality 0 --no-playlist -o "sounds/_raw/$Name.%(ext)s" $Url
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Done: sounds\_raw\$Name.mp3" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Download failed." -ForegroundColor Red
}
