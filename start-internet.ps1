Write-Host "🌍 Code Collaborator - Internet Collaboration Setup" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📡 Setting up internet access for collaboration..." -ForegroundColor Yellow
Write-Host ""

Write-Host "⚠️  IMPORTANT: You need ngrok installed for internet collaboration!" -ForegroundColor Red
Write-Host "💡 Download from: https://ngrok.com/download" -ForegroundColor Yellow
Write-Host ""

# Check if ngrok is installed
try {
    $ngrokVersion = ngrok version
    Write-Host "✅ ngrok found: $ngrokVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ngrok not found in PATH" -ForegroundColor Red
    Write-Host "💡 Please install ngrok and add it to your PATH" -ForegroundColor Yellow
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
Write-Host "🔥 Starting the server..." -ForegroundColor Yellow
Write-Host ""

# Start the server in background
Write-Host "🚀 Starting server in background..." -ForegroundColor Cyan
Start-Job -ScriptBlock { npm run server } | Out-Null

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "🌐 Starting ngrok tunnel..." -ForegroundColor Cyan
Write-Host "💡 This will give you a public URL to share with anyone on the internet!" -ForegroundColor Yellow
Write-Host ""

try {
    # Start ngrok tunnel
    ngrok http 5000
} catch {
    Write-Host "❌ Failed to start ngrok: $_" -ForegroundColor Red
    Write-Host "💡 Make sure ngrok is properly installed and in your PATH" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "✅ Your collaborative coding platform is now accessible worldwide!" -ForegroundColor Green
Write-Host "🌍 Share the ngrok URL with anyone, anywhere!" -ForegroundColor Green
Write-Host ""
