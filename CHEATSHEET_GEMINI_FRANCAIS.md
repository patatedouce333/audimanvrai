# 🇫🇷 CHEATSHEET - Configuration Gemini 2.0 Live API pour Français

> **Version**: Janvier 2026  
> **API**: Gemini 2.0 Flash (`gemini-2.0-flash-exp`)  
> **Package**: `@google/genai`

---

## ⚡ CONFIGURATION MINIMALE (Quick Start)

```typescript
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    systemInstruction: `Tu parles français exclusivement. 
                        R guttural [ʁ], liaisons obligatoires. 
                        Jamais d'anglicismes (OK → D'accord).`,
    inputAudioTranscription: {},
    outputAudioTranscription: {}
  }
});
```

---

## 🎤 VOIX DISPONIBLES

| Nom      | Genre | Note FR | Usage Recommandé |
|----------|-------|---------|------------------|
| **Kore** ⭐ | F | 9/10 | **PRODUCTION (défaut)** |
| Zephyr   | F     | 7/10    | Alternative douce |
| Puck     | M     | 6/10    | Voix jeune |
| Fenrir   | M     | 5/10    | Voix intense |
| Charon   | M     | 4/10    | ❌ À éviter (fort accent) |

```typescript
speechConfig: { 
  voiceConfig: { 
    prebuiltVoiceConfig: { 
      voiceName: 'Kore'  // ✅ Meilleure pour français
    } 
  }
}
```

---

## 📋 TOUS LES PARAMÈTRES CONFIG

```typescript
config: {
  // 1. MODALITÉS (OBLIGATOIRE)
  responseModalities: [Modality.AUDIO],
  
  // 2. VOIX
  speechConfig: { 
    voiceConfig: { 
      prebuiltVoiceConfig: { voiceName: 'Kore' } 
    }
  },
  
  // 3. INSTRUCTION SYSTÈME (contrôle langue)
  systemInstruction: string,
  
  // 4. TRANSCRIPTIONS (optionnel)
  inputAudioTranscription: {},   // {} = activé
  outputAudioTranscription: {},  // {} = activé
  
  // 5. OUTILS (optionnel)
  tools: [
    { googleSearch: {} },
    { codeExecution: {} }
  ],
  
  // 6. CONFIG OUTILS (optionnel)
  toolConfig: {
    functionCallingConfig: { mode: "AUTO" | "ANY" | "NONE" }
  },
  
  // 7. THINKING (optionnel)
  thinkingConfig: {
    thinkingBudget: 16000  // 0-24000
  },
  
  // 8. GÉNÉRATION (optionnel)
  generationConfig: {
    temperature: 0.9,         // 0.0-2.0
    topP: 0.95,              // 0.0-1.0
    topK: 40,                // entier
    maxOutputTokens: 8192,   // max tokens
    stopSequences: []        // ["FIN"]
  },
  
  // 9. SÉCURITÉ (optionnel)
  safetySettings: [{
    category: "HARM_CATEGORY_*",
    threshold: "BLOCK_NONE"
  }]
}
```

---

## 🇫🇷 INSTRUCTION SYSTÈME FRANÇAISE (Template)

```typescript
const FRENCH_CONFIG = `
### PARAMÈTRES LINGUISTIQUES ###

LANGUE : Français (France) - EXCLUSIVEMENT
ACCENT : Standard parisien / neutre français

PRONONCIATION :
- R guttural français [ʁ] (PAS R américain)
- Liaisons obligatoires : les_amis, un_enfant
- Consonnes finales muettes (sauf liaison)
- Voyelles pures : [y], [ø], [œ], [ɛ̃], [ɑ̃], [ɔ̃]
- Accent tonique en FIN de groupe rythmique
- Rythme syllabique régulier

INTERDICTIONS ABSOLUES :
❌ "Okay" → ✅ "D'accord"
❌ "Bye" → ✅ "Au revoir"
❌ "Hello" → ✅ "Bonjour"
❌ "Sorry" → ✅ "Pardon"
❌ "Thanks" → ✅ "Merci"

EXPRESSIONS FRANÇAISES :
✅ "N'est-ce pas ?"
✅ "Voilà"
✅ "Eh bien..."
✅ "En fait..."
✅ "Tout à fait"

Tu es un assistant vocal français natif.
`;
```

---

## 🎯 PARAMÈTRES CLÉS

### responseModalities
```typescript
[Modality.AUDIO]         // Audio natif (recommandé)
[Modality.TEXT]          // Texte uniquement
// [Modality.AUDIO, Modality.TEXT]  // Rarement utilisé
```

### speechConfig
```typescript
speechConfig: { 
  voiceConfig: { 
    prebuiltVoiceConfig: { 
      voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr'
    }
  }
}
```

**⚠️ PAS DE**:
- `language: 'fr-FR'` ❌
- `locale: 'fr-FR'` ❌
- `languageCode` ❌

**Langue contrôlée uniquement via `systemInstruction`**

### tools (Outils)

**Google Search**:
```typescript
tools: [{ googleSearch: {} }]
```

**Code Execution**:
```typescript
tools: [{ codeExecution: {} }]
```

**Fonction Custom**:
```typescript
tools: [{
  functionDeclarations: [{
    name: "nom_fonction",
    description: "Description de la fonction",
    parameters: {
      type: "object",
      properties: {
        param1: { type: "string", description: "..." }
      },
      required: ["param1"]
    }
  }]
}]
```

### thinkingConfig
```typescript
thinkingConfig: {
  thinkingBudget: 0        // Instantané, pas de réflexion
  // thinkingBudget: 8000  // Équilibré
  // thinkingBudget: 24000 // Maximum (plus lent)
}
```

### generationConfig
```typescript
generationConfig: {
  temperature: 0.9,        // Créativité
  topP: 0.95,             // Diversité
  maxOutputTokens: 8192   // Limite
}
```

---

## 📨 ENVOI DE MESSAGE

### Envoyer du texte
```typescript
session.send({
  clientContent: {
    turns: [{
      role: 'user',
      parts: [{ text: 'Bonjour !' }]
    }],
    turnComplete: true
  }
});
```

### Envoyer de l'audio
```typescript
// Audio PCM 16-bit, 16kHz, mono
const audioChunk = new Int16Array(/* ... */);

session.send({
  realtimeInput: {
    mediaChunks: [{
      mimeType: 'audio/pcm;rate=16000',
      data: btoa(String.fromCharCode(...new Uint8Array(audioChunk.buffer)))
    }]
  }
});
```

---

## 📥 RÉCEPTION DE MESSAGE

```typescript
onmessage: async (message: LiveServerMessage) => {
  // Transcription input
  const inputText = message.serverContent?.inputTranscription?.text;
  if (inputText) console.log('User:', inputText);
  
  // Transcription output
  const outputText = message.serverContent?.outputTranscription?.text;
  if (outputText) console.log('AI:', outputText);
  
  // Audio reçu (PCM 16-bit, 24kHz, mono)
  const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
  if (audioData) {
    const buffer = Buffer.from(audioData, 'base64');
    // Décoder et jouer l'audio
  }
  
  // Tour terminé
  if (message.serverContent?.turnComplete) {
    console.log('Tour terminé');
  }
  
  // Tool Call
  if (message.toolCall) {
    const toolName = message.toolCall.functionCalls[0].name;
    // Exécuter la fonction et renvoyer toolResponse
  }
}
```

---

## 🎧 FORMAT AUDIO

### INPUT (Envoi)
- **Format**: PCM 16-bit
- **Sample Rate**: 16,000 Hz
- **Channels**: 1 (Mono)
- **Encoding**: Base64

### OUTPUT (Réception)
- **Format**: PCM 16-bit
- **Sample Rate**: 24,000 Hz
- **Channels**: 1 (Mono)
- **Encoding**: Base64

---

## ❌ PARAMÈTRES QUI N'EXISTENT PAS

Ces paramètres **N'EXISTENT PAS** dans l'API :

```typescript
// ❌ NE MARCHERA PAS
language: 'fr-FR'
locale: 'fr-FR'
languageCode: 'fr-FR'
accent: 'french'
voiceLanguage: 'french'
speechRecognitionLanguage: 'fr-FR'

speechConfig: {
  language: 'fr-FR',              // ❌
  voiceConfig: {
    language: 'fr-FR',            // ❌
    customVoiceConfig: { ... }    // ❌ Pas encore dispo
  }
}
```

**Langue = `systemInstruction` uniquement**

---

## 🔧 EXEMPLE COMPLET

```typescript
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const FRENCH_PROMPT = `
Tu parles français exclusivement.
R guttural [ʁ], liaisons obligatoires.
Jamais d'anglicismes : "OK" → "D'accord", "Bye" → "Au revoir".
Tu es un assistant vocal français natif.
`;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const session = await ai.live.connect({
  model: 'gemini-2.0-flash-exp',
  
  callbacks: {
    onopen: () => console.log('Connecté'),
    
    onmessage: async (message: LiveServerMessage) => {
      const inputText = message.serverContent?.inputTranscription?.text;
      const outputText = message.serverContent?.outputTranscription?.text;
      const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      
      if (inputText) console.log('👤', inputText);
      if (outputText) console.log('🤖', outputText);
      if (audioData) {
        // Décoder et jouer l'audio PCM 24kHz
      }
    },
    
    onerror: (err) => console.error('Erreur:', err),
    onclose: () => console.log('Déconnecté')
  },
  
  config: {
    responseModalities: [Modality.AUDIO],
    
    speechConfig: { 
      voiceConfig: { 
        prebuiltVoiceConfig: { voiceName: 'Kore' } 
      }
    },
    
    systemInstruction: FRENCH_PROMPT + "\n\nTu es un assistant médical expert.",
    
    tools: [{ googleSearch: {} }],
    
    inputAudioTranscription: {},
    outputAudioTranscription: {},
    
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 8192
    },
    
    thinkingConfig: {
      thinkingBudget: 16000
    }
  }
});

// Envoyer un message
session.send({
  clientContent: {
    turns: [{
      role: 'user',
      parts: [{ text: 'Bonjour !' }]
    }],
    turnComplete: true
  }
});

// Fermer
await session.disconnect();
```

---

## 📊 COMPARAISON VOIX

| Métrique | Kore | Zephyr | Puck | Fenrir | Charon |
|----------|------|--------|------|--------|--------|
| Accent FR | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ | ★☆☆☆☆ |
| Clarté | ★★★★★ | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★★☆☆ |
| Naturel | ★★★★☆ | ★★★★☆ | ★★★☆☆ | ★★☆☆☆ | ★★☆☆☆ |
| **Note** | **9/10** | 7/10 | 6/10 | 5/10 | 4/10 |

**Recommandation**: **Kore** pour production ⭐

---

## 🚀 COMMANDES RAPIDES

### Installation
```bash
npm install @google/genai
```

### Variables d'environnement
```bash
export GEMINI_API_KEY="votre_clé_api"
```

### Test rapide
```typescript
npx ts-node test-voix-francaises.ts
```

---

## 🔗 SOURCES OFFICIELLES

- **Live API**: https://ai.google.dev/gemini-api/docs/live-api
- **Audio Guide**: https://ai.google.dev/gemini-api/docs/audio
- **Voices**: https://ai.google.dev/gemini-api/docs/models/gemini-v2#voice-names
- **NPM Package**: https://www.npmjs.com/package/@google/genai
- **GitHub**: https://github.com/google/generative-ai-js

---

## ⚠️ LIMITATIONS

1. ❌ **Pas de voix françaises natives** (toutes anglophones)
2. ⚠️ **Accent résiduel** même avec instructions optimales
3. ⚠️ **Pas de paramètre `language`** dans speechConfig
4. ⚠️ **Transcription automatique** (pas de contrôle langue)

---

## 💡 TIPS

1. **Voix Kore** = meilleur compromis français
2. **Instructions détaillées** = accent amélioré
3. **Température 0.7-1.0** = réponses naturelles
4. **thinkingBudget 16000** = équilibre qualité/vitesse
5. **Toujours activer transcriptions** = debug facile

---

**Dernière mise à jour**: 17 janvier 2026  
**Prochaine révision**: Mars 2026
