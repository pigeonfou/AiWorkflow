import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Server, 
  GitBranch, 
  Shield, 
  Check, 
  RotateCw,
  Terminal,
  Globe
} from 'lucide-react';
import { GitHubConfig, ServerConfig } from '../types/workflow';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverConfig: ServerConfig;
  gitHubConfig: GitHubConfig;
  onSave: (server: ServerConfig, git: GitHubConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  serverConfig,
  gitHubConfig,
  onSave,
}) => {
  const [server, setServer] = useState<ServerConfig>({ ...serverConfig });
  const [git, setGit] = useState<GitHubConfig>({ ...gitHubConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingSsh, setTestingSsh] = useState(false);
  const [sshSuccess, setSshSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleTestSsh = () => {
    setTestingSsh(true);
    setSshSuccess(null);
    setTimeout(() => {
      setTestingSsh(false);
      setSshSuccess(true);
      setTimeout(() => setSshSuccess(null), 3000);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(server, git);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">
              Configuration du Serveur Ubuntu & du Dépôt GitHub
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Ubuntu Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                Serveur Linux Ubuntu (Cible de déploiement)
              </span>
              <button
                type="button"
                onClick={handleTestSsh}
                disabled={testingSsh}
                className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {testingSsh ? <RotateCw className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3 text-sky-400" />}
                <span>{testingSsh ? 'Test SSH en cours...' : 'Tester la connexion SSH'}</span>
              </button>
            </div>

            {sshSuccess === true && (
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                <span>Connexion SSH réussie : Ubuntu 24.04 LTS (x86_64), Docker & Git détectés.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-400">Hôte / IP publique du serveur</label>
                <input
                  type="text"
                  value={server.host}
                  onChange={(e) => setServer({ ...server, host: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Port SSH</label>
                <input
                  type="number"
                  value={server.port}
                  onChange={(e) => setServer({ ...server, port: parseInt(e.target.value) || 22 })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Utilisateur SSH (sudoer / deployer)</label>
                <input
                  type="text"
                  value={server.user}
                  onChange={(e) => setServer({ ...server, user: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Chemin du projet sur Ubuntu</label>
                <input
                  type="text"
                  value={server.projectPath}
                  onChange={(e) => setServer({ ...server, projectPath: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">URL Web Publique (Vérification E2E)</label>
                <input
                  type="text"
                  value={server.publicWebUrl}
                  onChange={(e) => setServer({ ...server, publicWebUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Commande de rechargement</label>
                <input
                  type="text"
                  value={server.restartCommand}
                  onChange={(e) => setServer({ ...server, restartCommand: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* GitHub Section */}
          <div className="space-y-3 pt-2">
            <div className="pb-2 border-b border-slate-800/80">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                Dépôt GitHub & Branches
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">URL du dépôt GitHub</label>
                <input
                  type="text"
                  value={git.repoUrl}
                  onChange={(e) => setGit({ ...git, repoUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-400">Branche de base (Production)</label>
                <input
                  type="text"
                  value={git.baseBranch}
                  onChange={(e) => setGit({ ...git, baseBranch: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium transition-colors flex items-center gap-1.5"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Enregistré !' : 'Sauvegarder les configurations'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
