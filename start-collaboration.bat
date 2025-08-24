@echo off
echo 🚀 Code Collaborator - Collaboration Setup
echo ========================================
echo.

echo 📡 Getting your network information...
echo.

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo 🌐 Your IP Address: %IP%
echo 🔧 Server Port: 5000
echo.
echo 📋 Share this URL with your friend:
echo    http://%IP%:5000
echo.
echo 💡 Make sure your friend is on the same WiFi/network!
echo.

echo 📦 Installing dependencies...
call npm run install-all
echo.

echo 🔥 Starting collaborative coding platform...
echo.
echo ✅ Your friend can now connect to: http://%IP%:5000
echo ⚠️  Keep this terminal open while collaborating!
echo.
call npm run dev
pause
