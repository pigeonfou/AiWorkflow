import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  Play, 
  RotateCw, 
  AlertCircle,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { PresetScenario } from '../types/workflow';
import { presetScenarios } from '../data/mockData';

interface TaskPromptInputProps {
  isRunning: boolean;
  onStartWorkflow: (prompt: string, scenario?: PresetScenario) => void;
  waitingReview: boolean;
}

export const TaskPromptInput: React.FC<TaskPromptInputProps> = ({
  isRunning,
  onStartWorkflow,
  waitingReview,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<PresetScenario | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;
    onStartWorkflow(prompt, selectedScenario || undefined);
  };

  const handleSelectScenario = (scenario: PresetScenario) => {
    setSelectedScenario(scenario);
    setPrompt(scenario.prompt);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-sky-400" />
          <h2 className="text-sm font-semibold text-white">
            Soumettre une modification au projet
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Cycle continu : Code ➔ Branch ➔ Ubuntu ➔ Web Test ➔ Review / Rollback
        </span>
      </div>

      {/* Preset scenario fast buttons */}
      <div className="mb-3.5 flex flex-wrap gap-2">
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
            placeholder="Ex: Ajouter un filtre de recherche en temps réel sur la liste des utilisateurs avec un indicateur de statut..."
            disabled={isRunning || waitingReview}
            rows={2}
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 resize-none outline-none pr-32 transition-all disabled:opacity-60"
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
                  <span>Lancer le cycle</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Notice info */}
      {selectedScenario && (
        <div className="mt-2.5 flex items-start gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
          <HelpCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-slate-200">{selectedScenario.title}: </span>
            {selectedScenario.description}
          </div>
        </div>
      )}

      {waitingReview && (
        <div className="mt-2.5 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/30">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Une demande est actuellement déployée sur le serveur Ubuntu et attend votre décision (Valider ou Rollback) ci-dessous.
          </span>
        </div>
      )}
    </div>
  );
};
