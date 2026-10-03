import { GitHubConfig, PresetScenario, ServerConfig, WorkflowRun } from '../types/workflow';

export const defaultGitHubConfig: GitHubConfig = {
  repoOwner: 'acme-corp',
  repoName: 'nexus-web-platform',
  repoUrl: 'https://github.com/acme-corp/nexus-web-platform',
  baseBranch: 'main',
  tokenConfigured: true,
  webhookConfigured: true,
};

export const defaultServerConfig: ServerConfig = {
  host: 'ubuntu-prod-node01.cloud.lan',
  port: 22,
  user: 'deployer',
  authType: 'ssh_key',
  privateKeyName: 'id_ed25519_devops_ci',
  projectPath: '/var/www/nexus-web-platform',
  deployType: 'docker-compose',
  serviceName: 'nexus_web_app',
  publicWebUrl: 'https://nexus.cloud.lan',
  healthcheckPath: '/api/health',
  restartCommand: 'docker compose up -d --build --force-recreate',
};

export const presetScenarios: PresetScenario[] = [
  {
    id: 'dark-mode',
    title: '🌙 Mode Sombre & Toggle Interactif',
    prompt: "Ajouter un bouton de bascule 'Mode Sombre' dans la barre de navigation avec persistance dans localStorage et transitions fluides.",
    description: "Ajout propre du thème dark/light avec support système et persistance client.",
    category: 'feature',
    willFailFirst: false,
  },
  {
    id: 'auth-self-healing',
    title: '🛡️ Sécurité JWT & Auto-Correction de Bug (Self-Healing)',
    prompt: "Sécuriser l'endpoint /api/profile en vérifiant le Bearer token JWT et intercepter les requêtes non authentifiées avec un code 401.",
    description: "Simule une première tentative avec une erreur de type TypeScript / 500 sur le serveur Ubuntu, l'agent inspecte les logs, corrige automatiquement l'import et réussit à la 2e itération !",
    category: 'self_healing',
    willFailFirst: true,
    failReason: 'Erreur 500 & Blank Screen détectés lors de la vérification web headless : ReferenceError: verifyJwtToken is not defined in authMiddleware.ts (port 3000 down)',
    fixSummary: 'Import manquant de @auth/jwt-verify ajouté et fallback token anonymous corrigé. Re-build réussi.',
  },
  {
    id: 'export-csv',
    title: '📊 Exportation CSV des Métriques Serveur',
    prompt: "Ajouter un bouton d'export CSV dans le tableau des métriques avec téléchargement instantané du fichier généré côté client.",
    description: "Génération client-side de fichier .csv avec échappement des virgules et horodatage.",
    category: 'feature',
    willFailFirst: false,
  },
  {
    id: 'rollback-demo',
    title: '⚠️ Mise à jour Risquée (Scénario de Rollback)',
    prompt: "Refactoriser le layout principal avec une sidebar collapsible et réorganiser le dashboard de monitoring.",
    description: "Permet de tester la décision de l'utilisateur : refuser la modification pour déclencher le rollback atomique jusqu'au commit précédent.",
    category: 'refactor',
    willFailFirst: false,
  },
];

export const initialHistory: WorkflowRun[] = [
  {
    id: 'run-9021',
    taskPrompt: "Intégrer le widget d'uptime et le monitoring de charge CPU en temps réel",
    createdAt: '2026-10-03 10:14:22',
    status: 'approved',
    currentStep: 'approved',
    iterationCount: 1,
    maxIterations: 3,
    branchName: 'feature/agent-cpu-monitoring',
    commitHash: '8f4a1c9',
    previousCommitHash: 'e3b8d21',
    diffs: [
      {
        filename: 'src/components/CpuMonitor.tsx',
        status: 'added',
        additions: 38,
        deletions: 0,
        hunks: [
          {
            header: '@@ -0,0 +1,38 @@',
            lines: [
              { type: 'added', content: '+import React, { useEffect, useState } from "react";', newLineNo: 1 },
              { type: 'added', content: '+export const CpuMonitor = () => {', newLineNo: 2 },
              { type: 'added', content: '+  const [load, setLoad] = useState(24);', newLineNo: 3 },
              { type: 'added', content: '+  return <div className="p-4 bg-slate-900 border">CPU: {load}%</div>;', newLineNo: 4 },
              { type: 'added', content: '+};', newLineNo: 5 },
            ],
          },
        ],
      },
    ],
    logs: [
      { id: '1', timestamp: '10:14:23', stream: 'agent', type: 'info', message: 'Task received: monitoring CPU' },
      { id: '2', timestamp: '10:14:28', stream: 'git', type: 'command', message: 'git checkout -b feature/agent-cpu-monitoring' },
      { id: '3', timestamp: '10:14:35', stream: 'git', type: 'success', message: 'git push origin feature/agent-cpu-monitoring (commit: 8f4a1c9)' },
      { id: '4', timestamp: '10:14:48', stream: 'ssh', type: 'command', message: 'ssh deployer@ubuntu-prod-node01 "cd /var/www/nexus-web-platform && git pull && docker compose up -d"' },
      { id: '5', timestamp: '10:15:10', stream: 'ssh', type: 'success', message: 'Container nexus_web_app (id: 4a2f8) healthy and running on port 3000' },
      { id: '6', timestamp: '10:15:15', stream: 'e2e', type: 'info', message: 'Connecting to https://nexus.cloud.lan via headless Chromium...' },
      { id: '7', timestamp: '10:15:18', stream: 'e2e', type: 'success', message: 'Web check 200 OK (84ms). DOM assertions passed: [data-cpu-widget] rendered.' },
      { id: '8', timestamp: '10:16:02', stream: 'agent', type: 'success', message: 'User approved change. Merged to main, tag v2.4.1.' },
    ],
    webInspection: {
      url: 'https://nexus.cloud.lan',
      httpStatus: 200,
      responseTimeMs: 84,
      passed: true,
      consoleErrors: [],
      assertions: [
        { id: 'c1', label: 'HTTP Status 200', selector: 'HTTP', expected: '200 OK', passed: true },
        { id: 'c2', label: 'Console 0 errors', selector: 'console', expected: '0 errors', passed: true },
        { id: 'c3', label: 'Widget CPU visible', selector: '[data-cpu-widget]', expected: 'present in DOM', passed: true },
      ],
      testedAt: '2026-10-03 10:15:18',
    },
  },
];
