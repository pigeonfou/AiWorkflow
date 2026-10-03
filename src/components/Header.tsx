import React from 'react';
import { 
  Server, 
  GitBranch, 
  ShieldCheck, 
  History, 
  Settings, 
  FileCode2, 
  CheckCircle2,
  Terminal,
  Activity
} from 'lucide-react';
import { GitHubConfig, ServerConfig, WorkflowRun } from '../types/workflow';

interface HeaderProps {
  currentRun: WorkflowRun | null;
  serverConfig: ServerConfig;
  gitHubConfig: GitHubConfig;
  onOpenHistory: () => void;
  onOpenConfig: () => void;
  onOpenScripts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRun,
  serverConfig,
  gitHubConfig,
  onOpenHistory,
  onOpenConfig,
  onOpenScripts,
}) => {
  const isBusy = currentRun?.status === 'running';

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 p-[1px] shadow-lg shadow-sky-950/40">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white flex items-center gap-2">
                GitOps Autopilot
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Ubuntu & GitHub Loop
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Agent de modification, push, déploiement SSH Ubuntu, inspection E2E & auto-rollback
            </p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
          {/* Server Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-slate-200">{serverConfig.host.split('.')[0]}</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-medium">Port 22 SSH</span>
          </div>

          {/* GitHub Repo Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-slate-200">{gitHubConfig.repoName}</span>
            <span className="text-slate-500">·</span>
            <span className="text-sky-400 font-mono">origin/{gitHubConfig.baseBranch}</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <button
              onClick={onOpenHistory}
              title="Historique des déploiements et points de restauration"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenScripts}
              title="Exporter les scripts bash Ubuntu et GitHub Actions"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <FileCode2 className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenConfig}
              title="Configurer les connexions Serveur & GitHub"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
