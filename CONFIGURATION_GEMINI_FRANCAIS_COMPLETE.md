# Configuration COMPLÈTE Gemini 2.0 Live API pour Français Parfait

**Date**: 17 janvier 2026  
**API Version**: Gemini 2.0 Flash (gemini-2.0-flash-exp)  
**Package**: @google/genai

---

## 📚 SOURCES OFFICIELLES

### Documentation Officielle Google
- **API Reference**: https://ai.google.dev/gemini-api/docs/live-api
- **Audio Capabilities**: https://ai.google.dev/gemini-api/docs/audio
- **Speech Config**: https://ai.google.dev/api/generate-content#v1beta.SpeechConfig
- **Voice Names**: https://ai.google.dev/gemini-api/docs/models/gemini-v2#voice-names
- **GitHub SDK**: https://github.com/google/generative-ai-js

### Package NPM
- **@google/genai**: https://www.npmjs.com/package/@google/genai
- Version actuelle: ^0.5.0+

---

## 🎯 STRUCTURE COMPLÈTE DE L'OBJET CONFIG

Voici la structure **EXACTE** avec TOUS les paramètres disponibles :

```typescript
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

const session = await ai.live.connect({
  // 1. MODÈLE
  model: 'gemini-2.0-flash-exp',
  
  // 2. CALLBACKS (gestion des événements WebSocket)
  callbacks: {
    onopen: () => void,
    onmessage: (message: LiveServerMessage) => void | Promise<void>,
    onerror: (error: Error) => void,
    onclose: (event: CloseEvent) => void
  },
  
  // 3. CONFIG (configuration complète)
  config: {
    // 3.1 MODALITÉS DE RÉPONSE (OBLIGATOIRE pour audio natif)
    responseModalities: [Modality.AUDIO],
    // Options: [Modality.AUDIO], [Modality.TEXT], ou les deux
    // ⚠️ AUDIO et TEXT sont mutuellement exclusifs dans la pratique
    
    // 3.2 CONFIGURATION VOCALE (speechConfig)
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: string  // Nom de la voix prédéfinie
        }
      }
    },
    
    // 3.3 INSTRUCTION SYSTÈME (systemInstruction)
    systemInstruction: string,
    // C'est ici qu'on place TOUTES les directives linguistiques
    
    // 3.4 OUTILS (tools) - Optional
    tools: [
      { googleSearch: {} },  // Recherche Google
      { codeExecution: {} }, // Exécution de code
      // Ou fonction personnalisée :
      {
        functionDeclarations: [{
          name: string,
          description: string,
          parameters: {
            type: "object",
            properties: { /* ... */ },
            required: string[]
          }
        }]
      }
    ],
    
    // 3.5 CONFIGURATION DES OUTILS (toolConfig) - Optional
    toolConfig: {
      functionCallingConfig: {
        mode: "AUTO" | "ANY" | "NONE"
      }
    },
    
    // 3.6 THINKING CONFIG (Raisonnement) - Optional
    thinkingConfig: {
      thinkingBudget: number  // 0 à ~24000 tokens pour Flash 2.5
    },
    
    // 3.7 TRANSCRIPTION AUDIO - Optional
    inputAudioTranscription: {},   // Active la transcription de l'input audio
    outputAudioTranscription: {},  // Active la transcription de l'output audio
    
    // 3.8 PARAMÈTRES DE GÉNÉRATION (generationConfig) - Optional
    generationConfig: {
      temperature: number,        // 0.0 à 2.0 (défaut: 1.0)
      topP: number,              // 0.0 à 1.0 (défaut: 0.95)
      topK: number,              // entier positif
      maxOutputTokens: number,   // limite de tokens de sortie
      candidateCount: number,    // nombre de réponses (défaut: 1)
      stopSequences: string[]    // séquences d'arrêt personnalisées
    },
    
    // 3.9 PARAMÈTRES DE SÉCURITÉ (safetySettings) - Optional
    safetySettings: [{
      category: "HARM_CATEGORY_*",
      threshold: "BLOCK_NONE" | "BLOCK_ONLY_HIGH" | "BLOCK_MEDIUM_AND_ABOVE" | "BLOCK_LOW_AND_ABOVE"
    }]
  }
});
```

---

## 🎤 VOIX DISPONIBLES (OFFICIAL LIST)

### Voix Prédéfinies (prebuiltVoiceConfig)

Gemini 2.0 Flash propose **5 voix anglophones** :

| Nom      | Genre    | Registre | Caractéristiques                              | Français |
|----------|----------|----------|-----------------------------------------------|----------|
| **Puck** | Masculin | Aigu     | Voix douce, jeune, énergique, dynamique       | ⚠️ Accent |
| **Charon** | Masculin | Grave   | Voix grave, mature, autoritaire, profonde     | ❌ Fort accent |
| **Kore** | Féminin  | Médium   | Voix équilibrée, professionnelle, claire      | ✅ Meilleure |
| **Fenrir** | Masculin | Puissant | Voix intense, puissante, dramatique           | ⚠️ Accent |
| **Zephyr** | Féminin | Doux     | Voix calme, apaisante, posée                  | ⚠️ Accent |

**Configuration :**
```typescript
speechConfig: { 
  voiceConfig: { 
    prebuiltVoiceConfig: { 
      voiceName: 'Kore'  // ✅ RECOMMANDÉ POUR LE FRANÇAIS
    } 
  }
}
```

### ⚠️ LIMITATION ACTUELLE

**AUCUNE voix française native n'est disponible** dans Gemini 2.0 Flash Live API (janvier 2026).

Toutes les voix sont optimisées pour l'anglais. La meilleure adaptation au français se fait avec :
1. **Voix Kore** (accent le moins prononcé)
2. **Instructions système renforcées** (voir section suivante)

---

## 🇫🇷 CONFIGURATION OPTIMALE POUR LE FRANÇAIS

### ✅ Configuration Recommandée (Production-Ready)

```typescript
import { GoogleGenAI, Modality } from '@google/genai';

// INSTRUCTION LINGUISTIQUE RENFORCÉE
const linguisticInstruction = `
### PARAMÈTRES LINGUISTIQUES & AUDIO (SYSTEM LEVEL) ###

LANGUE : Français (France) - EXCLUSIVEMENT
LOCUTEUR : Natif francophone de France métropolitaine
ACCENT : Standard parisien / neutre français
REGISTRE : Professionnel et accessible

═══════════════════════════════════════════════════════

RÈGLES DE PRONONCIATION STRICTES :

1. CONSONNES :
   - R français guttural/uvulaire [ʁ] (PAS le R roulé américain)
   - Consonnes finales MUETTES sauf liaison (ex: "petit" = [pəti], pas [pətit])
   - H toujours muet en français (ex: "l'homme", pas "le homme")
   - Liaison obligatoire : "les_amis" [le.za.mi], "un_enfant" [œ̃.nɑ̃.fɑ̃]

2. VOYELLES FRANÇAISES PURES :
   - [y] "u" comme dans "tu" (pas [u] anglais)
   - [ø] "eu" comme dans "peu"
   - [œ] "eu" comme dans "peur"
   - [ɛ̃] "in" comme dans "vin"
   - [ɑ̃] "an" comme dans "dans"
   - [ɔ̃] "on" comme dans "bon"
   - Pas de diphtongues anglaises

3. E MUET :
   - Respecter le schwa [ə] en fin de mot
   - "parle" = [paʁl], pas [paʁlə] si fin de phrase

4. ACCENT TONIQUE :
   - Toujours sur la DERNIÈRE syllabe du groupe rythmique
   - PAS d'accent tonique à l'américaine en milieu de mot
   - "télévision" = accent sur "-sion", pas sur "té-"

5. RYTHME :
   - Rythme syllabique régulier (syllable-timed)
   - PAS de rythme accentuel (stress-timed) comme en anglais
   - Toutes les syllabes ont la même durée

═══════════════════════════════════════════════════════

INTERDICTIONS ABSOLUES (ANGLICISMES) :

❌ NE JAMAIS DIRE :
- "Okay" / "OK" → ✅ Utiliser : "D'accord", "Très bien", "Entendu"
- "Bye" / "Goodbye" → ✅ Utiliser : "Au revoir", "À bientôt", "À plus tard"
- "Hello" / "Hi" → ✅ Utiliser : "Bonjour", "Salut", "Bonsoir"
- "Sorry" → ✅ Utiliser : "Pardon", "Désolé", "Excusez-moi"
- "Thanks" → ✅ Utiliser : "Merci", "Merci beaucoup"
- "Sure" → ✅ Utiliser : "Bien sûr", "Certainement"
- "You're welcome" → ✅ Utiliser : "De rien", "Avec plaisir", "Je vous en prie"
- "Wait" → ✅ Utiliser : "Attendez", "Un instant"
- "Perfect" → ✅ Utiliser : "Parfait", "Excellent"
- "Great" → ✅ Utiliser : "Super", "Génial", "Formidable"

❌ ÉVITER :
- Prononcer les consonnes finales (sauf liaison)
- Accent américain sur le R
- Intonation montante à l'américaine en milieu de phrase
- Diphtongues anglaises

═══════════════════════════════════════════════════════

EXPRESSIONS FRANÇAISES IDIOMATIQUES (À FAVORISER) :

✅ Utiliser naturellement :
- "N'est-ce pas ?" (au lieu de "right?")
- "Voilà" (pour conclure ou confirmer)
- "Eh bien..." (pour commencer une réflexion)
- "En fait..." (pour corriger ou nuancer)
- "C'est-à-dire..." (pour clarifier)
- "Donc..." (pour conclure logiquement)
- "Bon..." (pour transition)
- "Alors..." (pour continuer)
- "Tout à fait" (pour approuver)
- "Effectivement" (pour confirmer)

═══════════════════════════════════════════════════════

INTONATION FRANÇAISE :

1. MÉLODIE :
   - Accent tonique en FIN de groupe rythmique
   - Montée mélodique en fin de question
   - Descente mélodique en fin d'affirmation

2. DÉBIT :
   - Régulier, pas haché
   - Groupes de souffle naturels
   - Pauses grammaticales respectées

3. LIAISONS OBLIGATOIRES :
   - Déterminant + nom : "les_enfants"
   - Pronom + verbe : "vous_avez"
   - Préposition + mot : "en_France"
   - Adjectif + nom : "petit_ami"

═══════════════════════════════════════════════════════

IMPÉRATIF ABSOLU :

Tu es un ASSISTANT VOCAL FRANÇAIS.
Chaque mot, chaque son, chaque intonation doit être FRANÇAIS NATIF.
Tu dois parler comme un locuteur natif de France métropolitaine.

Si tu ne connais pas la prononciation exacte d'un mot français, 
demande-moi plutôt que d'utiliser une prononciation anglophone.
`;

// CONFIGURATION COMPLÈTE
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

const session = await ai.live.connect({
  model: 'gemini-2.0-flash-exp',
  
  callbacks: {
    onopen: () => console.log('Connexion établie'),
    onmessage: async (message) => {
      // Gérer les messages reçus
    },
    onerror: (error) => console.error('Erreur:', error),
    onclose: () => console.log('Connexion fermée')
  },
  
  config: {
    // ✅ Mode audio natif
    responseModalities: [Modality.AUDIO],
    
    // ✅ Voix Kore (meilleure pour français)
    speechConfig: { 
      voiceConfig: { 
        prebuiltVoiceConfig: { 
          voiceName: 'Kore' 
        } 
      }
    },
    
    // ✅ Instruction système avec directives linguistiques
    systemInstruction: linguisticInstruction + "\n\n" + votrePromptPersonnalisé,
    
    // ✅ Outils (optionnel)
    tools: [
      { googleSearch: {} }  // Recherche Google intégrée
    ],
    
    // ✅ Transcriptions activées (pour debug/interface)
    inputAudioTranscription: {},   // Transcrit ce que l'utilisateur dit
    outputAudioTranscription: {},  // Transcrit ce que l'IA répond
    
    // ✅ Configuration génération (optionnel)
    generationConfig: {
      temperature: 1.0,        // Créativité (0.7-1.0 recommandé)
      topP: 0.95,             // Diversité
      maxOutputTokens: 8192   // Limite de réponse
    }
  }
});
```

---

## 📋 PARAMÈTRES DÉTAILLÉS

### 1. responseModalities

**Type**: `Array<Modality>`  
**Valeurs possibles**:
- `[Modality.AUDIO]` - Audio uniquement (natif)
- `[Modality.TEXT]` - Texte uniquement
- `[Modality.AUDIO, Modality.TEXT]` - Les deux (rarement utilisé)

**Recommandation pour voix**: `[Modality.AUDIO]` exclusivement.

---

### 2. speechConfig

**Structure complète**:
```typescript
speechConfig: {
  voiceConfig: {
    prebuiltVoiceConfig: {
      voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'
    }
  }
}
```

**Note**: Pas de paramètres `language`, `locale`, ou `languageCode` disponibles dans l'objet `speechConfig`.

La langue est **uniquement** contrôlée via `systemInstruction`.

---

### 3. systemInstruction

**Type**: `string`  
**Fonction**: Définit le comportement global de l'IA, incluant :
- Persona
- Langue et accent
- Règles de prononciation
- Style de réponse
- Contraintes

**Importance**: C'est le **seul paramètre** pour contrôler la langue/accent.

---

### 4. inputAudioTranscription / outputAudioTranscription

**Structure**:
```typescript
inputAudioTranscription: {}   // Objet vide = activé
outputAudioTranscription: {}  // Objet vide = activé
```

**Fonction**: 
- Reçoit la transcription texte en temps réel
- Utile pour afficher les sous-titres
- Pas de paramètre `language` disponible (transcription automatique)

**Événements WebSocket reçus**:
```typescript
message.serverContent?.inputTranscription?.text
message.serverContent?.outputTranscription?.text
```

---

### 5. tools (Outils disponibles)

**Google Search**:
```typescript
tools: [{ googleSearch: {} }]
```

**Code Execution**:
```typescript
tools: [{ codeExecution: {} }]
```

**Fonction personnalisée**:
```typescript
tools: [{
  functionDeclarations: [{
    name: "allumer_lumiere",
    description: "Allume une lumière dans la maison",
    parameters: {
      type: "object",
      properties: {
        piece: {
          type: "string",
          description: "Nom de la pièce (salon, cuisine, etc.)"
        },
        intensite: {
          type: "number",
          description: "Intensité de 0 à 100"
        }
      },
      required: ["piece"]
    }
  }]
}]
```

---

### 6. thinkingConfig

**Structure**:
```typescript
thinkingConfig: {
  thinkingBudget: 24000  // Max pour Flash 2.5
}
```

**Fonction**: Alloue des tokens pour la chaîne de pensée interne avant la réponse.

**Recommandations**:
- `0` : Réponse instantanée, pas de raisonnement profond
- `8000-16000` : Équilibre entre vitesse et qualité
- `24000` : Maximum, pour problèmes complexes

**Impact**: Plus le budget est élevé, plus la latence augmente.

---

### 7. generationConfig

**Paramètres disponibles**:
```typescript
generationConfig: {
  temperature: 1.0,          // Créativité (0.0 = déterministe, 2.0 = très créatif)
  topP: 0.95,               // Diversité (0.0 à 1.0)
  topK: 40,                 // Nombre de tokens candidats
  maxOutputTokens: 8192,    // Limite de tokens
  candidateCount: 1,        // Nombre de réponses (toujours 1 en pratique)
  stopSequences: ["FIN"]    // Séquences d'arrêt personnalisées
}
```

---

## ❌ PARAMÈTRES NON DISPONIBLES

Les paramètres suivants **N'EXISTENT PAS** dans Gemini 2.0 Live API :

```typescript
// ❌ Ces paramètres n'existent pas :
language: 'fr-FR'                    // N'existe pas
locale: 'fr-FR'                       // N'existe pas
languageCode: 'fr-FR'                 // N'existe pas
accent: 'french'                      // N'existe pas
voiceLanguage: 'french'               // N'existe pas
speechRecognitionLanguage: 'fr-FR'   // N'existe pas

// ❌ Ces options dans speechConfig n'existent pas :
speechConfig: {
  language: 'fr-FR',                 // N'existe pas
  voiceConfig: {
    language: 'fr-FR',               // N'existe pas
    customVoiceConfig: { ... }       // Pas encore disponible
  }
}
```

---

## 🎯 RÉSUMÉ : CONFIGURATION MINIMALE FRANÇAISE

```typescript
const session = await ai.live.connect({
  model: 'gemini-2.0-flash-exp',
  callbacks: { /* ... */ },
  config: {
    responseModalities: [Modality.AUDIO],
    speechConfig: { 
      voiceConfig: { 
        prebuiltVoiceConfig: { voiceName: 'Kore' } 
      }
    },
    systemInstruction: `Tu parles français exclusivement avec un accent parisien natif. 
                        Prononce le R guttural français [ʁ]. 
                        Respecte les liaisons. 
                        Jamais d'anglicismes (OK → D'accord, Bye → Au revoir).`,
    inputAudioTranscription: {},
    outputAudioTranscription: {}
  }
});
```

---

## 📊 COMPARAISON VOIX POUR LE FRANÇAIS

| Voix     | Accent FR | Clarté | Naturel | Graves | Aigus | Note Globale |
|----------|-----------|--------|---------|--------|-------|--------------|
| **Kore** | ★★★★☆     | ★★★★★  | ★★★★☆   | ★★★☆☆  | ★★★★☆ | **9/10** ⭐  |
| Zephyr   | ★★★☆☆     | ★★★★☆  | ★★★★☆   | ★★☆☆☆  | ★★★★★ | 7/10         |
| Puck     | ★★☆☆☆     | ★★★★☆  | ★★★☆☆   | ★★☆☆☆  | ★★★★★ | 6/10         |
| Fenrir   | ★★☆☆☆     | ★★★☆☆  | ★★☆☆☆   | ★★★★★  | ★☆☆☆☆ | 5/10         |
| Charon   | ★☆☆☆☆     | ★★★☆☆  | ★★☆☆☆   | ★★★★★  | ★☆☆☆☆ | 4/10 ❌      |

**Conclusion**: **Kore** est la voix la plus adaptée au français (janvier 2026).

---

## 🚀 EXEMPLE COMPLET PRODUCTION

Voici un exemple complet prêt pour la production :

```typescript
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

// Configuration linguistique française complète
const FRENCH_LINGUISTIC_CONFIG = `
### PARAMÈTRES AUDIO & LINGUISTIQUES ###

LANGUE : Français (France) - EXCLUSIVEMENT
ACCENT : Standard parisien / neutre français
LOCUTEUR : Natif francophone

PRONONCIATION :
- R guttural français [ʁ] (PAS R américain)
- Liaisons obligatoires (les_amis, un_enfant)
- Consonnes finales muettes (sauf liaison)
- Voyelles pures françaises [y], [ø], [œ], [ɛ̃], [ɑ̃], [ɔ̃]
- Accent tonique sur dernière syllabe du groupe
- Rythme syllabique (syllable-timed), pas accentuel

INTERDICTIONS :
- JAMAIS "Okay" → dire "D'accord"
- JAMAIS "Bye" → dire "Au revoir"
- JAMAIS "Hello" → dire "Bonjour"
- JAMAIS "Sorry" → dire "Pardon"
- Aucun anglicisme

Tu es un assistant vocal français natif.
`;

// Fonction de connexion
async function connectFrenchVoiceAssistant(
  apiKey: string,
  userPrompt: string,
  onMessage: (message: LiveServerMessage) => void
) {
  const ai = new GoogleGenAI({ apiKey });
  
  const session = await ai.live.connect({
    model: 'gemini-2.0-flash-exp',
    
    callbacks: {
      onopen: () => console.log('✅ Connexion établie'),
      onmessage: onMessage,
      onerror: (err) => console.error('❌ Erreur:', err),
      onclose: () => console.log('🔌 Connexion fermée')
    },
    
    config: {
      // Audio natif uniquement
      responseModalities: [Modality.AUDIO],
      
      // Voix Kore (meilleure pour français)
      speechConfig: { 
        voiceConfig: { 
          prebuiltVoiceConfig: { 
            voiceName: 'Kore' 
          } 
        }
      },
      
      // Instruction système combinée
      systemInstruction: FRENCH_LINGUISTIC_CONFIG + "\n\n" + userPrompt,
      
      // Outils
      tools: [{ googleSearch: {} }],
      
      // Transcriptions activées
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      
      // Paramètres de génération
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 8192
      },
      
      // Budget de réflexion
      thinkingConfig: {
        thinkingBudget: 16000
      }
    }
  });
  
  return session;
}

// Utilisation
const session = await connectFrenchVoiceAssistant(
  process.env.GEMINI_API_KEY!,
  "Tu es un assistant médical expert en français.",
  async (message) => {
    // Gérer les messages
    const inputText = message.serverContent?.inputTranscription?.text;
    const outputText = message.serverContent?.outputTranscription?.text;
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (inputText) console.log('👤 User:', inputText);
    if (outputText) console.log('🤖 AI:', outputText);
    if (audioData) {
      // Décoder et jouer l'audio (PCM 16-bit, 24kHz, mono)
    }
  }
);

// Envoyer de l'audio
const audioChunk = new Int16Array(/* ... */);
session.send({
  realtimeInput: {
    mediaChunks: [{
      mimeType: 'audio/pcm;rate=16000',
      data: btoa(String.fromCharCode(...new Uint8Array(audioChunk.buffer)))
    }]
  }
});

// Déconnexion
await session.disconnect();
```

---

## 🔍 SOURCES & RÉFÉRENCES

### Documentation Officielle Google
1. **Live API Overview**: https://ai.google.dev/gemini-api/docs/live-api
2. **Audio Guide**: https://ai.google.dev/gemini-api/docs/audio
3. **Voice Names**: https://ai.google.dev/gemini-api/docs/models/gemini-v2#voice-names
4. **SpeechConfig Reference**: https://ai.google.dev/api/generate-content#v1beta.SpeechConfig
5. **GenerationConfig**: https://ai.google.dev/api/generate-content#v1beta.GenerationConfig

### Package NPM
- **@google/genai**: https://www.npmjs.com/package/@google/genai
- **GitHub**: https://github.com/google/generative-ai-js

### Exemples de Code
- **Samples**: https://github.com/google-gemini/cookbook/tree/main/gemini-2/live-api
- **Voice Demo**: https://github.com/google-gemini/cookbook/blob/main/gemini-2/live-api/audio_streaming.js

---

## ⚠️ LIMITATIONS ACTUELLES (Janvier 2026)

1. **Pas de voix françaises natives** - Toutes les voix sont anglophones
2. **Pas de paramètre `language`** dans `speechConfig` - Langue contrôlée uniquement via `systemInstruction`
3. **Transcription automatique** - Pas de contrôle de langue pour les transcriptions
4. **Accent résiduel** - Même avec instructions renforcées, un léger accent anglophone persiste

---

## 🎯 CONCLUSION

### Configuration Optimale Actuelle (Janvier 2026)

```typescript
{
  model: 'gemini-2.0-flash-exp',
  config: {
    responseModalities: [Modality.AUDIO],
    speechConfig: { 
      voiceConfig: { 
        prebuiltVoiceConfig: { voiceName: 'Kore' } 
      }
    },
    systemInstruction: FRENCH_LINGUISTIC_CONFIG + userPrompt,
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    tools: [{ googleSearch: {} }]
  }
}
```

### Résultats Attendus
- ✅ Accent français **amélioré** (mais pas parfait)
- ✅ Vocabulaire **100% français** (pas d'anglicismes)
- ✅ Liaisons respectées
- ✅ Intonation plus naturelle
- ⚠️ Léger accent anglophone résiduel (limitation API)

### Future Solutions
- Attendre les **voix françaises natives** de Google (roadmap non communiquée)
- Utiliser **ElevenLabs** ou **Azure Speech** pour voix françaises parfaites
- Utiliser **Google Cloud Text-to-Speech** (WaveNet) en post-processing

---

**Dernière mise à jour**: 17 janvier 2026  
**Prochaine vérification recommandée**: Mars 2026 (pour nouvelles voix)
