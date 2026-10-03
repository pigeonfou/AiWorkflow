# 🚀 GitOps Autopilot — Guide de Déploiement Ubuntu & Architecture

Application de workflow autonome pour le cycle continu :
**Demande ➔ Génération de code ➔ Push sur branche GitHub ➔ Déploiement distant SSH Ubuntu ➔ Inspection Web E2E (Headless) ➔ Auto-Correction (Self-Healing) ➔ Décision Humaine ou Rollback Immédiat**.

---

## 📋 Table des Matières

- [1. Prérequis & Initialisation du Serveur Ubuntu](#1-prérequis--initialisation-du-serveur-ubuntu)
- [2. Option A : Déploiement avec Docker & Docker Compose (Recommandé)](#2-option-a--déploiement-avec-docker--docker-compose-recommandé)
- [3. Option B : Déploiement Natif (Node.js 22 + PM2 + Nginx)](#3-option-b--déploiement-natif-nodejs-22--pm2--nginx)
- [4. Configuration du Pare-feu (UFW)](#4-configuration-du-pare-feu-ufw)
- [5. Mise en place de l'Agent de Déploiement & Auto-Rollback](#5-mise-en-place-de-lagent-de-déploiement--auto-rollback)
- [6. Configuration CI/CD GitHub Actions (Optionnel)](#6-configuration-cicd-github-actions-optionnel)
- [7. Commandes Utiles & Maintenance](#7-commandes-utiles--maintenance)

---

## 1. Prérequis & Initialisation du Serveur Ubuntu

Ce guide est compatible avec **Ubuntu 22.04 LTS** et **Ubuntu 24.04 LTS**.

Connectez-vous en SSH à votre serveur :
```bash
ssh root@IP_DE_VOTRE_SERVEUR
# ou
ssh ubuntu@IP_DE_VOTRE_SERVEUR
```

Mettez à jour les paquets système et installez les outils de base :
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget ufw htop
```

---

## 2. Option A : Déploiement avec Docker & Docker Compose (Recommandé)

Cette méthode est la plus simple et la plus robuste : tout est isolé dans des conteneurs, éliminant les problèmes de versions Node.js ou de dépendances globales.

### Étape A.1 : Installer Docker & Docker Compose
```bash
# Script d'installation officiel automatisé
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Démarrer et activer Docker au boot
sudo systemctl enable --now docker
```

### Étape A.2 : Cloner le dépôt
```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/VOTRE_COMPTE/VOTRE_PROJET.git gitops-app
cd gitops-app
```

### Étape A.3 : Lancer l'application
Le projet inclut un `Dockerfile` multi-stage et un `docker-compose.yml` préconfigurés :
```bash
sudo docker compose up -d --build
```

### Étape A.4 : Vérifier le fonctionnement
```bash
# Vérifier l'état du conteneur
sudo docker compose ps

# Vérifier le endpoint de santé
curl -I http://localhost:3000/api/health
# Réponse attendue : HTTP/1.1 200 OK
```

---

## 3. Option B : Déploiement Natif (Node.js 22 + PM2 + Nginx)

Pour un déploiement direct sur l'hôte avec reverse-proxy Nginx et certificat HTTPS SSL Let's Encrypt.

### Étape B.1 : Installer Node.js 22 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v # Doit retourner v22.x.x
npm -v
```

### Étape B.2 : Installer PM2 et TSX
```bash
sudo npm install -g pm2 tsx
```

### Étape B.3 : Cloner et compiler le projet
```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/VOTRE_COMPTE/VOTRE_PROJET.git gitops-app
cd gitops-app

# Installer les dépendances et générer le build
npm ci
npm run build
```

### Étape B.4 : Démarrer l'application avec PM2
```bash
pm2 start "npm start" --name "gitops-autopilot"

# Sauvegarde pour redémarrage automatique en cas de reboot
pm2 save
pm2 startup
```

### Étape B.5 : Configurer Nginx en Reverse Proxy
```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/gitops.conf
```

Collez la configuration suivante :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activez le site et rechargez Nginx :
```bash
sudo ln -s /etc/nginx/sites-available/gitops.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

*(Optionnel)* Générer un certificat SSL HTTPS gratuit avec Let's Encrypt :
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

---

## 4. Configuration du Pare-feu (UFW)

Sécurisez l'accès à votre serveur Ubuntu :
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp # (uniquement si vous testez sans reverse-proxy Nginx)
sudo ufw --force enable
sudo ufw status
```

---

## 5. Mise en place de l'Agent de Déploiement & Auto-Rollback

Ce script bash est le cœur du cycle autonome. Il sauvegarde l'état sain actuel, tire la branche cible, redéploie le service, et lance une série de tests de connectivité web. **Si le test échoue, il exécute un rollback automatique immédiat**.

Créez le script sur le serveur :
```bash
sudo nano /usr/local/bin/deploy-agent.sh
```

Collez le contenu suivant :
```bash
#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"
PROJECT_DIR="/var/www/gitops-app"

cd "$PROJECT_DIR"

# 1. Sauvegarder le hash du dernier commit sain
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "$CURRENT_COMMIT" > /tmp/last_healthy_commit

echo "[GITOPS-AGENT] Déploiement de la branche: $BRANCH"
echo "[GITOPS-AGENT] Commit de secours (Rollback Target): $CURRENT_COMMIT"

# 2. Récupérer la branche depuis GitHub
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# 3. Recharger les services
if command -v docker &> /dev/null && [ -f "docker-compose.yml" ]; then
    docker compose up -d --build
else
    npm ci
    npm run build
    pm2 restart gitops-autopilot || pm2 start "npm start" --name "gitops-autopilot"
fi

# 4. Vérification de santé web (Healthcheck E2E)
ATTEMPTS=0
MAX_ATTEMPTS=8

until curl -s -f -o /dev/null "http://127.0.0.1:3000/api/health"; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
        echo "❌ ÉCHEC CRITIQUE : Le serveur ne répond pas !"
        echo "⏪ DÉCLENCHEMENT DU ROLLBACK AUTOMATIQUE VERS $CURRENT_COMMIT..."
        git checkout main
        git reset --hard "$CURRENT_COMMIT"
        docker compose up -d --build 2>/dev/null || pm2 restart gitops-autopilot
        exit 1
    fi
    echo "Attente de disponibilité de l'application... ($ATTEMPTS/$MAX_ATTEMPTS)"
    sleep 2
done

echo "✅ DÉPLOIEMENT ET VÉRIFICATION WEB E2E VALIDÉS AVEC SUCCÈS !"
exit 0
```

Rendez-le exécutable :
```bash
sudo chmod +x /usr/local/bin/deploy-agent.sh
```

---

## 6. Configuration CI/CD GitHub Actions (Optionnel)

Pour déclencher automatiquement le déploiement sur votre serveur Ubuntu à chaque push sur une branche `feature/ai-*` ou `main`, créez le fichier `.github/workflows/deploy.yml` :

```yaml
name: Deploy & E2E Verification

on:
  push:
    branches:
      - 'feature/ai-*'
      - 'main'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Connexion SSH & Exécution du Déploiement
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.UBUNTU_HOST }}
          username: ${{ secrets.UBUNTU_USER }}
          key: ${{ secrets.UBUNTU_SSH_KEY }}
          port: 22
          script: |
            /usr/local/bin/deploy-agent.sh ${{ github.ref_name }}
```

Dans les secrets de votre dépôt GitHub (`Settings > Secrets and variables > Actions`), renseignez :
- `UBUNTU_HOST` : Adresse IP de votre serveur Ubuntu.
- `UBUNTU_USER` : `ubuntu` ou `root` (ou un utilisateur dédié `deployer`).
- `UBUNTU_SSH_KEY` : Clé privée SSH autorisée dans `~/.ssh/authorized_keys` sur le serveur.

---

## 7. Commandes Utiles & Maintenance

| Action | Commande Docker | Commande PM2 |
|---|---|---|
| **Voir les logs en direct** | `sudo docker compose logs -f` | `pm2 logs gitops-autopilot` |
| **Redémarrer le service** | `sudo docker compose restart` | `pm2 restart gitops-autopilot` |
| **Arrêter le service** | `sudo docker compose down` | `pm2 stop gitops-autopilot` |
| **Tester le healthcheck** | `curl -i http://localhost:3000/api/health` | `curl -i http://localhost:3000/api/health` |
| **Forcer un rollback manuel** | `cd /var/www/gitops-app && git reset --hard $(cat /tmp/last_healthy_commit) && docker compose restart` | `cd /var/www/gitops-app && git reset --hard $(cat /tmp/last_healthy_commit) && pm2 restart gitops-autopilot` |
