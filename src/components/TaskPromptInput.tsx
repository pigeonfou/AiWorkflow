import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Play, 
  RotateCw, 
  AlertCircle,
  HelpCircle,
  Wand2,
  Cpu,
  Settings,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { AIProviderId, AIProvidersMap, PresetScenario } from '../types/workflow';
import { presetScenarios } from '../data/mockData';

interface TaskPromptInputProps {
  isRunning: boolean;
  onStartWorkflow: (prompt: string, scenario?: PresetScenario, aiProvider?: AIProviderId, aiModel?: string) => void;
  waitingReview: boolean;
  aiProviders: AIProvidersMap;
  selectedProviderId: AIProviderId;
  selectedModel: string;
  onSelectProvider: (providerId: AIProviderId) => void;
  onSelectModel: (modelId: string) => void;
  onOpenConfig: () => void;
}

export const TaskPromptInput: React.FC<TaskPromptInputProps> = ({
  isRunning,
  onStartWorkflow,
  waitingReview,
  aiProviders,
  selectedProviderId,
  selectedModel,
  onSelectProvider,
  onSelectModel,
  onOpenConfig,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<PresetScenario | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const activeProvider = aiProviders[selectedProviderId];
  const activeModelOption = activeProvider?.availableModels.find((m) => m.id === selectedModel) || activeProvider?.availableModels[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;
    onStartWorkflow(prompt, selectedScenario || undefined, selectedProviderId, selectedModel);
  };

  const handleSelectScenario = (scenario: PresetScenario) => {
    setSelectedScenario(scenario);
    setPrompt(scenario.prompt);
  };

  const handleProviderChange = (providerId: AIProviderId) => {
    onSelectProvider(providerId);
    const targetProvider = aiProviders[providerId];
    if (targetProvider) {
      onSelectModel(targetProvider.defaultModel);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3.5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-white">
            Soumettre une modification au projet
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="hidden sm:inline">Cycle continu : Code ➔ Branch ➔ Ubuntu ➔ Web Test ➔ Rollback</span>
          <button
            type="button"
            onClick={onOpenConfig}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300 font-medium ml-1 transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Configurer les liens IA & clés</span>
          </button>
        </div>
      </div>

      {/* AI Provider & Free Model Selection Bar */}
      <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5 mr-1">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            Moteur IA :
          </span>

          {/* Provider buttons */}
          {(['google', 'openai', 'anthropic', 'mistral'] as AIProviderId[]).map((provId) => {
            const prov = aiProviders[provId];
            const isSelected = selectedProviderId === provId;

            return (
              <button
                key={provId}
                type="button"
                onClick={() => handleProviderChange(provId)}
                disabled={isRunning}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-sm ring-1 ring-sky-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                } disabled:opacity-50 cursor-pointer`}
              >
                <span>{prov.iconEmoji}</span>
                <span>{prov.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Gratuit
                </span>
              </button>
            );
          })}
        </div>

        {/* Model Selector Dropdown & Provider info */}
        <div className="flex items-center gap-2 relative">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              disabled={isRunning}
              className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-750 text-slate-200 text-xs font-mono transition-colors min-w-[200px]"
            >
              <span className="truncate">{activeModelOption?.name || selectedModel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[11px] text-slate-400 font-sans border-b border-slate-800/80 mb-1">
                  Modèles disponibles pour {activeProvider.name} :
                </div>
                {activeProvider.availableModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => {
                      onSelectModel(model.id);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                      selectedModel === model.id
                        ? 'bg-sky-500/15 text-sky-200 font-medium'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs">{model.name}</span>
                      {model.freeTier && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          Free tier
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{model.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onOpenConfig}
            title="Modifier le lien d'endpoint API ou la clé de ce fournisseur"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preset scenario fast buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-400 self-center mr-1">Exemples pré-configurés :</span>
        {presetScenarios.map((sc) => {
          const isSelected = selectedScenario?.id === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              onClick={() => handleSelectScenario(sc)}
              disabled={isRunning}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-medium'
                  : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              } disabled:opacity-50`}
            >
              {sc.title}
            </button>
          );
        })}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              if (selectedScenario && e.target.value !== selectedScenario.prompt) {
                setSelectedScenario(null);
              }
            }}
            placeholder={`Décrivez la modification souhaitée (qui sera générée par ${activeProvider.name} : ${activeModelOption?.name})...`}
            disabled={isRunning || waitingReview}
            rows={2}
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none outline-none pr-36 transition-all disabled:opacity-60"
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={!prompt.trim() || isRunning || waitingReview}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 font-medium text-xs shadow-lg shadow-sky-500/20 disabled:shadow-none transition-all disabled:text-slate-500 cursor-pointer disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>En cours...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Lancer avec {activeProvider.name.split(' ')[0]}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Active Provider Free Tier info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>{activeProvider.name} : {activeProvider.freeTierNote}</span>
        </div>
        <div className="font-mono text-slate-500">
          Endpoint : {activeProvider.endpointUrl}
        </div>
      </div>

      {/* Notice info */}
      {selectedScenario && (
        <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
          <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-slate-200">{selectedScenario.title}: </span>
            {selectedScenario.description}
          </div>
        </div>
      )}

      {waitingReview && (
        <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/30">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Une demande est actuellement déployée sur le serveur Ubuntu et attend votre décision (Valider ou Rollback) ci-dessous.
          </span>
        </div>
      )}
    </div>
  );
};
