@echo off
echo 🚀 Starting Code Collaborator...
echo.
echo 📦 Installing dependencies...
call npm run install-all
echo.
echo 🔥 Starting development servers...
echo.
echo 🌐 Frontend will be available at: http://localhost:3000
echo 🔧 Backend will be available at: http://localhost:5000
echo.
echo ⏳ Please wait while servers start up...
echo.
call npm run dev
pause
