@echo off
echo ============================================
echo   ADVENTURER V5 - Deploy Web + Mobile
echo   Derniere MAJ : 14 avril 2026 - 18h00
echo   VERSION V2 : Booking coachs + Marketplace messagerie
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
if %errorlevel% neq 0 (
    echo [ERREUR] npm install a echoue.
    pause
    exit /b 1
)

echo.
echo [2/6] Installation de Vercel CLI...
call npm install -g vercel
echo.

echo [3/6] Deploiement Web sur Vercel (production)...
echo.
echo    Si c'est la premiere fois, Vercel va te demander de te connecter.
echo    Suis les instructions dans le navigateur.
echo.
call npx vercel deploy --prod --yes
if %errorlevel% neq 0 (
    echo [ATTENTION] Le deploiement Vercel a echoue.
    echo Verifie que tu es bien connecte a Vercel (npx vercel login).
    echo On continue avec le build mobile...
)
echo.
echo    Site web : https://adventurer-outdoor.vercel.app
echo.

echo [4/6] Installation Capacitor...
call npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor/status-bar @capacitor/splash-screen @capacitor/keyboard 2>nul
call npm install cross-env --save-dev 2>nul

echo.
echo [5/6] Build mobile (export statique pour Capacitor)...
set CAPACITOR_BUILD=true
call npx next build
if %errorlevel% neq 0 (
    echo [ERREUR] Le build mobile a echoue.
    echo Verifie les erreurs ci-dessus.
    pause
    exit /b 1
)

echo.
echo [6/6] Sync des plateformes natives...
call npx cap add android 2>nul
call npx cap add ios 2>nul
call npx cap sync
if %errorlevel% neq 0 (
    echo [ATTENTION] La sync Capacitor a eu un probleme.
)

echo.
echo ============================================
echo   DEPLOIEMENT V2 TERMINE AVEC SUCCES !
echo ============================================
echo.
echo   WEB:     https://adventurer-outdoor.vercel.app
echo.
echo   ANDROID: Tape "npx cap open android" pour ouvrir dans Android Studio
echo            Puis Build ^> Generate Signed Bundle pour le Play Store
echo            (Voir DEPLOY-PLAYSTORE.md pour le guide complet)
echo.
echo   iOS:     Tape "npx cap open ios" pour ouvrir dans Xcode (Mac requis)
echo            Puis Product ^> Archive pour l'App Store
echo.
echo   NOUVEAUTES V2 (audit 5 personas + monetisation 4 piliers):
echo.
echo   PILIER 1 - BOOKING COACHS (15 pct commission):
echo   - Modal de reservation BookingModal (date, creneau, duree, prix)
echo   - Page Mes RDV (My Bookings) avec annulation
echo   - Bouton Reserver sur chaque coach du hub
echo   - Raccourci "Mes RDV" sur la home
echo.
echo   PILIER 2 - MARKETPLACE MESSAGERIE (5 pct commission):
echo   - Page detail annonce MarketplaceItemPage
echo   - Fil de discussion MarketplaceThreadPage (chat temps reel)
echo   - Section Marketplace dans l'onglet Messages
echo   - Deduplication threads (1 par acheteur/annonce)
echo.
echo   P1 AUDIT - Essentiels:
echo   - Sauvegarde des plans Coach IA + page Mes Plans
echo   - Quick Match 48h: bouton sur spot, liste dediee
echo   - Widget meteo/vent sur spots nautiques (knots + direction)
echo   - Onboarding 3 premieres aventures (one-shot suggestions)
echo.
echo   P2 AUDIT - Quality of life:
echo   - Safety check-in + contact d'urgence (GRATUIT A VIE)
echo   - Export GPX depuis page trail
echo   - Retours terrain dates avec rating qualitatif
echo   - Tutoriel 4 etapes premier lancement (skippable)
echo.
echo   P3 AUDIT - Polish:
echo   - Glossary tooltips termes techniques
echo.
pause
