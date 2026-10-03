import React from 'react';
import { 
  X, 
  History, 
  GitCommit, 
  CheckCircle2, 
  Undo2, 
  Calendar, 
  Clock, 
  RotateCcw,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { WorkflowRun } from '../types/workflow';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  runs: WorkflowRun[];
  onSelectRun: (run: WorkflowRun) => void;
  onRestoreCheckpoint: (commitHash: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  runs,
  onSelectRun,
  onRestoreCheckpoint,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-950 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">
              Historique des Déploiements & Points de Restauration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {runs.length === 0 ? (
            <div className="text-center text-slate-500 py-12 text-xs">
              Aucun déploiement enregistré pour l'instant.
            </div>
          ) : (
            runs.map((r) => {
              const isApproved = r.status === 'approved';
              const isRolledBack = r.status === 'rolled_back';

              return (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-sky-400 font-semibold flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5" />
                      {r.commitHash}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isRolledBack
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {isApproved ? 'Validé' : isRolledBack ? 'Rollbacké' : 'En cours'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                    "{r.taskPrompt}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.createdAt}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectRun(r);
                          onClose();
                        }}
                        className="text-sky-400 hover:text-sky-300 font-medium"
                      >
                        Consulter
                      </button>
                      {r.commitHash && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Voulez-vous restaurer le serveur au commit ${r.commitHash} ?`)) {
                              onRestoreCheckpoint(r.commitHash);
                              onClose();
                            }
                          }}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                        >
                          <Undo2 className="w-3 h-3" />
                          <span>Restaurer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
