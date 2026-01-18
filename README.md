# 🎙️ Audioman - Console de Liaison Vocale Multi-Agents

**Version :** 1.2.0  
**Date :** 13 janvier 2026  
**Statut :** ✅ Production Ready

## 🎯 Description

Audioman est une application vocale temps réel alimentée par Gemini 2.5 Native Audio, permettant de dialoguer avec 4 agents spécialisés via une interface audio bidirectionnelle. Chaque agent est optimisé pour un domaine spécifique et utilise la recherche Google en temps réel pour maximiser la précision de ses réponses.

### Agents Disponibles

1. **🏥 Oracle Médical** - Support clinique et pharmacologie
2. **🎭 Script Doctor** - Co-auteur humoristique et création de contenu
3. **🕵️ Détective Sceptique** - Fact-checker et vérification d'informations
4. **💻 Architecte Code 2026** - Expert développement full-stack
5. **🩸 Oracle Anémie 2026** - Hématologie de pointe (Thèses/Essais 2025-26)
6. **🕊️ Oracle Évangélique** - Coaching spirituel basé sur les paroles du Christ
7. **✍️ Coach Onesta** - Narratologie émotionnelle pour autobiographie de résilience

---

## 🏗️ Architecture Technique

### Stack
- **Frontend :** React 19 + TypeScript + Vite 6
- **API IA :** Gemini 2.5 Native Audio (Live API)
- **SDK :** @google/genai v1.34.0
- **Audio :** WebRTC + Web Audio API (16kHz input / 24kHz output)

### Flux de Données

```
Microphone (16kHz)
    ↓
useLiveAudio Hook (WebSocket)
    ↓
Gemini Live Session
    ├─→ Google Search Tool (recherche automatique)
    └─→ Audio Response (24kHz)
         ↓
    Haut-parleurs
```

### Fichiers Clés

```
audioman/
├── App.tsx                      # Interface principale + sélection d'agents
├── hooks/
│   └── useLiveAudio.ts         # Gestion session Gemini + WebSocket
├── components/
│   ├── MonitoringPanel.tsx     # Logs système et debug
│   ├── SystemSettings.tsx      # Configuration des prompts
│   ├── Visualizer.tsx          # Visualisation audio
│   └── TranscriptionWindow.tsx # Affichage transcriptions
├── prompts.md                  # Bibliothèque des 4 protocoles agents (v1.2.0)
├── .env.local                  # Clé API Gemini
└── vite-env.d.ts              # Types TypeScript pour import.meta.env
```

---

## 🔑 Fonctionnalités Principales

### 1. Audio Bidirectionnel Temps Réel
- Capture micro avec réduction de bruit et AEC
- Réponse vocale fluide avec 5 voix disponibles (Charon, Puck, Kore, Fenrir, Zephyr)
- Visualisation du volume en temps réel

### 2. Recherche Internet Impérative (v1.2.0)
**RÈGLE D'OR :** Chaque agent a l'obligation d'utiliser Google Search pour vérifier les faits avant de répondre. Interdiction absolue de deviner ou de mentir.

### 3. Historique de Conversation
- Sauvegarde locale (localStorage)
- Export en fichier texte
- Import de sessions précédentes
- Les 10 derniers échanges sont injectés dans le contexte système

### 4. Mute/Unmute Intelligent
- Coupure micro instantanée
- Maintien de la session sans interruption
- Indicateur visuel de l'état

---

## 🚀 Installation et Lancement

### Prérequis
- **Node.js** 18+ (recommandé : 20 LTS)
- **Navigateur** moderne avec WebRTC actif (Chrome/Edge conseillé)
- **Clé API Gemini** (https://aistudio.google.com/apikey)
- **Permissions micro** accordées dans le navigateur

### Variables d'environnement
- `VITE_GEMINI_API_KEY` (obligatoire) : clé API Gemini
    - Fichier : `.env.local` (non commité). Exemple :
        - `VITE_GEMINI_API_KEY=votre_cle_api_ici`
    - Sans cette clé, la liaison audio échoue.

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/karimcinetas6-jpg/audioman.git
cd audioman

# 2. Installer les dépendances
npm install

# 3. Configurer la clé API
echo "VITE_GEMINI_API_KEY=votre_clé_ici" > .env.local

# 4. Lancer le serveur de développement
npm run dev

# 5. Ouvrir dans le navigateur
# http://localhost:5173
```

### Build Production

```bash
npm run build
npm run preview
```

### Workflow développeur (rapide)
```bash
# Vérifier les types
npx tsc --noEmit

# Lancer le dev server
npm run dev

# Build de production
npm run build
```

### Points de contrôle qualité
- **Audio** : vérifier l'autorisation micro dans le navigateur
- **Clé API** : confirmée dans `.env.local`
- **Grounding** : `useLiveAudio.ts` inclut `tools: [{ googleSearch: {} }]`
- **Prompts** : version 1.2.0 avec règle d'or de recherche

---

## 📋 Guide d'Utilisation

1. **Sélectionner un agent** : Cliquez sur l'un des 4 boutons (Médical, Humour, Détective, Dév 2026)
2. **Activer la liaison** : Cliquez sur le bouton principal pour démarrer la session
3. **Parler** : Parlez naturellement, le modèle transcrit et répond en audio
4. **Mute au besoin** : Utilisez le bouton "Micro OFF" pour couper temporairement
5. **Consulter les logs** : Bouton "Logs" en haut à droite pour voir l'activité système
6. **Modifier les prompts** : Bouton "Prompt" pour ajuster les directives système

---

## 🔧 Configuration Avancée

### Voix Disponibles
Modifiables dans le dropdown :
- **Charon** (par défaut)
- **Puck**
- **Kore**
- **Fenrir**
- **Zephyr**

### Personnalisation des Agents
Éditez `prompts.md` ou utilisez l'interface "Prompt" pour modifier :
- Le ton et le débit de parole
- Les protocoles de dialogue
- Les règles de sécurité
- Les obligations de recherche

---

## 🛡️ Sécurité et Confidentialité

- ✅ **Aucun stockage serveur** : Toutes les données restent locales (localStorage)
- ✅ **API sécurisée** : La clé Gemini est stockée en `.env.local` (gitignored)
- ✅ **Pas de tracking** : Aucune télémétrie externe

---

## 📝 Changelog

### v1.2.0 (13 janvier 2026)
- ✅ Correction "Jiminy" → "Gemini" dans tous les prompts
- ✅ Ajout **RÈGLE D'OR : RECHERCHE INTERNET IMPÉRATIVE**
- ✅ Durcissement des protocoles agents (obligation de vérification)
- ✅ Activation de `googleSearch` dans la session Gemini Live
- ✅ Suppression des dossiers backend erronés (agent/, orchestrator/, youtube-transcriber/)
- ✅ Fix erreurs TypeScript (TechSpecs.tsx, useLiveAudio.ts)
- ✅ Création `vite-env.d.ts` pour typage import.meta.env

### v1.1.0 (12 janvier 2026)
- Protocoles de dialogue vocal structurés
- Renforcement des protocoles de sécurité
- Ajout de champs VERSION/VARIANT/DATE

---

## 🐛 Dépannage

### "La liaison ne s'établit pas"
→ Vérifiez que `VITE_GEMINI_API_KEY` est défini dans `.env.local`

### "Pas de son"
→ Autorisez l'accès au micro dans les paramètres du navigateur

### "Erreur de compilation TypeScript"
→ Lancez `npx tsc --noEmit` pour identifier les erreurs

### "Le modèle ne cherche pas sur Google"
→ Vérifiez que le prompt contient la directive RECHERCHE et que `tools: [{ googleSearch: {} }]` est présent dans `useLiveAudio.ts`

---

## 📄 Licence

Projet personnel. Code source disponible pour consultation et apprentissage.

---

## 🤝 Support

Pour toute question ou amélioration, ouvrir une issue sur le dépôt GitHub.
