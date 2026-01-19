# Visual Studio Build Tools Installer
Write-Host "Installing Visual Studio Build Tools 2022..." -ForegroundColor Cyan
Write-Host "This will download and install required C++ build tools (~6-7GB)" -ForegroundColor Yellow
Write-Host ""

$url = "https://aka.ms/vs/17/release/vs_BuildTools.exe"
$installer = "$env:TEMP\vs_buildtools.exe"

Write-Host "Downloading installer..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "Failed to download installer: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting installation (this may take 20-30 minutes)..." -ForegroundColor Cyan
Write-Host "The installer window will open. Please wait for completion." -ForegroundColor Yellow
Write-Host ""

# Install with required components
$arguments = @(
    "--add", "Microsoft.VisualStudio.Workload.VCTools",
    "--add", "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
    "--add", "Microsoft.VisualStudio.Component.Windows11SDK.22000",
    "--includeRecommended",
    "--passive",
    "--norestart",
    "--wait"
)

try {
    Start-Process -FilePath $installer -ArgumentList $arguments -Wait -NoNewWindow
    Write-Host ""
    Write-Host "Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: You MUST restart your computer for changes to take effect!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After restart, run: npm run tauri:dev" -ForegroundColor Cyan
} catch {
    Write-Host "Installation failed: $_" -ForegroundColor Red
    exit 1
} finally {
    # Cleanup
    if (Test-Path $installer) {
        Remove-Item $installer -Force
    }
}

Write-Host ""
$restart = Read-Host "Do you want to restart now? (Y/N)"
if ($restart -eq "Y" -or $restart -eq "y") {
    Write-Host "Restarting computer in 10 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    Restart-Computer -Force
}
