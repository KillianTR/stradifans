# StradiFans - download the audio of Twitch clips as mp3 into sounds/_raw/
# Double-click get-sound.bat: downloads every clip listed in sound-clips.txt that isn't downloaded yet.
# Or: get-sound.bat <clip url> <name>
param(
    [string]$Url = "",
    [string]$Name = ""
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

$jobs = @()
if ($Url) {
    if (-not $Name) { $Name = "clip-" + (Get-Date -Format "yyyyMMdd-HHmmss") }
    $jobs += [pscustomobject]@{ Name = $Name; Url = $Url }
} elseif (Test-Path "sound-clips.txt") {
    Get-Content "sound-clips.txt" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
            $i = $line.IndexOf("=")
            $jobs += [pscustomobject]@{ Name = $line.Substring(0, $i).Trim(); Url = $line.Substring($i + 1).Trim() }
        }
    }
}

foreach ($j in $jobs) {
    $out = "sounds\_raw\$($j.Name).mp3"
    if (Test-Path $out) { Write-Host "Already downloaded: $out"; continue }
    Write-Host ""
    Write-Host "Downloading $($j.Name)..."
    yt-dlp -x --audio-format mp3 --audio-quality 0 --no-playlist -o "sounds/_raw/$($j.Name).%(ext)s" $j.Url.Split("?")[0]
    if ($LASTEXITCODE -eq 0) { Write-Host "Done: $out" -ForegroundColor Green }
    else { Write-Host "[ERROR] Download failed: $($j.Name)" -ForegroundColor Red }
}
