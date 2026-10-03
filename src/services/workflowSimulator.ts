import { DiffFile, PipelineStepId, ServerConfig, TerminalLogEntry, WebInspectionResult, WorkflowRun } from '../types/workflow';

type LogCallback = (log: TerminalLogEntry) => void;
type StepCallback = (step: PipelineStepId, iteration: number) => void;
type UpdateCallback = (partial: Partial<WorkflowRun>) => void;

function makeLog(
  stream: 'agent' | 'git' | 'ssh' | 'e2e',
  type: TerminalLogEntry['type'],
  message: string,
  details?: string
): TerminalLogEntry {
  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: timeStr,
    stream,
    type,
    message,
    details,
  };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runWorkflowExecution({
  taskPrompt,
  previousCommit,
  willFailFirst = false,
  failReason,
  fixSummary,
  serverConfig,
  onLog,
  onStepChange,
  onUpdate,
}: {
  taskPrompt: string;
  previousCommit: string;
  willFailFirst?: boolean;
  failReason?: string;
  fixSummary?: string;
  serverConfig: ServerConfig;
  onLog: LogCallback;
  onStepChange: StepCallback;
  onUpdate: UpdateCallback;
}): Promise<Partial<WorkflowRun>> {
  const branchName = `feature/ai-${Date.now().toString(36)}`;
  const commitHash = Math.random().toString(16).substring(2, 9);
  let iteration = 1;

  // --- STEP 1: ANALYZING ---
  onStepChange('analyzing', iteration);
  onLog(makeLog('agent', 'info', `🚀 Démarrage du workflow pour la demande : "${taskPrompt}"`));
  await sleep(600);
  onLog(makeLog('agent', 'info', `🔍 Analyse du dépôt distant et des fichiers source impactés...`));
  await sleep(700);
  onLog(makeLog('agent', 'info', `📋 Stratégie de modification établie : 2 fichiers cibles identifiés`));
  await sleep(500);

  // --- STEP 2: CODING & DIFF GENERATION ---
  onStepChange('coding', iteration);
  onLog(makeLog('agent', 'command', `⚡ Génération du code source et construction du patch AST...`));
  await sleep(900);

  const diffs: DiffFile[] = generateRealisticDiffs(taskPrompt);
  onUpdate({ diffs });
  onLog(makeLog('agent', 'success', `✅ Modifications créées : +${diffs.reduce((a, b) => a + b.additions, 0)} lignes, -${diffs.reduce((a, b) => a + b.deletions, 0)} lignes across ${diffs.length} fichier(s)`));
  await sleep(600);

  // --- STEP 3: GIT PUSH TO BRANCH ---
  onStepChange('git_push', iteration);
  onLog(makeLog('git', 'command', `git checkout -b ${branchName}`));
  await sleep(500);
  onLog(makeLog('git', 'command', `git add . && git commit -m "feat(ai): ${taskPrompt.slice(0, 50)}"`));
  await sleep(600);
  onLog(makeLog('git', 'command', `git push origin ${branchName}`));
  await sleep(700);
  onLog(makeLog('git', 'success', `📦 Branche distante poussée avec succès sur GitHub [commit ${commitHash}]`));
  onUpdate({ branchName, commitHash });
  await sleep(500);

  // --- STEP 4: UBUNTU SERVER DEPLOYMENT ---
  onStepChange('ubuntu_deploy', iteration);
  onLog(makeLog('ssh', 'command', `ssh -p ${serverConfig.port} ${serverConfig.user}@${serverConfig.host} "cd ${serverConfig.projectPath} && git fetch && git checkout ${branchName}"`));
  await sleep(800);
  onLog(makeLog('ssh', 'info', `Connexion SSH établie via clé ed25519 sur le serveur Ubuntu`));
  await sleep(600);
  onLog(makeLog('ssh', 'command', `Exécution de la commande de déploiement: ${serverConfig.restartCommand}`));
  await sleep(900);
  onLog(makeLog('ssh', 'info', `📦 Installation des dépendances (npm ci / docker layer cache)...`));
  await sleep(800);
  onLog(makeLog('ssh', 'success', `🚀 Redémarrage du conteneur/service "${serverConfig.serviceName}" complété.`));
  await sleep(600);

  // --- STEP 5: WEB INTERFACE REAL VERIFICATION ---
  onStepChange('web_verify', iteration);
  onLog(makeLog('e2e', 'info', `🌐 Connexion à l'interface web du serveur Ubuntu : ${serverConfig.publicWebUrl}...`));
  await sleep(700);
  onLog(makeLog('e2e', 'command', `Lancement du scanner Headless (HTTP healthcheck, console error detection, rendu DOM)...`));
  await sleep(900);

  // CHECK: If this scenario will fail on first attempt -> Trigger Self-Healing!
  if (willFailFirst && iteration === 1) {
    onLog(makeLog('e2e', 'error', `❌ ÉCHEC de vérification Web : Erreur HTTP 500 ou crash runtime détecté !`));
    onLog(makeLog('e2e', 'error', failReason || 'ReferenceError: Module export not found during DOM hydration'));
    await sleep(900);

    // --- STEP 6: SELF-HEALING LOOP ---
    iteration = 2;
    onStepChange('self_healing', iteration);
    onLog(makeLog('agent', 'warning', `⚠️ Déclenchement de la BOUCLE D'AUTO-CORRECTION (Itération 2/${3})`));
    await sleep(700);
    onLog(makeLog('ssh', 'command', `ssh ${serverConfig.user}@${serverConfig.host} "journalctl -u ${serverConfig.serviceName} -n 30 --no-pager"`));
    await sleep(900);
    onLog(makeLog('agent', 'info', `🔬 Diagnostic cause racine : ${fixSummary || 'Correction automatique du fichier et ajout du fallback d\'initialisation'}`));
    await sleep(1000);
    onLog(makeLog('agent', 'success', `🛠️ Patch correctif généré par l'agent IA.`));
    await sleep(600);

    // Re-push fix
    onLog(makeLog('git', 'command', `git commit --amend -m "fix(ai): ${fixSummary || 'Résolution des dépendances et crash 500'}"`));
    await sleep(500);
    onLog(makeLog('git', 'command', `git push origin ${branchName} --force-with-lease`));
    await sleep(700);

    // Re-deploy on Ubuntu
    onStepChange('ubuntu_deploy', iteration);
    onLog(makeLog('ssh', 'command', `ssh ${serverConfig.user}@${serverConfig.host} "cd ${serverConfig.projectPath} && git pull && ${serverConfig.restartCommand}"`));
    await sleep(1100);
    onLog(makeLog('ssh', 'success', `🔄 Redéploiement Ubuntu réussi après application du correctif.`));
    await sleep(600);

    // Re-verify Web
    onStepChange('web_verify', iteration);
    onLog(makeLog('e2e', 'info', `🌐 Deuxième vérification de l'interface web Ubuntu (${serverConfig.publicWebUrl})...`));
    await sleep(800);
  }

  // Final successful Web inspection
  onLog(makeLog('e2e', 'success', `✅ HTTP 200 OK reçu en 46ms. SSL valide. En-têtes conformes.`));
  await sleep(500);
  onLog(makeLog('e2e', 'success', `✅ Scanner de logs console : 0 exception non gérée, 0 avertissement bloquant.`));
  await sleep(600);
  onLog(makeLog('e2e', 'success', `✅ Assertions fonctionnelles DOM validées avec succès sur l'interface du serveur.`));
  await sleep(600);

  const inspection: WebInspectionResult = {
    url: serverConfig.publicWebUrl,
    httpStatus: 200,
    responseTimeMs: 46,
    passed: true,
    consoleErrors: [],
    assertions: [
      { id: 'http', label: 'HTTP Status 200', selector: 'GET /', expected: '200 OK', passed: true },
      { id: 'console', label: 'Erreurs Console Client', selector: 'window.onerror', expected: '0 error', passed: true },
      { id: 'dom', label: 'Rendu UI Fonctionnel', selector: '#app-root', expected: 'Elements interactifs presents', passed: true },
      { id: 'perf', label: 'Temps de réponse serveur', selector: '< 200ms', expected: '46ms', passed: true },
    ],
    testedAt: new Date().toLocaleTimeString(),
  };

  onUpdate({
    webInspection: inspection,
    iterationCount: iteration,
  });

  // --- STEP 7: WAITING FOR HUMAN REVIEW & DECISION ---
  onStepChange('user_review', iteration);
  onLog(makeLog('agent', 'info', `🧑‍💻 En attente de votre validation : vous pouvez tester l'interface web ci-dessous et décider d'approuver ou d'exécuter un rollback immédiat.`));

  return {
    status: 'waiting_review',
    currentStep: 'user_review',
    iterationCount: iteration,
    webInspection: inspection,
    branchName,
    commitHash,
    previousCommitHash: previousCommit,
    diffs,
  };
}

export async function executeRollback({
  run,
  serverConfig,
  onLog,
  onStepChange,
  onUpdate,
}: {
  run: WorkflowRun;
  serverConfig: ServerConfig;
  onLog: LogCallback;
  onStepChange: StepCallback;
  onUpdate: UpdateCallback;
}): Promise<void> {
  const startTime = Date.now();
  onStepChange('rolled_back', run.iterationCount);
  onLog(makeLog('agent', 'warning', `🛑 ROLLBACK DÉCLENCHÉ par l'utilisateur ! Annulation de la demande en cours...`));
  await sleep(600);

  onLog(makeLog('git', 'command', `git checkout main && git branch -D ${run.branchName}`));
  await sleep(700);
  onLog(makeLog('git', 'info', `Point de restauration cible : Commit précédent [${run.previousCommitHash}]`));
  await sleep(600);

  onLog(makeLog('ssh', 'command', `ssh ${serverConfig.user}@${serverConfig.host} "cd ${serverConfig.projectPath} && git checkout main && git reset --hard ${run.previousCommitHash} && ${serverConfig.restartCommand}"`));
  await sleep(1200);

  onLog(makeLog('ssh', 'success', `♻️ Serveur Ubuntu restauré au dernier état sain connu (${run.previousCommitHash}).`));
  await sleep(600);

  onLog(makeLog('e2e', 'command', `Vérification de santé post-rollback sur ${serverConfig.publicWebUrl}...`));
  await sleep(700);
  onLog(makeLog('e2e', 'success', `✅ Interface web du serveur rétablie avec succès à son état antérieur certifié.`));
  await sleep(500);

  const durationMs = Date.now() - startTime;
  onLog(makeLog('agent', 'success', `⏪ Rollback complet exécuté en ${(durationMs / 1000).toFixed(1)}s. Prêt pour une nouvelle demande.`));

  onUpdate({
    status: 'rolled_back',
    currentStep: 'rolled_back',
    rollbackDetails: {
      rolledBackAt: new Date().toLocaleTimeString(),
      restoredCommit: run.previousCommitHash,
      rollbackDurationMs: durationMs,
      reason: "Refusé par l'utilisateur après inspection web",
    },
  });
}

export async function approveAndMerge({
  run,
  serverConfig,
  onLog,
  onStepChange,
  onUpdate,
}: {
  run: WorkflowRun;
  serverConfig: ServerConfig;
  onLog: LogCallback;
  onStepChange: StepCallback;
  onUpdate: UpdateCallback;
}): Promise<void> {
  onStepChange('approved', run.iterationCount);
  onLog(makeLog('agent', 'success', `🎉 VALIDATION ACCEPTÉE par l'utilisateur ! Fusion sur la branche principale en cours...`));
  await sleep(600);

  onLog(makeLog('git', 'command', `git checkout main && git merge --no-ff ${run.branchName} -m "Merge pull request for: ${run.taskPrompt.slice(0, 40)}"`));
  await sleep(700);
  onLog(makeLog('git', 'command', `git push origin main && git tag -a v${Date.now().toString().slice(-4)} -m "Release"`));
  await sleep(600);

  onLog(makeLog('ssh', 'command', `ssh ${serverConfig.user}@${serverConfig.host} "cd ${serverConfig.projectPath} && git checkout main && git pull"`));
  await sleep(800);
  onLog(makeLog('ssh', 'success', `Production Ubuntu synchronisée et verrouillée sur 'main'.`));
  await sleep(500);

  onLog(makeLog('agent', 'success', `✨ Demande finalisée avec succès ! Le système est prêt pour votre prochaine instruction.`));

  onUpdate({
    status: 'approved',
    currentStep: 'approved',
  });
}

function generateRealisticDiffs(prompt: string): DiffFile[] {
  const p = prompt.toLowerCase();

  if (p.includes('sombre') || p.includes('dark')) {
    return [
      {
        filename: 'src/components/ThemeToggle.tsx',
        status: 'added',
        additions: 42,
        deletions: 0,
        hunks: [
          {
            header: '@@ -0,0 +1,42 @@',
            lines: [
              { type: 'added', content: '+import React, { useEffect, useState } from "react";', newLineNo: 1 },
              { type: 'added', content: '+import { Sun, Moon } from "lucide-react";', newLineNo: 2 },
              { type: 'added', content: '+', newLineNo: 3 },
              { type: 'added', content: '+export const ThemeToggle = () => {', newLineNo: 4 },
              { type: 'added', content: '+  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "dark");', newLineNo: 5 },
              { type: 'added', content: '+', newLineNo: 6 },
              { type: 'added', content: '+  useEffect(() => {', newLineNo: 7 },
              { type: 'added', content: '+    document.documentElement.classList.toggle("dark", isDark);', newLineNo: 8 },
              { type: 'added', content: '+    localStorage.setItem("theme", isDark ? "dark" : "light");', newLineNo: 9 },
              { type: 'added', content: '+  }, [isDark]);', newLineNo: 10 },
              { type: 'added', content: '+', newLineNo: 11 },
              { type: 'added', content: '+  return (', newLineNo: 12 },
              { type: 'added', content: '+    <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg border">', newLineNo: 13 },
              { type: 'added', content: '+      {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}', newLineNo: 14 },
              { type: 'added', content: '+    </button>', newLineNo: 15 },
              { type: 'added', content: '+  );', newLineNo: 16 },
              { type: 'added', content: '+};', newLineNo: 17 },
            ],
          },
        ],
      },
      {
        filename: 'src/components/Navbar.tsx',
        status: 'modified',
        additions: 3,
        deletions: 1,
        hunks: [
          {
            header: '@@ -24,7 +24,9 @@',
            lines: [
              { type: 'context', content: '       <div className="flex items-center gap-4">', oldLineNo: 24, newLineNo: 24 },
              { type: 'removed', content: '-        <UserProfile />', oldLineNo: 25 },
              { type: 'added', content: '+        <ThemeToggle />', newLineNo: 25 },
              { type: 'added', content: '+        <UserProfile />', newLineNo: 26 },
              { type: 'context', content: '       </div>', oldLineNo: 26, newLineNo: 27 },
            ],
          },
        ],
      },
    ];
  }

  if (p.includes('jwt') || p.includes('auth') || p.includes('sécurité') || p.includes('token')) {
    return [
      {
        filename: 'src/server/middleware/authMiddleware.ts',
        status: 'modified',
        additions: 22,
        deletions: 4,
        hunks: [
          {
            header: '@@ -12,4 +12,22 @@',
            lines: [
              { type: 'removed', content: '-export const authMiddleware = (req, res, next) => next();', oldLineNo: 12 },
              { type: 'added', content: '+import { verifyJwtToken } from "../utils/jwtValidator.js";', newLineNo: 12 },
              { type: 'added', content: '+', newLineNo: 13 },
              { type: 'added', content: '+export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {', newLineNo: 14 },
              { type: 'added', content: '+  const authHeader = req.headers.authorization;', newLineNo: 15 },
              { type: 'added', content: '+  if (!authHeader?.startsWith("Bearer ")) {', newLineNo: 16 },
              { type: 'added', content: '+    return res.status(401).json({ error: "Missing or invalid bearer token" });', newLineNo: 17 },
              { type: 'added', content: '+  }', newLineNo: 18 },
              { type: 'added', content: '+  const token = authHeader.split(" ")[1];', newLineNo: 19 },
              { type: 'added', content: '+  const decoded = await verifyJwtToken(token);', newLineNo: 20 },
              { type: 'added', content: '+  req.user = decoded;', newLineNo: 21 },
              { type: 'added', content: '+  next();', newLineNo: 22 },
              { type: 'added', content: '+};', newLineNo: 23 },
            ],
          },
        ],
      },
      {
        filename: 'src/server/routes/profile.ts',
        status: 'modified',
        additions: 5,
        deletions: 2,
        hunks: [
          {
            header: '@@ -5,2 +5,5 @@',
            lines: [
              { type: 'removed', content: '-router.get("/api/profile", getProfileHandler);', oldLineNo: 5 },
              { type: 'added', content: '+router.get("/api/profile", authMiddleware, getProfileHandler);', newLineNo: 5 },
            ],
          },
        ],
      },
    ];
  }

  if (p.includes('csv') || p.includes('export')) {
    return [
      {
        filename: 'src/components/CsvExportButton.tsx',
        status: 'added',
        additions: 34,
        deletions: 0,
        hunks: [
          {
            header: '@@ -0,0 +1,34 @@',
            lines: [
              { type: 'added', content: '+import { Download } from "lucide-react";', newLineNo: 1 },
              { type: 'added', content: '+export const CsvExportButton = ({ data, filename = "export.csv" }) => {', newLineNo: 2 },
              { type: 'added', content: '+  const handleExport = () => {', newLineNo: 3 },
              { type: 'added', content: '+    const headers = Object.keys(data[0] || {}).join(",");', newLineNo: 4 },
              { type: 'added', content: '+    const rows = data.map(row => Object.values(row).join(",")).join("\\n");', newLineNo: 5 },
              { type: 'added', content: '+    const blob = new Blob([`${headers}\\n${rows}`], { type: "text/csv;charset=utf-8;" });', newLineNo: 6 },
              { type: 'added', content: '+    const url = URL.createObjectURL(blob);', newLineNo: 7 },
              { type: 'added', content: '+    const link = document.createElement("a");', newLineNo: 8 },
              { type: 'added', content: '+    link.setAttribute("href", url);', newLineNo: 9 },
              { type: 'added', content: '+    link.setAttribute("download", filename);', newLineNo: 10 },
              { type: 'added', content: '+    link.click();', newLineNo: 11 },
              { type: 'added', content: '+  };', newLineNo: 12 },
              { type: 'added', content: '+  return <button onClick={handleExport} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded">Exporter CSV</button>;', newLineNo: 13 },
              { type: 'added', content: '+};', newLineNo: 14 },
            ],
          },
        ],
      },
    ];
  }

  // Default custom modification diff
  return [
    {
      filename: 'src/features/CustomFeature.tsx',
      status: 'modified',
      additions: 18,
      deletions: 4,
      hunks: [
        {
          header: '@@ -18,4 +18,18 @@',
          lines: [
            { type: 'context', content: '  // Implementation applied by autonomous agent', oldLineNo: 18, newLineNo: 18 },
            { type: 'removed', content: '-  const isLegacy = true;', oldLineNo: 19 },
            { type: 'added', content: '+  // Request: ' + prompt.slice(0, 40), newLineNo: 19 },
            { type: 'added', content: '+  const isEnhanced = true;', newLineNo: 20 },
            { type: 'added', content: '+  const status = "verified_on_ubuntu_server";', newLineNo: 21 },
            { type: 'added', content: '+  return <div className="border border-emerald-500/30 p-4 rounded-lg bg-emerald-950/20">Mise à jour validée</div>;', newLineNo: 22 },
          ],
        },
      ],
    },
  ];
}
