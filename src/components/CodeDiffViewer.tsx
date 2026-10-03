import React, { useState } from 'react';
import { FileCode, Plus, Minus, GitCommit, Copy, Check } from 'lucide-react';
import { DiffFile } from '../types/workflow';

interface CodeDiffViewerProps {
  diffs: DiffFile[];
  branchName?: string;
  commitHash?: string;
}

export const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({
  diffs,
  branchName,
  commitHash,
}) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!diffs || diffs.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
        Aucune modification de code générée pour le moment.
      </div>
    );
  }

  const activeFile = diffs[selectedFileIdx] || diffs[0];
  const totalAdditions = diffs.reduce((acc, f) => acc + f.additions, 0);
  const totalDeletions = diffs.reduce((acc, f) => acc + f.deletions, 0);

  const handleCopyDiff = () => {
    const raw = activeFile.hunks
      .map((h) => h.header + '\n' + h.lines.map((l) => l.content).join('\n'))
      .join('\n\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col font-mono text-xs">
      {/* Header bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span className="font-sans font-semibold text-slate-200 text-xs">
            Diff Git des Modifications
          </span>
          {commitHash && (
            <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
              commit {commitHash}
            </span>
          )}
          {branchName && (
            <span className="text-[11px] text-sky-400 bg-sky-950/60 border border-sky-500/20 px-2 py-0.5 rounded font-mono">
              {branchName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-emerald-400 flex items-center">
              +{totalAdditions}
            </span>
            <span className="text-rose-400 flex items-center">
              -{totalDeletions}
            </span>
          </div>

          <button
            onClick={handleCopyDiff}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copier le patch</span>
          </button>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border-b border-slate-800/80 overflow-x-auto">
        {diffs.map((file, idx) => (
          <button
            key={file.filename}
            onClick={() => setSelectedFileIdx(idx)}
            className={`flex items-center gap-2 px-3 py-1 rounded text-xs transition-colors ${
              selectedFileIdx === idx
                ? 'bg-slate-800 text-slate-100 font-medium'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>{file.filename}</span>
            <span className="text-[10px] text-emerald-400">+{file.additions}</span>
            {file.deletions > 0 && <span className="text-[10px] text-rose-400">-{file.deletions}</span>}
          </button>
        ))}
      </div>

      {/* Code diff container */}
      <div className="p-3 overflow-x-auto max-h-[360px] overflow-y-auto leading-relaxed select-text">
        {activeFile.hunks.map((hunk, hIdx) => (
          <div key={hIdx} className="mb-4">
            <div className="bg-slate-900/60 text-slate-500 px-3 py-1 rounded text-[11px] mb-1 font-mono">
              {hunk.header}
            </div>
            <div className="space-y-[1px]">
              {hunk.lines.map((line, lIdx) => {
                let lineBg = 'hover:bg-slate-900/40 text-slate-400';
                let sign = ' ';
                if (line.type === 'added') {
                  lineBg = 'bg-emerald-950/30 text-emerald-300';
                  sign = '+';
                } else if (line.type === 'removed') {
                  lineBg = 'bg-rose-950/30 text-rose-300';
                  sign = '-';
                }

                return (
                  <div
                    key={lIdx}
                    className={`flex items-start font-mono text-[12px] px-2 py-0.5 rounded ${lineBg}`}
                  >
                    <div className="w-10 text-right pr-3 select-none text-slate-600 text-[11px]">
                      {line.newLineNo || line.oldLineNo || ''}
                    </div>
                    <div className="w-4 select-none font-bold text-center">
                      {sign}
                    </div>
                    <div className="flex-1 whitespace-pre-wrap break-all">
                      {line.content.replace(/^[+-]/, '')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
