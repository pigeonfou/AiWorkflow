import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Copy, 
  Trash2, 
  Check, 
  Search, 
  Filter, 
  ArrowDownCircle,
  ExternalLink
} from 'lucide-react';
import { LogStream, TerminalLogEntry } from '../types/workflow';

interface TerminalLogsProps {
  logs: TerminalLogEntry[];
  onClearLogs: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClearLogs }) => {
  const [activeStream, setActiveStream] = useState<LogStream>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (activeStream !== 'all' && log.stream !== activeStream) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.stream.toUpperCase()}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[420px] font-mono text-xs">
      {/* Top Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="font-semibold text-slate-300 flex items-center gap-1.5 font-sans text-xs">
            <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
            Console d'Exécution & Logs Distants
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            ({logs.length} entries)
          </span>
        </div>

        {/* Stream Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          {(['all', 'agent', 'git', 'ssh', 'e2e'] as LogStream[]).map((st) => (
            <button
              key={st}
              onClick={() => setActiveStream(st)}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeStream === st
                  ? 'bg-sky-500/20 text-sky-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all'
                ? 'Tous'
                : st === 'agent'
                ? 'Agent IA'
                : st === 'git'
                ? 'Git/GitHub'
                : st === 'ssh'
                ? 'SSH Ubuntu'
                : 'Test E2E Web'}
            </button>
          ))}
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? 'Désactiver le défilement auto' : 'Activer le défilement auto'}
            className={`p-1.5 rounded transition-colors ${
              autoScroll ? 'text-sky-400 bg-sky-950/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopyLogs}
            title="Copier les logs"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onClearLogs}
            title="Nettoyer le terminal"
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-1.5 select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 font-sans text-xs">
            Aucun log à afficher pour ce filtre. Lancez une demande pour voir le streaming des commandes.
          </div>
        ) : (
          filteredLogs.map((log) => {
            let streamBadge = 'bg-slate-800 text-slate-300';
            if (log.stream === 'agent') streamBadge = 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30';
            if (log.stream === 'git') streamBadge = 'bg-amber-950/80 text-amber-300 border border-amber-500/30';
            if (log.stream === 'ssh') streamBadge = 'bg-sky-950/80 text-sky-300 border border-sky-500/30';
            if (log.stream === 'e2e') streamBadge = 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30';

            let textColor = 'text-slate-300';
            if (log.type === 'command') textColor = 'text-sky-300 font-medium';
            if (log.type === 'success') textColor = 'text-emerald-300 font-medium';
            if (log.type === 'warning') textColor = 'text-amber-300 font-medium';
            if (log.type === 'error') textColor = 'text-rose-300 font-medium';

            return (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed group">
                <span className="text-slate-600 text-[11px] shrink-0 select-none">
                  {log.timestamp}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase shrink-0 font-medium ${streamBadge}`}>
                  {log.stream}
                </span>
                <span className={`flex-1 break-all ${textColor}`}>
                  {log.type === 'command' && <span className="text-slate-500 mr-1.5 select-none">$</span>}
                  {log.message}
                  {log.details && (
                    <div className="mt-0.5 text-slate-500 text-[11px] whitespace-pre-wrap pl-3 border-l border-slate-800">
                      {log.details}
                    </div>
                  )}
                </span>
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};
