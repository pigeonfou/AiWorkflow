export type PipelineStepId = 
  | 'idle'
  | 'analyzing'
  | 'coding'
  | 'git_push'
  | 'ubuntu_deploy'
  | 'web_verify'
  | 'self_healing'
  | 'user_review'
  | 'approved'
  | 'rolled_back'
  | 'failed';

export type LogStream = 'all' | 'agent' | 'git' | 'ssh' | 'e2e';

export type LogType = 'info' | 'success' | 'warning' | 'error' | 'command';

export interface TerminalLogEntry {
  id: string;
  timestamp: string;
  stream: 'agent' | 'git' | 'ssh' | 'e2e';
  type: LogType;
  message: string;
  details?: string;
}

export interface DiffFile {
  filename: string;
  status: 'modified' | 'added' | 'deleted';
  additions: number;
  deletions: number;
  hunks: {
    header: string;
    lines: {
      type: 'added' | 'removed' | 'context';
      content: string;
      oldLineNo?: number;
      newLineNo?: number;
    }[];
  }[];
}

export interface DomAssertionCheck {
  id: string;
  label: string;
  selector: string;
  expected: string;
  passed: boolean;
  actual?: string;
}

export interface WebInspectionResult {
  url: string;
  httpStatus: number;
  responseTimeMs: number;
  passed: boolean;
  consoleErrors: string[];
  assertions: DomAssertionCheck[];
  screenshotLabel?: string;
  testedAt: string;
}

export interface WorkflowRun {
  id: string;
  taskPrompt: string;
  createdAt: string;
  status: 'pending' | 'running' | 'waiting_review' | 'approved' | 'rolled_back' | 'failed';
  currentStep: PipelineStepId;
  iterationCount: number;
  maxIterations: number;
  branchName: string;
  commitHash: string;
  previousCommitHash: string;
  diffs: DiffFile[];
  logs: TerminalLogEntry[];
  aiProvider?: AIProviderId;
  aiModel?: string;
  webInspection?: WebInspectionResult;
  selfHealingAttempt?: {
    cause: string;
    correctionApplied: string;
    iteration: number;
  };
  rollbackDetails?: {
    rolledBackAt: string;
    restoredCommit: string;
    rollbackDurationMs: number;
    reason?: string;
  };
}

export interface ServerConfig {
  host: string;
  port: number;
  user: string;
  authType: 'ssh_key' | 'password';
  privateKeyName: string;
  projectPath: string;
  deployType: 'docker-compose' | 'pm2' | 'systemd' | 'bash_script';
  serviceName: string;
  publicWebUrl: string;
  healthcheckPath: string;
  restartCommand: string;
}

export interface GitHubConfig {
  repoOwner: string;
  repoName: string;
  repoUrl: string;
  baseBranch: string;
  tokenConfigured: boolean;
  webhookConfigured: boolean;
}

export type AIProviderId = 'google' | 'openai' | 'anthropic' | 'mistral';

export interface AIModelOption {
  id: string;
  name: string;
  freeTier: boolean;
  description: string;
}

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  badge: string;
  iconEmoji: string;
  defaultModel: string;
  availableModels: AIModelOption[];
  endpointUrl: string;
  apiKey: string;
  isConfigured: boolean;
  freeTierNote: string;
  docsUrl: string;
}

export type AIProvidersMap = Record<AIProviderId, AIProviderConfig>;

export interface PresetScenario {
  id: string;
  title: string;
  prompt: string;
  description: string;
  category: 'feature' | 'self_healing' | 'bugfix' | 'refactor';
  willFailFirst: boolean;
  failReason?: string;
  fixSummary?: string;
}
