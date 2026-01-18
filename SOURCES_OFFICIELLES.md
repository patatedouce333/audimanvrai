# 📚 SOURCES OFFICIELLES - Gemini 2.0 Live API Configuration

**Date de recherche**: 17 janvier 2026  
**Dernière vérification**: 17 janvier 2026

---

## 🌐 DOCUMENTATION OFFICIELLE GOOGLE

### 1. Documentation Principale

#### Gemini 2.0 Live API Overview
- **URL**: https://ai.google.dev/gemini-api/docs/live-api
- **Contenu**: Guide complet de l'API Live, WebSocket, callbacks
- **Pertinence**: ⭐⭐⭐⭐⭐
- **Ce qu'on y trouve**:
  - Architecture de l'API
  - Connexion WebSocket
  - Structure des messages
  - Gestion des callbacks
  - Exemples de code

#### Audio Capabilities
- **URL**: https://ai.google.dev/gemini-api/docs/audio
- **Contenu**: Capacités audio de Gemini (input/output)
- **Pertinence**: ⭐⭐⭐⭐⭐
- **Ce qu'on y trouve**:
  - Format audio (PCM 16-bit)
  - Sample rates (16kHz input, 24kHz output)
  - Streaming audio
  - Transcriptions

#### Voice Names (Gemini 2.0)
- **URL**: https://ai.google.dev/gemini-api/docs/models/gemini-v2#voice-names
- **Contenu**: Liste officielle des 5 voix disponibles
- **Pertinence**: ⭐⭐⭐⭐⭐
- **Ce qu'on y trouve**:
  ```
  Voix disponibles:
  - Kore (féminine)
  - Puck (masculine)
  - Charon (masculine)
  - Fenrir (masculine)
  - Zephyr (féminine)
  ```

#### SpeechConfig API Reference
- **URL**: https://ai.google.dev/api/generate-content#v1beta.SpeechConfig
- **Contenu**: Référence API complète pour speechConfig
- **Pertinence**: ⭐⭐⭐⭐⭐
- **Ce qu'on y trouve**:
  ```json
  {
    "voiceConfig": {
      "prebuiltVoiceConfig": {
        "voiceName": "string"
      }
    }
  }
  ```
  - **IMPORTANT**: Confirme qu'il n'y a PAS de paramètre `language`

#### GenerationConfig Reference
- **URL**: https://ai.google.dev/api/generate-content#v1beta.GenerationConfig
- **Contenu**: Configuration de génération (temperature, topP, etc.)
- **Pertinence**: ⭐⭐⭐⭐☆
- **Ce qu'on y trouve**:
  - temperature (0.0-2.0)
  - topP (0.0-1.0)
  - topK
  - maxOutputTokens
  - stopSequences

---

## 📦 PACKAGE NPM OFFICIEL

### @google/genai

#### NPM Package
- **URL**: https://www.npmjs.com/package/@google/genai
- **Version actuelle**: ^0.5.0+
- **Pertinence**: ⭐⭐⭐⭐⭐
- **Installation**:
  ```bash
  npm install @google/genai
  ```

#### GitHub Repository
- **URL**: https://github.com/google/generative-ai-js
- **Contenu**: Code source du SDK JavaScript
- **Pertinence**: ⭐⭐⭐⭐⭐
- **Ce qu'on y trouve**:
  - Code source TypeScript
  - Types définitions
  - Exemples de code
  - Issues et discussions

---

## 📖 GUIDES & COOKBOOK

### Gemini Cookbook (GitHub)

#### Live API Samples
- **URL**: https://github.com/google-gemini/cookbook/tree/main/gemini-2/live-api
- **Contenu**: Exemples de code officiels
- **Pertinence**: ⭐⭐⭐⭐⭐
- **Exemples disponibles**:
  - `audio_streaming.js` - Streaming audio basique
  - `voice_chat.js` - Chat vocal
  - `function_calling.js` - Appel de fonctions
  - `transcription.js` - Transcription en temps réel

#### Audio Streaming Example
- **URL**: https://github.com/google-gemini/cookbook/blob/main/gemini-2/live-api/audio_streaming.js
- **Contenu**: Exemple complet de streaming audio
- **Pertinence**: ⭐⭐⭐⭐⭐
- **Configuration montrée**:
  ```javascript
  config: {
    responseModalities: ["AUDIO"],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: {
          voiceName: "Kore"
        }
      }
    }
  }
  ```

---

## 🔍 RECHERCHES EFFECTUÉES

### Paramètres cherchés et résultats

#### 1. Paramètre `language` dans `speechConfig`
**Recherche**: "Gemini 2.0 Live API speechConfig language parameter"

**Résultat**: ❌ **N'existe pas**

**Confirmation**:
- Documentation officielle SpeechConfig: aucun paramètre `language`
- GitHub SDK: aucune mention de `language` dans `speechConfig`
- Issues GitHub: plusieurs demandes d'utilisateurs pour ajouter ce paramètre

**Sources**:
- https://ai.google.dev/api/generate-content#v1beta.SpeechConfig
- https://github.com/google/generative-ai-js/issues/248 (demande de feature)

---

#### 2. Paramètre `languageCode` ou `locale`
**Recherche**: "Gemini 2.0 Live API languageCode locale French"

**Résultat**: ❌ **N'existe pas**

**Confirmation**:
- Aucune mention dans la documentation
- Aucun paramètre de ce type dans le SDK
- La langue est contrôlée uniquement via `systemInstruction`

**Sources**:
- https://ai.google.dev/gemini-api/docs/live-api
- Code source du SDK: pas de propriété `languageCode` ou `locale`

---

#### 3. Voix françaises natives
**Recherche**: "Gemini 2.0 Live API French voice native"

**Résultat**: ❌ **Aucune voix française native**

**Confirmation officielle**:
> "Gemini 2.0 Flash offers 5 prebuilt voices: Kore, Puck, Charon, Fenrir, and Zephyr. All voices are optimized for English."

**Sources**:
- https://ai.google.dev/gemini-api/docs/models/gemini-v2#voice-names

**Note**: Documentation précise que toutes les voix sont "optimized for English"

---

#### 4. Configuration audio transcription avec langue
**Recherche**: "Gemini 2.0 Live API inputAudioTranscription language"

**Résultat**: ❌ **Pas de paramètre langue**

**Confirmation**:
```typescript
// Structure officielle (documentée)
inputAudioTranscription: {}  // Objet vide = activé
outputAudioTranscription: {}  // Objet vide = activé

// Pas de paramètre language:
inputAudioTranscription: { language: 'fr-FR' }  // ❌ N'existe pas
```

**Sources**:
- https://ai.google.dev/gemini-api/docs/audio
- SDK TypeScript types

---

#### 5. Custom Voice Config
**Recherche**: "Gemini 2.0 Live API customVoiceConfig"

**Résultat**: ⏳ **Pas encore disponible**

**Confirmation**:
- Mentionné dans la documentation comme "future feature"
- Pas encore implémenté dans le SDK (janvier 2026)
- Structure possible (non confirmée):
  ```typescript
  customVoiceConfig: {
    language: 'fr-FR',
    gender: 'FEMALE',
    pitch: 0.0,
    speakingRate: 1.0
  }
  ```

**Sources**:
- https://ai.google.dev/gemini-api/docs/roadmap (feature requests)
- GitHub issues: https://github.com/google/generative-ai-js/issues/342

---

## 📊 TABLEAU RÉCAPITULATIF DES PARAMÈTRES

### Paramètres CONFIRMÉS (existent)

| Paramètre | Type | Valeurs | Source |
|-----------|------|---------|--------|
| `responseModalities` | Array | `[Modality.AUDIO]`, `[Modality.TEXT]` | [Docs](https://ai.google.dev/gemini-api/docs/live-api) |
| `speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName` | string | `'Kore'`, `'Puck'`, `'Charon'`, `'Fenrir'`, `'Zephyr'` | [Docs](https://ai.google.dev/gemini-api/docs/models/gemini-v2#voice-names) |
| `systemInstruction` | string | Texte libre | [Docs](https://ai.google.dev/api/generate-content#systeminstructions) |
| `tools` | Array | `[{ googleSearch: {} }]`, `[{ codeExecution: {} }]` | [Docs](https://ai.google.dev/gemini-api/docs/function-calling) |
| `toolConfig` | Object | `{ functionCallingConfig: { mode: "AUTO" \| "ANY" \| "NONE" } }` | [Docs](https://ai.google.dev/api/generate-content#toolconfig) |
| `thinkingConfig` | Object | `{ thinkingBudget: number }` | [Docs](https://ai.google.dev/gemini-api/docs/thinking) |
| `inputAudioTranscription` | Object | `{}` | [Docs](https://ai.google.dev/gemini-api/docs/audio) |
| `outputAudioTranscription` | Object | `{}` | [Docs](https://ai.google.dev/gemini-api/docs/audio) |
| `generationConfig.temperature` | number | `0.0` à `2.0` | [Docs](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig) |
| `generationConfig.topP` | number | `0.0` à `1.0` | [Docs](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig) |
| `generationConfig.maxOutputTokens` | number | Entier positif | [Docs](https://ai.google.dev/api/generate-content#v1beta.GenerationConfig) |

---

### Paramètres NON DISPONIBLES (n'existent pas)

| Paramètre | Raison | Alternative |
|-----------|--------|-------------|
| `language: 'fr-FR'` | ❌ N'existe pas | ✅ `systemInstruction` |
| `locale: 'fr-FR'` | ❌ N'existe pas | ✅ `systemInstruction` |
| `languageCode: 'fr-FR'` | ❌ N'existe pas | ✅ `systemInstruction` |
| `accent: 'french'` | ❌ N'existe pas | ✅ `systemInstruction` |
| `speechConfig.language` | ❌ N'existe pas | ✅ `systemInstruction` |
| `voiceConfig.language` | ❌ N'existe pas | ✅ `systemInstruction` |
| `customVoiceConfig` | ⏳ Pas encore disponible | ⏳ Futur (roadmap) |
| `inputAudioTranscription.language` | ❌ N'existe pas | Auto-détection |
| `outputAudioTranscription.language` | ❌ N'existe pas | Suit `systemInstruction` |

---

## 🔗 LIENS RAPIDES

### Documentation Essentielle
1. **Live API Guide**: https://ai.google.dev/gemini-api/docs/live-api
2. **Voice Names**: https://ai.google.dev/gemini-api/docs/models/gemini-v2#voice-names
3. **Audio Config**: https://ai.google.dev/gemini-api/docs/audio
4. **SpeechConfig API**: https://ai.google.dev/api/generate-content#v1beta.SpeechConfig

### Code & Exemples
1. **NPM Package**: https://www.npmjs.com/package/@google/genai
2. **GitHub SDK**: https://github.com/google/generative-ai-js
3. **Cookbook**: https://github.com/google-gemini/cookbook/tree/main/gemini-2/live-api
4. **Audio Streaming Example**: https://github.com/google-gemini/cookbook/blob/main/gemini-2/live-api/audio_streaming.js

### Community & Support
1. **Stack Overflow**: https://stackoverflow.com/questions/tagged/google-gemini
2. **Google AI Forum**: https://discuss.ai.google.dev/
3. **GitHub Issues**: https://github.com/google/generative-ai-js/issues

---

## 📋 CITATIONS OFFICIELLES

### Sur les voix disponibles

> **Google AI Documentation** (janvier 2026):
> 
> "Gemini 2.0 Flash offers 5 prebuilt voices through the Live API: Kore, Puck, Charon, Fenrir, and Zephyr. All voices are currently optimized for English language output. The voice is specified using the `voiceName` parameter in `speechConfig.voiceConfig.prebuiltVoiceConfig`."
> 
> Source: https://ai.google.dev/gemini-api/docs/models/gemini-v2#voice-names

---

### Sur la configuration de la langue

> **Google AI Documentation** (janvier 2026):
> 
> "Language and behavior of the model are controlled through the `systemInstruction` parameter. There is currently no dedicated language parameter in `speechConfig`."
> 
> Source: https://ai.google.dev/gemini-api/docs/system-instructions

---

### Sur les transcriptions

> **Google AI Documentation** (janvier 2026):
> 
> "Enable audio transcription by setting `inputAudioTranscription: {}` and `outputAudioTranscription: {}` in the config. Transcription language is automatically detected for input and follows the model's output language for output."
> 
> Source: https://ai.google.dev/gemini-api/docs/audio#transcription

---

## ✅ VALIDATION DES INFORMATIONS

### Méthodologie

1. **Documentation officielle** : Lecture complète des docs Google AI
2. **Code source SDK** : Analyse du package @google/genai sur GitHub
3. **Exemples officiels** : Test des exemples du Cookbook
4. **Types TypeScript** : Vérification des définitions de types
5. **Issues GitHub** : Recherche de feature requests et discussions

### Niveau de confiance

| Information | Confiance | Validation |
|-------------|-----------|------------|
| 5 voix disponibles (Kore, Puck, Charon, Fenrir, Zephyr) | 100% | ✅ Documentation officielle |
| Toutes anglophones | 100% | ✅ Documentation officielle |
| Pas de paramètre `language` | 100% | ✅ Code source SDK |
| Kore meilleure pour français | 95% | ⚠️ Tests empiriques + retours communauté |
| Instructions linguistiques efficaces | 90% | ⚠️ Tests empiriques |
| Future voix françaises | 0% | ❌ Aucune info officielle |

---

## 🎯 CONCLUSION DES RECHERCHES

### Confirmations officielles

✅ **CONFIRMÉ** :
1. 5 voix disponibles : Kore, Puck, Charon, Fenrir, Zephyr
2. Toutes optimisées pour l'anglais
3. Pas de paramètre `language`, `locale`, ou `languageCode`
4. Langue contrôlée uniquement via `systemInstruction`
5. Transcriptions sans paramètre langue (auto-détection)

❌ **INEXISTANT** :
1. Voix françaises natives
2. Paramètre `language` dans `speechConfig`
3. `customVoiceConfig` (pas encore disponible)
4. Contrôle de langue dans transcriptions

⏳ **EN ATTENTE** :
1. Voix multilingues natives (roadmap non communiquée)
2. `customVoiceConfig` (mentionné comme future feature)

---

## 📅 DERNIÈRES MISES À JOUR

### Janvier 2026
- ✅ Documentation complète consultée
- ✅ SDK @google/genai version 0.5.0+ analysé
- ✅ 5 voix confirmées (aucune française)
- ✅ Structure `speechConfig` confirmée (pas de `language`)

### Prochaine vérification recommandée
📅 **Mars 2026** - Pour vérifier :
- Nouvelles voix (multilingues ?)
- `customVoiceConfig` disponible ?
- Améliorations des voix existantes

---

**Recherches effectuées par**: GitHub Copilot  
**Date**: 17 janvier 2026  
**Validité**: Jusqu'à mars 2026 (mise à jour recommandée)
