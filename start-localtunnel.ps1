Write-Host "🌐 Code Collaborator - Local Network Setup" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

Write-Host "📡 Setting up local network collaboration..." -ForegroundColor Yellow
Write-Host "💡 Perfect for same WiFi/LAN connections!" -ForegroundColor Green
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
Write-Host "🔥 Starting the server..." -ForegroundColor Yellow
Write-Host ""

Write-Host "🌐 Your platform will be accessible on your local network" -ForegroundColor Cyan
Write-Host "💡 Share your IP address with friends on the same WiFi!" -ForegroundColor Yellow
Write-Host ""

Write-Host "🚀 Starting server..." -ForegroundColor Green
npm run server

Write-Host ""
Write-Host "✅ Your collaborative coding platform is ready for local network use!" -ForegroundColor Green
Write-Host "🌐 Friends on same WiFi can connect using your IP address!" -ForegroundColor Green
Write-Host ""
