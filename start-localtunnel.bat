@echo off
echo 🌐 Code Collaborator - Local Network Setup
echo ========================================
echo.

echo 📡 Setting up local network collaboration...
echo 💡 Perfect for same WiFi/LAN connections!
echo.

echo 📦 Installing dependencies...
call npm run install-all
echo.

echo 🔥 Starting the server...
echo.

echo 🌐 Your platform will be accessible on your local network
echo 💡 Share your IP address with friends on the same WiFi!
echo.

echo 🚀 Starting server...
npm run server

echo.
echo ✅ Your collaborative coding platform is ready for local network use!
echo 🌐 Friends on same WiFi can connect using your IP address!
echo.
pause
