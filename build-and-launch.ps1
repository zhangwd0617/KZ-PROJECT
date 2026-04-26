# ERA Maou EX — Auto Build & Launch Script
# Usage: Right-click → "Run with PowerShell" or run in terminal: .\build-and-launch.ps1

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$DistFile    = Join-Path $ProjectRoot "dist\index.html"
$OutputFile  = Join-Path $ProjectRoot "ERA-Maou-EX.html"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ERA Maou EX — Build & Launch" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Build
Write-Host "`n[1/3] Running npm run build..." -ForegroundColor Yellow
Set-Location $ProjectRoot
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nBuild FAILED! Check errors above." -ForegroundColor Red
    pause
    exit 1
}

# 2. Copy to root as standalone launcher
if (Test-Path $DistFile) {
    Write-Host "`n[2/3] Copying dist/index.html -> ERA-Maou-EX.html..." -ForegroundColor Yellow
    Copy-Item -Path $DistFile -Destination $OutputFile -Force
    $size = (Get-Item $OutputFile).Length / 1KB
    Write-Host "Done! Output: $OutputFile ($([math]::Round($size,2)) KB)" -ForegroundColor Green
} else {
    Write-Host "`nERROR: dist/index.html not found!" -ForegroundColor Red
    pause
    exit 1
}

# 3. Launch browser
Write-Host "`n[3/3] Launching browser..." -ForegroundColor Yellow
Start-Process $OutputFile

Write-Host "`nAll done! Browser should open shortly." -ForegroundColor Green
Write-Host "Press any key to close this window..." -ForegroundColor DarkGray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
