$ErrorActionPreference = "Stop"

# Get the directory where this script resides (Scripts/)
$scriptDir = $PSScriptRoot
# Get the project root (parent of Scripts/)
$projectDir = Split-Path -Path $scriptDir -Parent

Write-Host "Project Root: $projectDir" -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
$backendDir = Join-Path -Path $projectDir -ChildPath "backend"

$backendProcess = Start-Process -FilePath "uv" -ArgumentList "run", "uvicorn", "main:app", "--reload" -WorkingDirectory $backendDir -PassThru -NoNewWindow
Write-Host "Backend running with PID: $($backendProcess.Id)" -ForegroundColor DarkGray

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
$frontendDir = Join-Path -Path $projectDir -ChildPath "frontend"

$frontendProcess = Start-Process -FilePath "cmd" -ArgumentList "/c", "npm", "run", "dev" -WorkingDirectory $frontendDir -PassThru

Write-Host "Services started! Press any key to stop..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Cleanup
try {
    Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Backend stopped." -ForegroundColor Red
} catch {
    Write-Host "Failed to stop backend cleanly." -ForegroundColor Red
}
