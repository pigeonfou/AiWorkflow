import React, { useState } from 'react';
import { 
  X, 
  FileCode2, 
  Copy, 
  Check, 
  Terminal, 
  ShieldCheck, 
  Download,
  Server,
  GitPullRequest
} from 'lucide-react';
import { ServerConfig, GitHubConfig } from '../types/workflow';

interface ScriptExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverConfig: ServerConfig;
  gitHubConfig: GitHubConfig;
}

export const ScriptExportModal: React.FC<ScriptExportModalProps> = ({
  isOpen,
  onClose,
  serverConfig,
  gitHubConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'bash' | 'actions' | 'rollback'>('bash');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const bashScript = `#!/usr/bin/env bash
# ==============================================================================
# Script de déploiement et agent local pour Ubuntu Server
# Serveur: ${serverConfig.host}
# Projet: ${serverConfig.projectPath}
# ==============================================================================

set -euo pipefail

BRANCH="\${1:-main}"
PROJECT_DIR="${serverConfig.projectPath}"
LOG_FILE="/var/log/gitops-autopilot.log"
BACKUP_COMMIT_FILE="/tmp/last_healthy_commit"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] [GITOPS-AGENT] \$*" | tee -a "\$LOG_FILE"
}

log "Démarrage du déploiement pour la branche: \$BRANCH"

cd "\$PROJECT_DIR"

# 1. Sauvegarder le hash actuel pour rollback immédiat en cas d'échec
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "\$CURRENT_COMMIT" > "\$BACKUP_COMMIT_FILE"
log "Dernier commit sain enregistré: \$CURRENT_COMMIT"

# 2. Récupération des modifications depuis GitHub
git fetch origin
git checkout "\$BRANCH"
git pull origin "\$BRANCH"

# 3. Installation et Rechargement
log "Exécution de la commande de rechargement: ${serverConfig.restartCommand}"
${serverConfig.restartCommand}

# 4. Vérification locale de l'interface web (Healthcheck E2E)
log "Vérification de l'endpoint web: ${serverConfig.publicWebUrl}"
ATTEMPTS=0
MAX_ATTEMPTS=10

until curl -s -f -o /dev/null "${serverConfig.publicWebUrl}${serverConfig.healthcheckPath}"; do
  ATTEMPTS=\$((ATTEMPTS + 1))
  if [ \$ATTEMPTS -ge \$MAX_ATTEMPTS ]; then
    log "❌ ERREUR: Le serveur ne répond pas après \$MAX_ATTEMPTS tentatives !"
    log "Déclenchement du rollback automatique..."
    git checkout main
    git reset --hard "\$CURRENT_COMMIT"
    ${serverConfig.restartCommand}
    exit 1
  fi
  log "Attente de disponibilité du service... (\$ATTEMPTS/\$MAX_ATTEMPTS)"
  sleep 2
done

log "✅ Déploiement et vérification E2E réussis avec succès !"
exit 0
`;

  const githubActionYaml = `name: AI Agent E2E Deploy & Verify

on:
  push:
    branches:
      - 'feature/ai-*'
      - 'main'

jobs:
  deploy-and-verify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Déploiement distant SSH sur Ubuntu
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: \${{ secrets.UBUNTU_HOST }}
          username: \${{ secrets.UBUNTU_USER }}
          key: \${{ secrets.UBUNTU_SSH_KEY }}
          port: ${serverConfig.port}
          script: |
            cd ${serverConfig.projectPath}
            git fetch origin
            git checkout \${{ github.ref_name }}
            git pull origin \${{ github.ref_name }}
            ${serverConfig.restartCommand}

      - name: Vérification réelle de l'interface Web (Headless Playwright)
        run: |
          npx playwright install --with-deps chromium
          node -e "
            const { chromium } = require('playwright');
            (async () => {
              const browser = await chromium.launch();
              const page = await browser.newPage();
              const response = await page.goto('${serverConfig.publicWebUrl}', { waitUntil: 'networkidle' });
              if (!response || response.status() !== 200) {
                console.error('HTTP Status not 200: ' + (response ? response.status() : 'No response'));
                process.exit(1);
              }
              console.log('✅ Interface Web Ubuntu opérationnelle (200 OK)');
              await browser.close();
            })();
          "
`;

  const rollbackScript = `#!/usr/bin/env bash
# ==============================================================================
# Script de Rollback Immédiat vers le dernier commit sain
# ==============================================================================

set -euo pipefail
PROJECT_DIR="${serverConfig.projectPath}"
BACKUP_COMMIT_FILE="/tmp/last_healthy_commit"

if [ ! -f "\$BACKUP_COMMIT_FILE" ]; then
  echo "Erreur: Fichier de sauvegarde \$BACKUP_COMMIT_FILE introuvable."
  exit 1
fi

TARGET_COMMIT=$(cat "\$BACKUP_COMMIT_FILE")
echo "Restoration du serveur vers le commit: \$TARGET_COMMIT"

cd "\$PROJECT_DIR"
git checkout main
git reset --hard "\$TARGET_COMMIT"

${serverConfig.restartCommand}

echo "✅ Rollback exécuté. Serveur Ubuntu restauré au commit \$TARGET_COMMIT."
`;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'actions':
        return githubActionYaml;
      case 'rollback':
        return rollbackScript;
      default:
        return bashScript;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">
              Scripts de Déploiement Prêts pour la Production
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('bash')}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'bash'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Script Serveur Ubuntu (deploy-agent.sh)
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'actions'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Workflow GitHub Actions (.github/workflows/deploy.yml)
          </button>
          <button
            onClick={() => setActiveTab('rollback')}
            className={`pb-2.5 px-2 border-b-2 font-medium transition-colors ${
              activeTab === 'rollback'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Script de Rollback d'Urgence (rollback.sh)
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
            <span className="text-slate-400 font-sans">
              {activeTab === 'bash'
                ? 'À placer dans /usr/local/bin/deploy-agent.sh sur votre Ubuntu Server'
                : activeTab === 'actions'
                ? 'À déposer dans votre dépôt GitHub'
                : 'Script de restauration atomique en 1 seconde'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-sans text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié dans le presse-papier !' : 'Copier le script'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 text-slate-200 overflow-x-auto leading-relaxed whitespace-pre font-mono">
            {getActiveCode()}
          </pre>
        </div>
      </div>
    </div>
  );
};
