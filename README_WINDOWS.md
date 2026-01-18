# Audioman — Windows 11 (Conversion)

## ✅ Prérequis
- Windows 11
- Node.js 20 LTS (recommandé)
- Navigateur Edge ou Chrome

## ⚡ Démarrage rapide (PowerShell)
Depuis le dossier du projet :

1) Installation + création de la clé API
- Ouvrir PowerShell en mode utilisateur.
- Exécuter : scripts/windows/setup.ps1

2) Lancer l’app
- Exécuter : scripts/windows/run.ps1
- Ouvrir : http://localhost:5173

## 🔐 Clé API
Le fichier .env.local est requis avec :
VITE_GEMINI_API_KEY=VOTRE_CLE

Vous pouvez aussi créer le fichier à partir de .env.example.

## 🧠 Mémoire persistante
- Sauvegarde locale par persona (localStorage + mémoire « absolue »).
- Clé de compatibilité : oracle_absolute_memory_v75 (migration automatique).
- Historique et résumé sont réinjectés automatiquement au démarrage.

## 🧰 Build local (optionnel)
Exécuter : scripts/windows/build.ps1

## 📦 Installation en PWA (Windows 11)
1) Ouvrir l’app dans Edge.
2) Menu « … » → « Applications » → « Installer ce site en tant qu’application ».
3) L’app devient une app Windows 11 (fenêtre dédiée + icône).
