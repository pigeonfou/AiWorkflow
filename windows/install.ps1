<#
.SYNOPSIS
    Script d'installation automatisé pour Windows 10 et Windows 11
.DESCRIPTION
    Installe, compile et configure GitOps Autopilot avec raccourci sur le Bureau
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Clear-Host

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "    🚀 GITOPS AUTOPILOT — INSTALLEUR POWERSHELL WINDOWS 10 / 11" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

# Vérification Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ERREUR] Node.js n'est pas installé sur cette machine." -ForegroundColor Red
    Write-Host "Téléchargez la version LTS sur : https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

$nodeVer = node -v
Write-Host "[1/4] Node.js détecté : $nodeVer" -ForegroundColor Green

# Dossier du projet
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Installation des dépendances
Write-Host "[2/4] Installation des dépendances npm..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Échec de npm install." -ForegroundColor Red
    exit 1
}

# Compilation
Write-Host "[3/4] Compilation du bundle Vite..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERREUR] Échec de la compilation." -ForegroundColor Red
    exit 1
}

# Création du raccourci Bureau Windows
Write-Host "[4/4] Création du raccourci Windows..." -ForegroundColor Cyan
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "GitOps Autopilot.lnk"

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoExit -Command Set-Location -Path '$projectRoot'; npm start"
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "GitOps Autopilot - DevOps & AI Autonomous Orchestrator"
$shortcut.IconLocation = "$env:SystemRoot\System32\imageres.dll,67"
$shortcut.Save()

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "    ✅ GITOPS AUTOPILOT A ÉTÉ INSTALLÉ SUR VOTRE PC !" -ForegroundColor Green
Write-Host "    Raccourci créé sur votre bureau : $shortcutPath" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

$response = Read-Host "Souhaitez-vous lancer l'application maintenant ? (O/N)"
if ($response -eq 'O' -or $response -eq 'o') {
    npm start
}
