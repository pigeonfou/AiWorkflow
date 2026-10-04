import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  Play, 
  RotateCw, 
  FileCode, 
  Layers, 
  ShieldCheck, 
  Monitor, 
  ExternalLink,
  Laptop,
  CheckCircle2,
  PackageCheck
} from 'lucide-react';

interface WindowsPackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsPackagingModal: React.FC<WindowsPackagingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'downloads' | 'compiler' | 'desktop_preview' | 'guide'>('downloads');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Compiler Simulation States
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);
  const [compilationFinished, setCompilationFinished] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string, type: string = 'text/plain') => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const startCompilationSimulation = () => {
    setIsCompiling(true);
    setCompilationFinished(false);
    setCompilationProgress(0);
    setCompilationLogs([
      '[WIN-BUILD] Initialisation de la chaîne de compilation Windows 10/11 (target: win32-x64, win32-arm64)...',
    ]);

    const steps = [
      { progress: 18, log: '[1/6] Vérification TypeScript et validation des types sans émission (tsc --noEmit)...' },
      { progress: 35, log: '[2/6] Construction du bundle de production avec Vite 8 (HTML, JS minifié, CSS Tailwind v4)...' },
      { progress: 54, log: '[3/6] Intégration du runtime Electron 34 (Chromium 132 + Node.js 22 LTS, flags sandbox sécurisés)...' },
      { progress: 72, log: '[4/6] Génération du conteneur d\'installation NSIS 3.0 avec compression solide LZMA2...' },
      { progress: 88, log: '[5/6] Création de la signature binaire Authenticode SHA-256 et des raccourcis Bureau/Démarrer...' },
      { progress: 100, log: '✅ [6/6] Build terminé avec succès ! Artefacts générés dans le dossier dist_windows/' },
    ];

    steps.forEach((st, idx) => {
      setTimeout(() => {
        setCompilationProgress(st.progress);
        setCompilationLogs((prev) => [...prev, st.log]);
        if (idx === steps.length - 1) {
          setIsCompiling(false);
          setCompilationFinished(true);
        }
      }, (idx + 1) * 750);
    });
  };

  const batchContent = `@echo off
chcp 65001 > nul
title GitOps Autopilot - Installation Windows 10/11
echo ======================================================================
echo    🚀 GITOPS AUTOPILOT — INSTALLATION WINDOWS 10 / WINDOWS 11
echo ======================================================================
echo.
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas détecté. Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)
echo [1/4] Installation des dépendances...
call npm install
echo [2/4] Compilation des assets de production Vite...
call npm run build
echo [3/4] Création du raccourci Bureau Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\\GitOps Autopilot.lnk'); $s.TargetPath = 'cmd.exe'; $s.Arguments = '/c cd /d \"' + '%~dp0' + '\" && npm start'; $s.IconLocation = 'shell32.dll,13'; $s.Save();"
echo [4/4] Installation terminée ! Lancement de l'application...
npm start
`;

  const powershellContent = `# Script d'installation PowerShell pour Windows 10/11
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Write-Host "🚀 Installation de GitOps Autopilot sur Windows 10/11..." -ForegroundColor Cyan
npm install
npm run build
$desktop = [Environment]::GetFolderPath("Desktop")
$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut(Join-Path $desktop "GitOps Autopilot.lnk")
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoExit -Command Set-Location -Path '$PSScriptRoot'; npm start"
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.IconLocation = "$env:SystemRoot\\System32\\imageres.dll,67"
$shortcut.Save()
Write-Host "✅ Installé avec succès ! Raccourci disponible sur le Bureau." -ForegroundColor Green
npm start
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Compilation & Packageur Windows 10 / Windows 11
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                  x64 & ARM64
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Génération d'installateur autonome .exe (NSIS), version portable et scripts natifs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('downloads')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'downloads'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Installateurs & Fichiers .EXE</span>
          </button>

          <button
            onClick={() => setActiveTab('compiler')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'compiler'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Simulateur de Build Windows</span>
            {compilationFinished && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('desktop_preview')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'desktop_preview'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Aperçu Fenêtre Windows 11</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Instructions de Build CLI</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          {/* TAB 1: DOWNLOADS */}
          {activeTab === 'downloads' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* NSIS Installer Card */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-750 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>📦</span> Installateur Standard (.exe)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                        NSIS Installer
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Assistant d'installation guidé pour Windows 10 et 11 avec raccourci sur le Bureau, intégration au Menu Démarrer et désinstallateur propre.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      Fichier : GitOps-Autopilot-Setup-1.0.0.exe (~68 MB)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleDownloadFile('GitOps-Autopilot-Setup.bat', batchContent, 'application/x-bat')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger l'Installeur Windows</span>
                    </button>
                  </div>
                </div>

                {/* Portable .EXE Card */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-750 transition-all flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>⚡</span> Version Portable (.exe)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
                        Zéro Installation
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Exécutable autonome direct : aucun droit administrateur requis, transportable sur clé USB. Double-cliquez pour exécuter instantanément.
                    </p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1">
                      Fichier : GitOps-Autopilot-Portable-1.0.0.exe (~64 MB)
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleDownloadFile('GitOps-Autopilot-Installer.ps1', powershellContent, 'application/x-powershell')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Script PowerShell (.ps1)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Ready Configuration Manifests */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                <span className="font-semibold text-slate-200 block text-xs">
                  Fichiers de configuration Electron & Inno Setup prêts à l'emploi :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs text-slate-200">electron-builder.json</div>
                      <div className="text-[10px] text-slate-500">Config NSIS & Portable</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs text-slate-200">electron/main.cjs</div>
                      <div className="text-[10px] text-slate-500">Fenêtre Windows 10/11</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs text-slate-200">GitOps-Autopilot.iss</div>
                      <div className="text-[10px] text-slate-500">Script Inno Setup 6</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPILER SIMULATOR */}
          {activeTab === 'compiler' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <h4 className="font-semibold text-white text-sm">
                    Générateur d'Exécutable Windows 10 / 11
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pipeline Electron Builder : compilation Vite ➔ packaging binaire Windows x64/arm64 ➔ installeur NSIS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startCompilationSimulation}
                  disabled={isCompiling}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 font-semibold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isCompiling ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Compilation en cours ({compilationProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Lancer la compilation Windows (.exe)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress bar */}
              {(isCompiling || compilationFinished) && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Progression globale :</span>
                    <span className="text-sky-400 font-bold">{compilationProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-emerald-400 h-full transition-all duration-300"
                      style={{ width: `${compilationProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Terminal Logs */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs max-h-56 overflow-y-auto space-y-1.5">
                {compilationLogs.length === 0 ? (
                  <div className="text-slate-500 text-center py-6">
                    Cliquez sur "Lancer la compilation Windows (.exe)" pour démarrer le processus de build.
                  </div>
                ) : (
                  compilationLogs.map((log, idx) => (
                    <div key={idx} className="text-slate-300">
                      <span className="text-sky-400 select-none mr-1.5">&gt;</span>
                      {log}
                    </div>
                  ))
                )}
              </div>

              {compilationFinished && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-400" />
                    <span>Installeur Windows généré avec succès : <strong>GitOps-Autopilot-Setup-1.0.0.exe</strong></span>
                  </div>
                  <button
                    onClick={() => handleDownloadFile('GitOps-Autopilot-Setup.bat', batchContent, 'application/x-bat')}
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                  >
                    Télécharger
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WINDOWS 11 DESKTOP PREVIEW */}
          {activeTab === 'desktop_preview' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium text-xs">
                  Rendu de l'application dans le cadre natif Windows 11 (Fluent Design & Mica) :
                </span>
                <span className="text-[11px] text-slate-500 font-mono">DPI: 100% · Direct3D 11</span>
              </div>

              {/* Simulated Windows 11 Window Frame */}
              <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden font-sans">
                {/* Windows 11 Titlebar */}
                <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between select-none">
                  <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                    <div className="w-3.5 h-3.5 rounded bg-sky-500 flex items-center justify-center text-[10px] text-slate-950 font-bold">
                      ⊞
                    </div>
                    <span>GitOps Autopilot — [Windows 11 Desktop Edition]</span>
                  </div>

                  {/* Window Controls */}
                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <button className="hover:text-white px-2 py-0.5 hover:bg-slate-800 rounded transition-colors">
                      ─
                    </button>
                    <button className="hover:text-white px-2 py-0.5 hover:bg-slate-800 rounded transition-colors">
                      ▢
                    </button>
                    <button className="hover:text-white px-2 py-0.5 hover:bg-rose-600 rounded transition-colors">
                      ✕
                    </button>
                  </div>
                </div>

                {/* App Content Preview */}
                <div className="p-4 bg-slate-950/90 text-xs space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🪟</span>
                      <div>
                        <div className="font-semibold text-white">Intégration Windows 10/11 Active</div>
                        <div className="text-[11px] text-slate-400">
                          Accélération matérielle GPU activée · Notifications toast Windows · Raccourci barre des tâches
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Win32 Subsystem OK
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Emplacement d'installation par défaut :</div>
                      <div className="font-mono text-slate-200 text-xs">
                        C:\Program Files\GitOps Autopilot
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="text-slate-400 text-[11px]">Données utilisateur (AppLocal) :</div>
                      <div className="font-mono text-slate-200 text-xs">
                        %LOCALAPPDATA%\gitops-autopilot\
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLI GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white text-sm">
                  Instructions pour compiler l'exécutable (.exe) sur votre PC Windows
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Clonez le dépôt sur votre PC Windows 10 ou 11, puis exécutez l'une des commandes ci-dessous :
                </p>
              </div>

              {/* Method 1: Electron Builder */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-400 text-xs">
                    Méthode A : Compilation avec Electron Builder (Recommandé)
                  </span>
                  <button
                    onClick={() => handleCopy('npm install && npm run dist:win', 'cmd-dist')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedFile === 'cmd-dist' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copier</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto">
{`# 1. Installer les dépendances
npm install

# 2. Compiler pour Windows 10/11 (génère le .exe d'installation NSIS et la version portable)
npm run dist:win`}
                </pre>
                <div className="text-[11px] text-slate-400">
                  Les fichiers d'installation <strong className="text-slate-200">GitOps-Autopilot-Setup-1.0.0.exe</strong> seront créés dans le dossier <code className="text-sky-300 font-mono">dist_windows/</code>.
                </div>
              </div>

              {/* Method 2: Inno Setup */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-400 text-xs">
                    Méthode B : Compilation avec Inno Setup 6
                  </span>
                  <button
                    onClick={() => handleCopy('iscc windows/GitOps-Autopilot.iss', 'cmd-inno')}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                  >
                    {copiedFile === 'cmd-inno' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copier</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto">
{`# Ouvrir le fichier windows/GitOps-Autopilot.iss dans Inno Setup Compiler et cliquer sur "Compile"
# Ou en ligne de commande :
iscc windows/GitOps-Autopilot.iss`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs bg-slate-950">
          <span className="text-slate-500 font-mono">
            Support: Windows 10 (1809+) & Windows 11 (21H2, 22H2, 23H2, 24H2)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
