@echo off
echo ============================================
echo   ADVENTURER - Setup App Stores (Capacitor)
echo ============================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe.
    echo Telecharge-le sur https://nodejs.org
    pause
    exit /b 1
)

echo [1/6] Installation des dependances...
call npm install

echo.
echo [2/6] Installation de Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard

echo.
echo [3/6] Build de l'application (export statique)...
set CAPACITOR_BUILD=true
call npx next build

echo.
echo [4/6] Ajout de la plateforme Android...
call npx cap add android

echo.
echo [5/6] Ajout de la plateforme iOS...
call npx cap add ios
if %errorlevel% neq 0 (
    echo [INFO] iOS necessite macOS avec Xcode. Skip sur Windows.
)

echo.
echo [6/6] Synchronisation des fichiers...
call npx cap sync

echo.
echo ============================================
echo   SETUP TERMINE !
echo ============================================
echo.
echo Pour ouvrir le projet Android :
echo   npx cap open android
echo   (necessite Android Studio)
echo.
echo Pour ouvrir le projet iOS :
echo   npx cap open ios
echo   (necessite macOS + Xcode)
echo.
echo Pour deployer sur Vercel en meme temps :
echo   npx vercel deploy --prod
echo.
pause
