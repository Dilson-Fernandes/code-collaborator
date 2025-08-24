Write-Host "🚀 Starting Code Collaborator..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm run install-all
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔥 Starting development servers..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🌐 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Please wait while servers start up..." -ForegroundColor Yellow
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "❌ Failed to start servers: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
