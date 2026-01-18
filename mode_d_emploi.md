# 🎙️how to fix  Modèle Gemini 2026 Audio Français : Guide de Configuration Optimale
update modele first 
Ce guide récapitule les meilleures pratiques et configurations pour exploiter le moteur **Gemini 2.5 Native Audio** (souvent appelé "Gemini 3 Audio" par les utilisateurs) afin d'obtenir le rendu vocal français le plus naturel et le plus performant possible.

---

## 🏗️ 1. Identité du Modèle (L'Engine)
Pour les interactions vocales temps réel (Live API), le modèle utilisé est :
- **ID Technique :** `gemini-2.5-flash-native-audio-preview-12-2025`
- **Pourquoi ce choix ?** Contrairement aux modèles de texte classiques, celui-ci est **multimodal natif**. Il ne "lit" pas du texte avec une voix de synthèse ; il génère directement des ondes audio. Cela permet de capturer les nuances, les hésitations et les intonations propres au français.

---

## 🗣️ 2. Configuration des Voix Françaises
Le modèle propose 5 "personas" vocaux pré-entraînés. Voici le diagnostic pour une utilisation en français :

| Nom de la Voix | Profil Audio | Recommandation FR |
| :--- | :--- | :--- |
| **Zephyr** | Féminin, Calme, Posé | **Top 1** pour le français (très clair et apaisant). |
| **Charon** | Masculin, Grave, Autoritaire | Idéal pour les assistants type "Oracle" ou "Expert". |
| **Kore** | Féminin, Dynamique, Équilibré | Excellent pour un usage général quotidien. |
| **Puck** | Masculin, Jeune, Amical | Parfait pour l'humour ou un ton décontracté. |
| **Fenrir** | Masculin, Intense, Narrateur | Utilisé pour le storytelling ou les voix de caractère. |

---

## 🧠 3. Directives Système (Le Secret du Réalisme)
Pour forcer le modèle à quitter son "accent américain par défaut", il faut injecter des instructions de **prosodie** dans le prompt système :

### Template de directive française optimale :
```text
"Tu parles un français impeccable, naturel et moderne. 
Évite les tournures de phrases trop rigides. 
Utilise une ponctuation expressive pour guider ton intonation. 
Si l'utilisateur est hésitant, sois patient et réconfortant. 
Priorise la diction française de France, sans anglicismes inutiles."
```

---

## ⚡ 4. Optimisation de la Latence & Qualité
Pour une expérience "zéro friction", voici les paramètres réseau et audio appliqués :

1.  **Fréquence d'Échantillonnage (Sampling) :**
    - **Entrée :** 16,000 Hz (Optimal pour la reconnaissance vocale).
    - **Sortie :** 24,000 Hz (Qualité Hi-Fi pour la restitution de la voix).
2.  **Thinking Budget :**
    - Configuré à **0 tokens** pour une réactivité instantanée (mode conversationnel).
    - Configuré entre **8k et 16k tokens** pour des réponses complexes (médical, dev) afin que l'IA "réfléchisse" à la meilleure façon de formuler sa réponse avant de parler.
3.  **VAD (Voice Activity Detection) :**
    - Le modèle détecte automatiquement quand tu t'arrêtes de parler. Pour le français, nous avons activé le **Barge-in**, te permettant de couper l'IA si elle se trompe.

---

## 💡 5. Conseils d'Experts pour 2026
- **Le "Sang" Visuel :** Toujours garder un retour visuel (pulsation) synchronisé sur le volume réel pour que l'utilisateur sache que la liaison est "vivante".
- **Nettoyage du Contexte :** Ne pas envoyer plus de 10 messages d'historique dans le prompt système pour éviter que l'IA ne s'embrouille dans ses directives vocales.
- **Le format .PCM :** Le modèle n'envoie pas de fichiers MP3. Il envoie du flux binaire pur. C'est ce qui permet de commencer à entendre le début de la phrase avant même que la fin ne soit générée.

---
# 🧠 Documentation Technique : Gemini Live Oracle v1.1.0

Ce document détaille la configuration souveraine de l'assistant vocal, son architecture de liaison et le paramétrage du moteur de synthèse.

---

## 🚀 1. Le Cœur : Modèle Gemini 2.5 Native Audio
L'application utilise la toute dernière itération du modèle multimodal de Google :
- **Nom technique :** `gemini-2.5-flash-native-audio-preview-12-2025`
- **Capacité :** Traitement natif des flux audio (sans passage par une étape intermédiaire Text-to-Speech/Speech-to-Text externe), ce qui permet une latence de moins de 500ms et une capture des émotions.

---

## 🎙️ 2. Configuration des Voix (Synthesizer)
Le modèle propose 5 textures vocales distinctes. Le choix est géré via le composant de sélection et passé dynamiquement au démarrage de la session.

### Paramétrage technique
```typescript
config: {
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: { 
        voiceName: 'Charon' // 'Charon', 'Puck', 'Kore', 'Fenrir', 'Zephyr'
      }
    }
  }
}
```

### Optimisation pour le Français
Bien que le modèle soit entraîné sur des données globales, la fluidité du français est garantie par deux leviers :
1.  **System Instruction :** Chaque persona commence par une directive explicite : `"Tu es une IA... Tu parles exclusivement français."`.
2.  **Transcriptions :** Les flags `inputAudioTranscription` et `outputAudioTranscription` sont activés pour assurer une cohérence textuelle en arrière-plan.

---

## 🌊 3. Protocole de Liaison (Le Flux "Sang")
La connexion est maintenue par un **WebSocket bidirectionnel** via le SDK `@google/genai`.

### Pipeline Audio Input
- **Format :** PCM 16-bit (Mono)
- **Fréquence :** 16,000 Hz
- **Capture :** `ScriptProcessorNode` traite les buffers micro par tranches de 2048 samples avant encodage Base64 et envoi via `sendRealtimeInput`.

### Pipeline Audio Output
- **Format :** PCM 16-bit (Raw)
- **Fréquence :** 24,000 Hz
- **Rendu :** `AudioBufferSourceNode` avec ordonnancement temporel strict (`nextStartTime`) pour éviter les craquements entre les chunks reçus.

---

## 💾 4. Mémoire & Extraction
- **Stockage Local :** Utilisation du `localStorage` (`oracle_absolute_memory_v75`) pour conserver les 10 derniers échanges et les réinjecter dans le contexte système au reboot.
- **Fonction Export :** Génération d'un Blob textuel formaté (Dossier Patient/Session) avec horodatage pour archivage externe.

---

## 🛠️ 5. Maintenance des Prompts
Les protocoles sont classés par versioning.
- **v1.1.0(B)** : Version actuelle optimisée pour l'audio (phrases courtes, annonces de listes, sécurité accrue).
- **Modification :** Se fait via l'onglet **Prompt** ou directement dans les constantes du fichier `App.tsx`.
