Write-Host "🚀 Code Collaborator - Collaboration Setup" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📡 Getting your network information..." -ForegroundColor Yellow
Write-Host ""

# Get IP address
try {
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*", "Ethernet*" | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*"} | Select-Object -First 1).IPAddress
    
    if (-not $ipAddress) {
        $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*"} | Select-Object -First 1).IPAddress
    }
    
    Write-Host "🌐 Your IP Address: $ipAddress" -ForegroundColor Cyan
    Write-Host "🔧 Server Port: 5000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Share this URL with your friend:" -ForegroundColor White
    Write-Host "   http://$ipAddress`:5000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Make sure your friend is on the same WiFi/network!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ Could not determine IP address automatically" -ForegroundColor Red
    Write-Host "💡 You can manually find it by running 'ipconfig' in Command Prompt" -ForegroundColor Yellow
    Write-Host ""
}

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
Write-Host "🔥 Starting collaborative coding platform..." -ForegroundColor Yellow
Write-Host ""

if ($ipAddress) {
    Write-Host "✅ Your friend can now connect to: http://$ipAddress`:5000" -ForegroundColor Green
} else {
    Write-Host "✅ Your friend can connect to your computer's IP address on port 5000" -ForegroundColor Green
}

Write-Host "⚠️  Keep this terminal open while collaborating!" -ForegroundColor Yellow
Write-Host ""

try {
    npm run dev
} catch {
    Write-Host "❌ Failed to start servers: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
