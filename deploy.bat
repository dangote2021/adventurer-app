@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ==========================================================
echo   ADVENTURER V5 - Deploiement Production
echo   Derniere MAJ : 19 avril 2026 (v2 - services configures)
echo ==========================================================
echo.
echo Nouveautes de ce deploiement :
echo.
echo   [DATA] Base de donnees Supabase peuplee :
echo     - 31 spots outdoor reels (France) avec GPS
echo     - 10 evenements et defis communautaires
echo     - 8 coachs certifies avec profils complets
echo     - 15 articles marketplace d'occasion
echo     - Service layer queries.ts branche sur Supabase
echo.
echo   [PAGES] Pages branchees sur donnees reelles :
echo     - Explorer : spots, evenements, marketplace depuis Supabase
echo     - Home : spots, coachs, marketplace dynamiques
echo     - Map : markers geolocalises reels
echo     - Marketplace : articles d'occasion Supabase
echo     - Profil : donnees utilisateur Supabase
echo.
echo   [COACHING] Pages coach pretes pour le lancement :
echo     - /coach : hub coaching IA + humain
echo     - /coach/ai : generateur de plans IA
echo     - /coach/humain : 8 coachs pilotes verifies
echo     - /coach/humain/[id] : profils detailles + formulaire reservation
echo.
echo   [LEGAL] Pages legales completes :
echo     - Mentions legales, CGU, Politique de confidentialite
echo     - Email contact : adventurer.app.outdoor@gmail.com
echo.
echo   [SECURITE] Audit complet + corrections :
echo     - CRITIQUE: Next.js 14.2.3 → 14.2.35 (fix RCE CVE-2025-66478)
echo     - Auth JWT sur toutes les API routes (Stripe, Coach IA)
echo     - Fix open redirect : origin hardcode pour Stripe URLs
echo     - Security headers (HSTS, X-Frame-Options, CSP, etc.)
echo     - .gitignore cree (protection .env.local)
echo     - Messages d'erreur sanitises (pas de leak DB)
echo     - Source maps desactivees en production
echo.
echo   [AUTH] Corrections :
echo     - Logout appelle Supabase signOut() + Zustand clear
echo     - Suppression du fallback mock sur Google OAuth
echo     - Auth guard reutilisable (auth-guard.ts)
echo.
echo   [SERVICES] Configuration completee (19 avril) :
echo     - Stripe (mode test) : cle secrete + webhook configures
echo     - Resend : emails transactionnels prets
echo     - Anthropic : Coach IA operationnel (claude-sonnet-4-6)
echo     - Vercel Analytics + Speed Insights actives
echo.
echo   [NOUVEAUX FICHIERS] :
echo     - src/app/booking/success + cancelled : pages callback Stripe coaching
echo     - src/app/marketplace/success + cancelled : pages callback Stripe marketplace
echo     - src/app/not-found.tsx : page 404 personnalisee
echo     - src/app/error.tsx : page erreur personnalisee
echo     - src/app/loading.tsx : animation de chargement globale
echo     - Vercel Analytics + Speed Insights dans layout.tsx
echo.
echo   [SUPABASE] Configuration complete :
echo     - Google OAuth configure (Client ID + Secret)
echo     - Redirect URLs (prod + localhost + callback)
echo     - Schema SQL (28 tables + RLS + triggers)
echo     - Email templates verifies
echo.
echo ==========================================================
echo.

REM --- 1. Verification de Node.js ---
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js n'est pas installe.
    echo     Telecharge-le depuis https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo [OK] Node.js detecte : !NODE_VER!
echo.

REM --- 2. Git commit + push (uniquement si c'est un repo git) ---
if exist ".git" (
    echo [1/4] Commit Git des modifications...
    git add -A
    git diff --cached --quiet
    if !errorlevel! equ 0 (
        echo     Aucune modification a committer. On continue.
    ) else (
        git commit -m "deploy: services configures, pages callback Stripe, analytics, 404/error pages"
        if !errorlevel! neq 0 (
            echo [ATTENTION] Le commit a echoue, on continue quand meme.
        ) else (
            echo [OK] Commit cree.
        )
    )
    echo.
    echo [2/4] Push vers le repo distant...
    git push
    if !errorlevel! neq 0 (
        echo [ATTENTION] Le push a echoue. On continue avec Vercel direct...
    ) else (
        echo [OK] Push reussi.
    )
    echo.
) else (
    echo [INFO] Pas de repo git detecte, on passe directement au deploiement Vercel.
    echo        Pour activer git : "git init" puis "git remote add origin URL_DU_REPO"
    echo.
)

REM --- 3. Installation des dependances ---
echo [3/4] Installation des dependances...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [X] ERREUR : npm install a echoue.
    pause
    exit /b 1
)
echo [OK] Dependances installees.
echo.

REM --- 4. Deploiement Vercel ---
echo [4/4] Deploiement sur Vercel (production)...
echo.
set "DEPLOY_URL="
for /f "usebackq tokens=*" %%a in (`npx vercel deploy --prod --yes 2^>^&1`) do (
    echo %%a
    echo %%a | findstr /b /c:"https://" >nul && set "DEPLOY_URL=%%a"
)

if "!DEPLOY_URL!"=="" (
    echo.
    echo [X] ERREUR : impossible de recuperer l'URL de deploiement.
    echo     Verifie les logs Vercel ci-dessus.
    pause
    exit /b 1
)

echo.
echo Ouverture du navigateur...
start "" "!DEPLOY_URL!"
start "" "https://adventurer-outdoor.vercel.app"

echo.
echo ==========================================================
echo   DEPLOIEMENT TERMINE AVEC SUCCES
echo ==========================================================
echo.
echo   URL du deploiement : !DEPLOY_URL!
echo   URL de production  : https://adventurer-outdoor.vercel.app
echo.
echo   Fichiers cles :
echo     src/lib/supabase/queries.ts       Service layer Supabase
echo     src/lib/supabase/auth-guard.ts    Helper auth JWT
echo     src/app/coach/*                   Hub coaching IA + humain
echo     src/app/legal/*                   Mentions, CGU, privacy
echo     src/app/explore/*                 Explorer spots/events/market
echo     src/app/api/stripe/*              Auth + origin fix
echo     src/app/api/coach/ai/route.ts     Auth guard ajoute
echo     src/components/pages/ProfilePage  Logout Supabase + Zustand
echo     next.config.mjs                   Security headers + no sourcemaps
echo     docs/GUIDE-LANCEMENT.md           Guide lancement complet
echo.
echo ==========================================================
echo.
echo Appuie sur une touche pour fermer...
pause >nul
endlocal
