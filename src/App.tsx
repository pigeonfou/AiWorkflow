/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Globe, 
  FileCode, 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Header } from './components/Header';
import { PipelineVisualizer } from './components/PipelineVisualizer';
import { TaskPromptInput } from './components/TaskPromptInput';
import { TerminalLogs } from './components/TerminalLogs';
import { CodeDiffViewer } from './components/CodeDiffViewer';
import { ServerWebInspector } from './components/ServerWebInspector';
import { ApprovalRollbackBanner } from './components/ApprovalRollbackBanner';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ConfigModal } from './components/ConfigModal';
import { ScriptExportModal } from './components/ScriptExportModal';
import { 
  defaultAIProviders,
  defaultGitHubConfig, 
  defaultServerConfig, 
  initialHistory, 
  presetScenarios 
} from './data/mockData';
import { 
  AIProviderId,
  AIProvidersMap,
  GitHubConfig, 
  PipelineStepId, 
  PresetScenario, 
  ServerConfig, 
  TerminalLogEntry, 
  WorkflowRun 
} from './types/workflow';
import { 
  approveAndMerge, 
  executeRollback, 
  runWorkflowExecution 
} from './services/workflowSimulator';

export default function App() {
  const [serverConfig, setServerConfig] = useState<ServerConfig>(defaultServerConfig);
  const [gitHubConfig, setGitHubConfig] = useState<GitHubConfig>(defaultGitHubConfig);
  const [aiProviders, setAiProviders] = useState<AIProvidersMap>(defaultAIProviders);
  const [selectedProviderId, setSelectedProviderId] = useState<AIProviderId>('google');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');

  const [history, setHistory] = useState<WorkflowRun[]>(initialHistory);

  // Initialize with initial history run so the user sees a rich interface immediately
  const [currentRun, setCurrentRun] = useState<WorkflowRun | null>(initialHistory[0]);
  const [isProcessingDecision, setIsProcessingDecision] = useState(false);

  // View tabs: 'web' | 'diff' | 'terminal' | 'all'
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'web' | 'diff' | 'terminal'>('web');

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configInitialTab, setConfigInitialTab] = useState<'ai' | 'server' | 'git'>('ai');
  const [isScriptsOpen, setIsScriptsOpen] = useState(false);

  const isRunning = currentRun?.status === 'running';
  const waitingReview = currentRun?.status === 'waiting_review';

  // Start new autonomous loop
  const handleStartWorkflow = async (
    prompt: string, 
    scenario?: PresetScenario,
    providerId: AIProviderId = selectedProviderId,
    modelName: string = selectedModel
  ) => {
    const previousCommit = currentRun?.commitHash || 'e3b8d21';
    const newRunId = `run-${Date.now().toString().slice(-4)}`;

    const newRun: WorkflowRun = {
      id: newRunId,
      taskPrompt: prompt,
      createdAt: new Date().toLocaleTimeString(),
      status: 'running',
      currentStep: 'analyzing',
      iterationCount: 1,
      maxIterations: 3,
      branchName: `feature/ai-${newRunId}`,
      commitHash: Math.random().toString(16).substring(2, 9),
      previousCommitHash: previousCommit,
      diffs: [],
      logs: [],
      aiProvider: providerId,
      aiModel: modelName,
    };

    setCurrentRun(newRun);

    try {
      const updatedRunData = await runWorkflowExecution({
        taskPrompt: prompt,
        previousCommit,
        willFailFirst: scenario?.willFailFirst ?? false,
        failReason: scenario?.failReason,
        fixSummary: scenario?.fixSummary,
        serverConfig,
        aiProvider: providerId,
        aiModel: modelName,
        aiProvidersConfig: aiProviders,
        onLog: (log: TerminalLogEntry) => {
          setCurrentRun((prev) => (prev ? { ...prev, logs: [...prev.logs, log] } : null));
        },
        onStepChange: (step: PipelineStepId, iteration: number) => {
          setCurrentRun((prev) => (prev ? { ...prev, currentStep: step, iterationCount: iteration } : null));
        },
        onUpdate: (partial) => {
          setCurrentRun((prev) => (prev ? { ...prev, ...partial } : null));
        },
      });

      // Update current run with finished simulation state
      setCurrentRun((prev) => (prev ? { ...prev, ...updatedRunData } : null));
    } catch (err) {
      console.error('Workflow error:', err);
    }
  };

  // User decision: APPROVE
  const handleApprove = async () => {
    if (!currentRun) return;
    setIsProcessingDecision(true);

    try {
      await approveAndMerge({
        run: currentRun,
        serverConfig,
        onLog: (log) => {
          setCurrentRun((prev) => (prev ? { ...prev, logs: [...prev.logs, log] } : null));
        },
        onStepChange: (step) => {
          setCurrentRun((prev) => (prev ? { ...prev, currentStep: step } : null));
        },
        onUpdate: (partial) => {
          setCurrentRun((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...partial };
            setHistory((h) => [updated, ...h.filter((r) => r.id !== updated.id)]);
            return updated;
          });
        },
      });
    } finally {
      setIsProcessingDecision(false);
    }
  };

  // User decision: ROLLBACK
  const handleRollback = async () => {
    if (!currentRun) return;
    setIsProcessingDecision(true);

    try {
      await executeRollback({
        run: currentRun,
        serverConfig,
        onLog: (log) => {
          setCurrentRun((prev) => (prev ? { ...prev, logs: [...prev.logs, log] } : null));
        },
        onStepChange: (step) => {
          setCurrentRun((prev) => (prev ? { ...prev, currentStep: step } : null));
        },
        onUpdate: (partial) => {
          setCurrentRun((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...partial };
            setHistory((h) => [updated, ...h.filter((r) => r.id !== updated.id)]);
            return updated;
          });
        },
      });
    } finally {
      setIsProcessingDecision(false);
    }
  };

  const handleClearLogs = () => {
    setCurrentRun((prev) => (prev ? { ...prev, logs: [] } : null));
  };

  const handleRestoreCheckpoint = (commitHash: string) => {
    if (!currentRun) return;
    handleRollback();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Header */}
      <Header
        currentRun={currentRun}
        serverConfig={serverConfig}
        gitHubConfig={gitHubConfig}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenConfig={() => {
          setConfigInitialTab('server');
          setIsConfigOpen(true);
        }}
        onOpenScripts={() => setIsScriptsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Pipeline Step Chain */}
        <PipelineVisualizer currentRun={currentRun} />

        {/* Human in the loop decision banner (Approve vs Rollback) */}
        <ApprovalRollbackBanner
          currentRun={currentRun}
          onApprove={handleApprove}
          onRollback={handleRollback}
          isProcessingDecision={isProcessingDecision}
        />

        {/* Task Input Prompt & AI Model Selection & Presets */}
        <TaskPromptInput
          isRunning={isRunning}
          waitingReview={waitingReview}
          onStartWorkflow={handleStartWorkflow}
          aiProviders={aiProviders}
          selectedProviderId={selectedProviderId}
          selectedModel={selectedModel}
          onSelectProvider={setSelectedProviderId}
          onSelectModel={setSelectedModel}
          onOpenConfig={() => {
            setConfigInitialTab('ai');
            setIsConfigOpen(true);
          }}
        />

        {/* Workspace Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveWorkspaceTab('web')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeWorkspaceTab === 'web'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Interface Web Ubuntu (Vérification E2E)</span>
              {currentRun?.webInspection && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('diff')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeWorkspaceTab === 'diff'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Diff Git du Code</span>
              {currentRun?.diffs && currentRun.diffs.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                  {currentRun.diffs.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveWorkspaceTab('terminal')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeWorkspaceTab === 'terminal'
                  ? 'bg-sky-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Console SSH & Streaming Logs</span>
              {currentRun?.logs && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                  {currentRun.logs.length}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-2">
            <span>Environnement:</span>
            <span className="font-mono text-emerald-400">Ubuntu 24.04 LTS</span>
            <span>·</span>
            <span className="font-mono text-sky-400">Node 22 / Docker</span>
          </div>
        </div>

        {/* Active Tab Content */}
        <div className="space-y-4">
          {activeWorkspaceTab === 'web' && (
            <div className="space-y-4">
              <ServerWebInspector
                currentRun={currentRun}
                serverUrl={serverConfig.publicWebUrl}
              />
              {/* Secondary terminal preview below web view */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CodeDiffViewer
                  diffs={currentRun?.diffs || []}
                  branchName={currentRun?.branchName}
                  commitHash={currentRun?.commitHash}
                  aiProvider={currentRun?.aiProvider}
                  aiModel={currentRun?.aiModel}
                />
                <TerminalLogs
                  logs={currentRun?.logs || []}
                  onClearLogs={handleClearLogs}
                />
              </div>
            </div>
          )}

          {activeWorkspaceTab === 'diff' && (
            <div className="space-y-4">
              <CodeDiffViewer
                diffs={currentRun?.diffs || []}
                branchName={currentRun?.branchName}
                commitHash={currentRun?.commitHash}
                aiProvider={currentRun?.aiProvider}
                aiModel={currentRun?.aiModel}
              />
              <TerminalLogs
                logs={currentRun?.logs || []}
                onClearLogs={handleClearLogs}
              />
            </div>
          )}

          {activeWorkspaceTab === 'terminal' && (
            <div className="space-y-4">
              <TerminalLogs
                logs={currentRun?.logs || []}
                onClearLogs={handleClearLogs}
              />
              <CodeDiffViewer
                diffs={currentRun?.diffs || []}
                branchName={currentRun?.branchName}
                commitHash={currentRun?.commitHash}
                aiProvider={currentRun?.aiProvider}
                aiModel={currentRun?.aiModel}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>GitOps Autopilot & Self-Healing Agent Pipeline</span>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Ubuntu SSH Engine</span>
            <span>·</span>
            <span>Playwright E2E Headless Verify</span>
            <span>·</span>
            <span>Atomic Git Rollback Engine</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        runs={history}
        onSelectRun={(run) => setCurrentRun(run)}
        onRestoreCheckpoint={handleRestoreCheckpoint}
      />

      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        serverConfig={serverConfig}
        gitHubConfig={gitHubConfig}
        aiProviders={aiProviders}
        initialTab={configInitialTab}
        onSave={(newServer, newGit, newProviders) => {
          setServerConfig(newServer);
          setGitHubConfig(newGit);
          setAiProviders(newProviders);
        }}
      />

      <ScriptExportModal
        isOpen={isScriptsOpen}
        onClose={() => setIsScriptsOpen(false)}
        serverConfig={serverConfig}
        gitHubConfig={gitHubConfig}
      />
    </div>
  );
}
