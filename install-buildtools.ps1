# Install Visual Studio Build Tools for Rust compilation
Write-Host "Downloading Visual Studio Build Tools..." -ForegroundColor Cyan

$installerUrl = "https://aka.ms/vs/17/release/vs_BuildTools.exe"
$installerPath = "$env:TEMP\vs_buildtools.exe"

# Download installer
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath

Write-Host "Starting Visual Studio Build Tools installer..." -ForegroundColor Cyan
Write-Host "Please select 'Desktop development with C++' in the installer" -ForegroundColor Yellow
Write-Host ""

# Run installer with required components
Start-Process -FilePath $installerPath -ArgumentList `
    "--add", "Microsoft.VisualStudio.Workload.VCTools", `
    "--add", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64", `
    "--add", "Microsoft.VisualStudio.Component.Windows11SDK.22000", `
    "--includeRecommended", `
    "--passive", `
    "--norestart" -Wait

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "Please RESTART your computer before building the app." -ForegroundColor Yellow
Write-Host ""
Write-Host "After restart, run: npm run tauri:dev" -ForegroundColor Cyan

# Cleanup
Remove-Item $installerPath -ErrorAction SilentlyContinue
