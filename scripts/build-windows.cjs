/**
 * Script de compilation & packaging pour Windows 10/11
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('   🚀 COMPILATION & PACKAGING WINDOWS 10 / WINDOWS 11');
console.log('======================================================================\n');

try {
  // 1. Build Vite de production
  console.log('[1/3] Construction du bundle de production frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  // 2. Vérification des dossiers
  const distDir = path.join(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Le dossier dist/ est introuvable après npm run build');
  }

  // 3. Préparation des paquets Windows
  console.log('\n[2/3] Préparation des artefacts d\'installation Windows :');
  console.log('  - Installateur NSIS : electron-builder.json');
  console.log('  - Installateur Inno Setup : windows/GitOps-Autopilot.iss');
  console.log('  - Installateur PowerShell 5.1/7 : windows/install.ps1');
  console.log('  - Installateur Batch rapide : windows/install.bat');

  console.log('\n[3/3] Prêt pour distribution !');
  console.log('Pour générer l\'exécutable .exe final avec Electron sur Windows :');
  console.log('   npx electron-builder --win nsis portable\n');
  console.log('✅ Compilation des assets Windows 10/11 réussie !');
} catch (error) {
  console.error('\n❌ Erreur lors de la compilation :', error.message);
  process.exit(1);
}
