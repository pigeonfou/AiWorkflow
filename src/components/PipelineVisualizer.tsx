import React from 'react';
import { 
  Sparkles, 
  GitBranch, 
  GitPullRequest, 
  Server, 
  Globe, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Undo2
} from 'lucide-react';
import { PipelineStepId, WorkflowRun } from '../types/workflow';

interface PipelineVisualizerProps {
  currentRun: WorkflowRun | null;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({ currentRun }) => {
  const step = currentRun?.currentStep || 'idle';
  const status = currentRun?.status || 'pending';
  const iteration = currentRun?.iterationCount || 1;

  const stepsConfig = [
    {
      id: 'step-1',
      key: 'analyzing',
      label: '1. Demande & Analyse',
      sublabel: 'Compréhension du besoin',
      icon: Sparkles,
      isActive: step === 'analyzing',
      isCompleted: ['coding', 'git_push', 'ubuntu_deploy', 'web_verify', 'self_healing', 'user_review', 'approved', 'rolled_back'].includes(step),
    },
    {
      id: 'step-2',
      key: 'coding',
      label: '2. Génération Code',
      sublabel: 'Création du patch AST',
      icon: GitBranch,
      isActive: step === 'coding',
      isCompleted: ['git_push', 'ubuntu_deploy', 'web_verify', 'self_healing', 'user_review', 'approved', 'rolled_back'].includes(step),
    },
    {
      id: 'step-3',
      key: 'git_push',
      label: '3. Push GitHub',
      sublabel: currentRun?.branchName || 'Branche feature/...',
      icon: GitPullRequest,
      isActive: step === 'git_push',
      isCompleted: ['ubuntu_deploy', 'web_verify', 'self_healing', 'user_review', 'approved', 'rolled_back'].includes(step),
    },
    {
      id: 'step-4',
      key: 'ubuntu_deploy',
      label: '4. Déploiement Ubuntu',
      sublabel: 'SSH git pull & reload',
      icon: Server,
      isActive: step === 'ubuntu_deploy',
      isCompleted: ['web_verify', 'self_healing', 'user_review', 'approved', 'rolled_back'].includes(step),
    },
    {
      id: 'step-5',
      key: 'web_verify',
      label: '5. Inspection Web E2E',
      sublabel: 'Rendu DOM & Console 0 error',
      icon: Globe,
      isActive: step === 'web_verify',
      isCompleted: ['self_healing', 'user_review', 'approved', 'rolled_back'].includes(step),
    },
    {
      id: 'step-6',
      key: 'self_healing',
      label: '6. Auto-Correction',
      sublabel: iteration > 1 ? `Itération ${iteration} (Auto-Fix)` : 'Actif si crash 500',
      icon: Flame,
      isActive: step === 'self_healing',
      isCompleted: iteration > 1 && ['user_review', 'approved', 'rolled_back'].includes(step),
      isSelfHealing: true,
    },
    {
      id: 'step-7',
      key: 'user_review',
      label: '7. Décision Utilisateur',
      sublabel: status === 'approved' ? 'Approuvé (Merged)' : status === 'rolled_back' ? 'Rollback Restoré' : 'Valider ou Rollback',
      icon: status === 'approved' ? CheckCircle2 : status === 'rolled_back' ? Undo2 : ShieldCheck,
      isActive: step === 'user_review',
      isCompleted: ['approved', 'rolled_back'].includes(status),
      isRollback: status === 'rolled_back',
      isApproved: status === 'approved',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
      {/* Header with Iteration & State */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Pipeline Automatisé
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-300">
            Boucle Autonome Git ➔ Ubuntu ➔ Web ➔ Test ➔ Rollback
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {iteration > 1 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
              <RotateCcw className="w-3 h-3 animate-spin" />
              Auto-Healing : Itération {iteration}/3
            </span>
          )}

          {status === 'waiting_review' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              En attente de votre validation
            </span>
          )}

          {status === 'approved' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approuvé & Fusionné sur main
            </span>
          )}

          {status === 'rolled_back' && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
              <Undo2 className="w-3.5 h-3.5" />
              Rollback immédiat exécuté
            </span>
          )}
        </div>
      </div>

      {/* Steps Visual Chain */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {stepsConfig.map((s, idx) => {
          const Icon = s.icon;
          let containerClasses = 'bg-slate-950/60 border-slate-800/80 text-slate-400';
          let iconClasses = 'text-slate-500 bg-slate-900';

          if (s.isActive) {
            containerClasses = 'bg-sky-950/30 border-sky-500/40 text-sky-200 ring-1 ring-sky-500/30 shadow-lg shadow-sky-950/30';
            iconClasses = 'text-sky-400 bg-sky-950/80 animate-pulse';
          } else if (s.isApproved) {
            containerClasses = 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200';
            iconClasses = 'text-emerald-400 bg-emerald-950/80';
          } else if (s.isRollback) {
            containerClasses = 'bg-rose-950/20 border-rose-500/30 text-rose-200';
            iconClasses = 'text-rose-400 bg-rose-950/80';
          } else if (s.isCompleted) {
            containerClasses = 'bg-slate-900/90 border-slate-700/60 text-slate-300';
            iconClasses = 'text-emerald-400 bg-emerald-950/30';
          } else if (s.isSelfHealing && iteration === 1) {
            containerClasses = 'opacity-60 bg-slate-950/40 border-slate-800/50 text-slate-500';
          }

          return (
            <div
              key={s.id}
              className={`relative flex flex-col p-3 rounded-lg border transition-all duration-200 ${containerClasses}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-md ${iconClasses}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {s.isActive && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                )}
                {s.isCompleted && !s.isActive && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="font-medium text-xs text-white truncate">{s.label}</div>
              <div className="text-[11px] text-slate-400 truncate mt-0.5">{s.sublabel}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
