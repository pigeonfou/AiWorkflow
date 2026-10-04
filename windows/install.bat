@echo off
chcp 65001 > nul
title GitOps Autopilot - Installation Windows 10/11

echo ======================================================================
echo    🚀 GITOPS AUTOPILOT — INSTALLATION WINDOWS 10 / WINDOWS 11
echo ======================================================================
echo.

:: 1. Vérification de Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas détecté sur votre PC Windows.
    echo Veuillez installer Node.js (version 20 ou 22 LTS recommandée) depuis :
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/4] Vérification de l'environnement Node.js...
node -v
npm -v
echo.

:: 2. Installation des dépendances
echo [2/4] Installation des dépendances du projet...
call npm install
if %errorlevel% neq 0 (
    echo [ERREUR] L'installation des dépendances npm a échoué.
    pause
    exit /b 1
)
echo.

:: 3. Compilation du projet
echo [3/4] Compilation des assets de production Vite...
call npm run build
if %errorlevel% neq 0 (
    echo [ERREUR] La compilation Vite a échoué.
    pause
    exit /b 1
)
echo.

:: 4. Création du raccourci Bureau Windows
echo [4/4] Création du raccourci Bureau Windows...
set SCRIPT_DIR=%~dp0
set TARGET_DIR=%SCRIPT_DIR%..
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\GitOps Autopilot.lnk'); $s.TargetPath = 'cmd.exe'; $s.Arguments = '/c cd /d \"' + '%TARGET_DIR%' + '\" && npm start'; $s.IconLocation = 'shell32.dll,13'; $s.Description = 'GitOps Autopilot - Déploiement & Auto-Healing'; $s.Save();"

echo.
echo ======================================================================
echo    ✅ INSTALLATION TERMINÉE AVEC SUCCÈS !
echo    Un raccourci a été ajouté sur votre Bureau Windows.
echo ======================================================================
echo.
echo Choisissez une option :
echo   [1] Lancer l'application immédiatement
echo   [2] Quitter
echo.
set /p opt="Votre choix (1 ou 2) : "

if "%opt%"=="1" (
    echo Démarrage de GitOps Autopilot...
    npm start
) else (
    echo Fin de l'installation.
)
