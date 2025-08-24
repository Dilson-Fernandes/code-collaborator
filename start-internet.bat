@echo off
echo 🌍 Code Collaborator - Internet Collaboration Setup
echo ================================================
echo.

echo 📡 Setting up internet access for collaboration...
echo.

echo ⚠️  IMPORTANT: You need ngrok installed for internet collaboration!
echo 💡 Download from: https://ngrok.com/download
echo.

echo 📦 Installing dependencies...
call npm run install-all
echo.

echo 🔥 Starting the server...
echo.

echo 🌐 Starting ngrok tunnel (make sure ngrok is in PATH)...
echo 💡 This will give you a public URL to share with anyone on the internet!
echo.

REM Start the server in background
start /B npm run server

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

REM Start ngrok tunnel
echo 🚀 Starting ngrok tunnel...
ngrok http 5000

echo.
echo ✅ Your collaborative coding platform is now accessible worldwide!
echo 🌍 Share the ngrok URL with anyone, anywhere!
echo.
pause
