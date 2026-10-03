import React, { useState } from 'react';
import { 
  Globe, 
  Lock, 
  RotateCw, 
  Monitor, 
  Tablet, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Terminal,
  Sun,
  Moon,
  Download,
  ShieldCheck,
  Cpu,
  Layers,
  ExternalLink
} from 'lucide-react';
import { WebInspectionResult, WorkflowRun } from '../types/workflow';

interface ServerWebInspectorProps {
  currentRun: WorkflowRun | null;
  serverUrl: string;
}

export const ServerWebInspector: React.FC<ServerWebInspectorProps> = ({
  currentRun,
  serverUrl,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [appTheme, setAppTheme] = useState<'light' | 'dark'>('dark');
  const [isExporting, setIsExporting] = useState(false);
  const [csvDownloaded, setCsvDownloaded] = useState(false);

  const inspection = currentRun?.webInspection;
  const isRolledBack = currentRun?.status === 'rolled_back';
  const isApproved = currentRun?.status === 'approved';
  const prompt = currentRun?.taskPrompt?.toLowerCase() || '';

  // Has dark mode feature been deployed?
  const hasDarkModeFeature = !isRolledBack && (prompt.includes('sombre') || prompt.includes('dark'));
  // Has CSV export feature been deployed?
  const hasCsvFeature = !isRolledBack && (prompt.includes('csv') || prompt.includes('export'));
  // Has JWT feature been deployed?
  const hasJwtFeature = !isRolledBack && (prompt.includes('jwt') || prompt.includes('auth') || prompt.includes('sécurité'));

  const handleExportCsvMock = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setCsvDownloaded(true);
      setTimeout(() => setCsvDownloaded(false), 2500);
    }, 400);
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
      {/* Browser chrome header */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-1">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="font-sans font-semibold text-slate-200 text-xs flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            Navigateur Virtuel Ubuntu — Vérification E2E
          </span>
        </div>

        {/* URL Bar */}
        <div className="flex-1 max-w-md mx-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{inspection?.url || serverUrl}</span>
          <span className="text-slate-600 ml-auto shrink-0 text-[10px] bg-slate-900 px-1.5 py-0.5 rounded">
            {inspection ? `${inspection.httpStatus} OK · ${inspection.responseTimeMs}ms` : 'En attente de connexion'}
          </span>
        </div>

        {/* Viewport switchers */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewport('desktop')}
            title="Vue Ordinateur"
            className={`p-1.5 rounded transition-colors ${
              viewport === 'desktop' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            title="Vue Tablette (768px)"
            className={`p-1.5 rounded transition-colors ${
              viewport === 'tablet' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            title="Vue Mobile (375px)"
            className={`p-1.5 rounded transition-colors ${
              viewport === 'mobile' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Automated E2E assertion banner */}
      {inspection && (
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Inspection Automatisée Validée :
            </span>
            <span className="text-slate-300">
              Serveur HTTP 200 réactif, zéro plantage console, DOM interactif vérifié.
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            {inspection.assertions.map((a) => (
              <span key={a.id} className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{a.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Virtual Browser Viewport */}
      <div className="bg-slate-900/40 p-4 sm:p-6 flex justify-center items-start min-h-[380px] overflow-auto">
        <div
          className={`transition-all duration-300 rounded-xl border border-slate-800 shadow-2xl overflow-hidden ${getViewportWidthClass()} ${
            appTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
          }`}
        >
          {/* Simulated Web App Header */}
          <div
            className={`px-4 py-3 border-b flex items-center justify-between transition-colors ${
              appTheme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-100/90'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                <Layers className="w-4 h-4 text-sky-400" />
              </div>
              <span className="font-bold text-sm">Nexus Web Platform</span>
              {isRolledBack && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Version Restaurée (Pre-demande)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Dynamic Theme Toggle if deployed */}
              {hasDarkModeFeature && (
                <button
                  onClick={() => setAppTheme(appTheme === 'dark' ? 'light' : 'dark')}
                  title="Composant ThemeToggle nouvellement déployé"
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    appTheme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {appTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{appTheme === 'dark' ? 'Clair' : 'Sombre'}</span>
                </button>
              )}

              {/* Security Shield badge if JWT deployed */}
              {hasJwtFeature && (
                <div className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>JWT Protected</span>
                </div>
              )}

              <div
                className={`text-xs px-2.5 py-1 rounded-lg border font-mono ${
                  appTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-200 border-slate-300 text-slate-700'
                }`}
              >
                v2.4.{currentRun?.commitHash ? currentRun.commitHash.slice(0, 3) : '0'}
              </div>
            </div>
          </div>

          {/* Simulated Web App Body Content */}
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">Tableau de bord de Production</h3>
                <p className={`text-xs mt-0.5 ${appTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Serveur Ubuntu 24.04 LTS · Nginx Reverse Proxy · Node 22 runtime
                </p>
              </div>

              {/* Dynamic CSV Export button if deployed */}
              {hasCsvFeature && (
                <button
                  onClick={handleExportCsvMock}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{csvDownloaded ? 'Fichier CSV Téléchargé !' : 'Exporter les Métriques (CSV)'}</span>
                </button>
              )}
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={`p-3.5 rounded-lg border transition-colors ${
                  appTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs text-slate-400">Temps de Réponse API</div>
                <div className="text-lg font-bold font-mono mt-1 text-sky-400">46 ms</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">● Statut 200 OK</div>
              </div>
              <div
                className={`p-3.5 rounded-lg border transition-colors ${
                  appTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs text-slate-400">Uptime Serveur Ubuntu</div>
                <div className="text-lg font-bold font-mono mt-1 text-emerald-400">99.98%</div>
                <div className="text-[11px] text-slate-400 mt-0.5">14j 06h sans interruption</div>
              </div>
              <div
                className={`p-3.5 rounded-lg border transition-colors ${
                  appTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-xs text-slate-400">Dernier Déploiement</div>
                <div className="text-sm font-semibold font-mono mt-1 truncate">
                  {currentRun ? currentRun.commitHash : 'initial'}
                </div>
                <div className="text-[11px] text-sky-400 mt-0.5">
                  {currentRun?.branchName || 'main'}
                </div>
              </div>
            </div>

            {/* Realistic Data Table */}
            <div
              className={`rounded-lg border overflow-hidden text-xs ${
                appTheme === 'dark' ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
              }`}
            >
              <div
                className={`px-3 py-2 font-medium border-b flex items-center justify-between ${
                  appTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span>Endpoints & Services En Ligne</span>
                <span className="text-[11px] text-slate-400 font-normal">Surveillance active</span>
              </div>
              <div className="divide-y divide-slate-800/40">
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-mono">GET /api/health</span>
                  </div>
                  <span className="font-mono text-emerald-400">200 OK</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-mono">GET /api/profile</span>
                  </div>
                  <span className="font-mono text-emerald-400">
                    {hasJwtFeature ? '200 (Bearer Auth)' : '200 OK'}
                  </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="font-mono">GET /metrics</span>
                  </div>
                  <span className="font-mono text-emerald-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
