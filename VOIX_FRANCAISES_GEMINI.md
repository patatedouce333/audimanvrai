# Configuration des Voix Françaises - Gemini 2.0 Live API

## 🎯 Problème Identifié
La voix **Charon** parle français avec un accent américain car c'est une voix anglophone native.

## 📋 Voix Disponibles dans Gemini 2.0 Live API

### Voix Actuellement Disponibles (Toutes Anglophones)
Gemini 2.0 Flash ne dispose actuellement **QUE de voix anglophones** :

| Nom      | Type     | Caractéristiques                    |
|----------|----------|-------------------------------------|
| **Puck** | Masculin | Voix douce, jeune, énergique        |
| **Charon** | Masculin | Voix grave, mature, autoritaire (ACTUELLE) |
| **Kore** | Féminin  | Voix équilibrée, professionnelle    |
| **Fenrir** | Masculin | Voix intense, puissante            |
| **Zephyr** | Féminin | Voix calme, apaisante              |

> ⚠️ **IMPORTANT**: Aucune de ces voix n'est native en français. Elles sont toutes conçues pour l'anglais.

## ✅ Solutions Recommandées

### Solution 1: Utiliser la Voix Kore (Recommandé)
La voix **Kore** (féminine) a tendance à produire un accent moins marqué en français:

```typescript
speechConfig: { 
  voiceConfig: { 
    prebuiltVoiceConfig: { 
      voiceName: 'Kore' 
    } 
  }
}
```

### Solution 2: Ajouter des Instructions Linguistiques Renforcées
Votre code contient déjà des instructions linguistiques. Voici une version **améliorée** :

```typescript
const linguisticInstruction = `
### PARAMÈTRES LINGUISTIQUES & AUDIO (SYSTEM) ###

LANGUE : Français (France) - EXCLUSIVEMENT
LOCUTEUR : Natif francophone de France métropolitaine
ACCENT : Standard parisien / neutre français

RÈGLES DE PRONONCIATION STRICTES :
- Prononcer TOUS les mots avec l'accent français standard
- R français guttural (pas R américain roulé)
- Voyelles françaises pures : [y], [œ], [ø], [ɛ̃], [ɑ̃], [ɔ̃]
- Liaison française obligatoire : "les_amis", "un_enfant"
- Pas d'accent tonique à l'américaine
- E muet respecté en fin de mot

INTERDICTIONS ABSOLUES :
- JAMAIS d'accent anglais ou américain
- Ne JAMAIS dire "Okay" → utiliser "D'accord", "Très bien", "Entendu"
- Ne JAMAIS dire "Bye" → utiliser "Au revoir", "À bientôt"
- Ne JAMAIS dire "Hello" → utiliser "Bonjour", "Salut"
- Éviter tous anglicismes non nécessaires
- Ne pas prononcer les consonnes finales muettes (sauf liaison)

EXPRESSIONS FRANÇAISES OBLIGATOIRES :
- "D'accord" au lieu de "OK"
- "Bien sûr" au lieu de "Sure"
- "Pardon" au lieu de "Sorry"
- "Merci" au lieu de "Thanks"
- "De rien" au lieu de "You're welcome"

INTONATION :
- Mélodie française avec accent tonique en fin de groupe rythmique
- Pas d'intonation montante à l'américaine en milieu de phrase
- Rythme syllabique régulier (syllable-timed, pas stress-timed)

Tu es un assistant vocal FRANÇAIS. Chaque mot, chaque son doit être français natif.
`;
```

### Solution 3: Configuration Complète Optimisée

Voici la configuration **complète et optimale** à utiliser :

```typescript
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });
const sessionPromise = ai.live.connect({
  model: 'gemini-2.0-flash-exp',
  callbacks: {
    // ... vos callbacks existants
  },
  config: {
    responseModalities: [Modality.AUDIO],
    
    // Configuration de la voix
    speechConfig: { 
      voiceConfig: { 
        prebuiltVoiceConfig: { 
          voiceName: 'Kore'  // ✅ Kore recommandée pour le français
        } 
      }
    },
    
    // Instruction système renforcée
    systemInstruction: linguisticInstruction + "\n" + baseInstruction + historyLog,
    
    // Outils
    tools: [{ googleSearch: {} }]
  }
});
```

## 🔧 Modifications à Appliquer

### Dans `hooks/useLiveAudio.ts`

1. **Changer la voix par défaut** (ligne ~45):
```typescript
const [voiceName, setVoiceName] = useState('Kore'); // Était 'Charon'
```

2. **Renforcer les instructions linguistiques** (ligne ~183-191):
Remplacer les instructions linguistiques actuelles par la version améliorée ci-dessus.

### Dans `App.tsx`

1. **Mettre Kore par défaut** (ligne ~269):
```typescript
<option value="Charon">Voix: Charon (Anglophone)</option>
<option value="Puck">Voix: Puck (Anglophone)</option>
<option value="Kore" selected>Voix: Kore (Meilleure pour français)</option>
<option value="Fenrir">Voix: Fenrir (Anglophone)</option>
<option value="Zephyr">Voix: Zephyr (Anglophone)</option>
```

2. **Ajouter des labels explicites** pour informer que les voix sont anglophones.

## 📊 Résultats Attendus

### Avec Charon (Actuel)
- ❌ Accent américain prononcé
- ❌ "R" roulé à l'américaine
- ❌ Intonation anglophone
- ❌ Voyelles anglicisées

### Avec Kore + Instructions Renforcées
- ✅ Accent moins marqué (mais pas parfait)
- ✅ Meilleure prononciation des voyelles françaises
- ✅ Intonation plus naturelle
- ✅ Respect des liaisons
- ⚠️ Toujours un léger accent résiduel (limitation de l'API)

## 🚀 Futures Solutions

### Option Future: Custom Voice (Pas encore disponible)
Google pourrait ajouter à l'avenir la possibilité de créer des voix personnalisées avec:
```typescript
speechConfig: { 
  voiceConfig: { 
    customVoiceConfig: {
      language: 'fr-FR',
      gender: 'FEMALE',
      pitch: 0.0,
      speakingRate: 1.0
    }
  }
}
```

### Option Alternative: Autres APIs
Si l'accent reste problématique, considérer :
- **ElevenLabs** : Excellentes voix françaises natives
- **Google Cloud Text-to-Speech** : Voix françaises natives (WaveNet)
- **Azure Speech Services** : Voix françaises natives (Neural)

## 🎤 Test des Voix

Pour tester rapidement chaque voix :

```typescript
// Dans votre code
const testVoices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];
testVoices.forEach(voice => {
  console.log(`Test de ${voice}...`);
  setVoiceName(voice);
  // Lancer une connexion test
});
```

## 📌 Conclusion

**Réponse à vos questions :**

1. **Voix françaises disponibles** : Aucune voix native française. Toutes sont anglophones.

2. **Configuration recommandée** : 
   - Voix : **Kore** (meilleur compromis)
   - Instructions linguistiques renforcées
   - System prompt explicite en français

3. **Paramètres spécifiques** : Instructions système détaillées avec règles de prononciation explicites

4. **Liste complète** : 5 voix disponibles (Puck, Charon, Kore, Fenrir, Zephyr) - toutes anglophones

**Limitation actuelle de l'API** : Gemini 2.0 Flash Live ne propose pas encore de voix françaises natives. L'amélioration passe par l'optimisation des instructions système et le choix de la voix la plus adaptable (Kore).
