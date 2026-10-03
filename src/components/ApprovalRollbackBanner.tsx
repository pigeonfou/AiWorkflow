import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Undo2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles,
  GitBranch,
  ArrowRight,
  RotateCw
} from 'lucide-react';
import { WorkflowRun } from '../types/workflow';

interface ApprovalRollbackBannerProps {
  currentRun: WorkflowRun | null;
  onApprove: () => void;
  onRollback: () => void;
  isProcessingDecision: boolean;
}

export const ApprovalRollbackBanner: React.FC<ApprovalRollbackBannerProps> = ({
  currentRun,
  onApprove,
  onRollback,
  isProcessingDecision,
}) => {
  const [showConfirmRollback, setShowConfirmRollback] = useState(false);

  if (!currentRun) return null;

  if (currentRun.status === 'waiting_review') {
    return (
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border-2 border-sky-500/40 rounded-xl p-4 sm:p-5 shadow-xl shadow-sky-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <h3 className="text-sm font-semibold text-white">
                Vérification humaine requise : Les modifications vous conviennent-elles ?
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Le code a été généré, poussé sur GitHub (<span className="text-sky-400 font-mono">{currentRun.branchName}</span>), déployé sur le serveur Ubuntu et testé avec succès sur l'interface web ci-dessus.
            </p>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono pt-1">
              <span>Commit courant: <strong className="text-slate-200">{currentRun.commitHash}</strong></span>
              <span>·</span>
              <span>Dernier commit stable (Rollback target): <strong className="text-amber-300">{currentRun.previousCommitHash}</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {showConfirmRollback ? (
              <div className="flex items-center gap-2 bg-rose-950/60 p-1.5 rounded-lg border border-rose-500/40">
                <span className="text-xs text-rose-200 font-medium px-2">
                  Confirmer le rollback vers {currentRun.previousCommitHash} ?
                </span>
                <button
                  onClick={() => {
                    setShowConfirmRollback(false);
                    onRollback();
                  }}
                  disabled={isProcessingDecision}
                  className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                >
                  {isProcessingDecision ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
                  <span>Oui, restaurer l'état précédent</span>
                </button>
                <button
                  onClick={() => setShowConfirmRollback(false)}
                  disabled={isProcessingDecision}
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <>
                {/* Rollback button */}
                <button
                  onClick={() => setShowConfirmRollback(true)}
                  disabled={isProcessingDecision}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 hover:text-white font-medium text-xs transition-all cursor-pointer"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Refuser & Rollback Immédiat</span>
                </button>

                {/* Approve button */}
                <button
                  onClick={onApprove}
                  disabled={isProcessingDecision}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  {isProcessingDecision ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Fusion en cours...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Valider & Fusionner (Main)</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentRun.status === 'approved') {
    return (
      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-200">
              Modifications validées et fusionnées avec succès !
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Branche <strong className="text-slate-300">{currentRun.branchName}</strong> fusionnée sur main. Le serveur Ubuntu tourne sur la version validée. Vous pouvez soumettre une nouvelle demande.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRun.status === 'rolled_back') {
    return (
      <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Undo2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-rose-200">
              Rollback immédiat exécuté avec succès
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Serveur Ubuntu et code Git restaurés à l'état antérieur (<strong className="text-slate-200 font-mono">{currentRun.previousCommitHash}</strong>). Aucun changement n'a été conservé. Prêt pour une nouvelle demande.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
