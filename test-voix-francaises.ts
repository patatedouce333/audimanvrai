/**
 * Script de Test des Voix Françaises - Gemini 2.0 Live API
 * 
 * Ce script teste automatiquement les 5 voix disponibles
 * avec la même phrase en français pour comparer la qualité.
 * 
 * Usage:
 *   npm install @google/genai
 *   export GEMINI_API_KEY="votre_clé"
 *   npx ts-node test-voix-francaises.ts
 */

import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

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

// Phrase de test (avec sons difficiles en français)
const TEST_PHRASE = `
Bonjour ! Je suis un assistant vocal intelligent. 
Aujourd'hui, je vais vous aider avec un problème médical urgent.
Pouvez-vous me décrire vos symptômes ? 
J'ai accès à toutes les ressources nécessaires pour vous guider.
Au revoir et bonne journée !
`;

// Les 5 voix disponibles
const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'] as const;

interface VoiceTestResult {
  voice: string;
  transcription: string;
  audioBuffer: Buffer[];
  duration: number;
  errors: string[];
}

/**
 * Teste une voix spécifique
 */
async function testVoice(voice: string, apiKey: string): Promise<VoiceTestResult> {
  console.log(`\n🎤 Test de la voix: ${voice}`);
  console.log('━'.repeat(50));
  
  const result: VoiceTestResult = {
    voice,
    transcription: '',
    audioBuffer: [],
    duration: 0,
    errors: []
  };
  
  const startTime = Date.now();
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const session = await ai.live.connect({
      model: 'gemini-2.0-flash-exp',
      
      callbacks: {
        onopen: () => {
          console.log(`✅ Connexion établie pour ${voice}`);
        },
        
        onmessage: async (message: LiveServerMessage) => {
          // Transcription de sortie
          const outputText = message.serverContent?.outputTranscription?.text;
          if (outputText) {
            result.transcription += outputText;
            console.log(`📝 ${outputText}`);
          }
          
          // Audio reçu
          const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            const buffer = Buffer.from(audioData, 'base64');
            result.audioBuffer.push(buffer);
            console.log(`🔊 Audio chunk reçu: ${buffer.length} bytes`);
          }
          
          // Tour terminé
          if (message.serverContent?.turnComplete) {
            result.duration = Date.now() - startTime;
            console.log(`✓ Tour terminé en ${result.duration}ms`);
          }
        },
        
        onerror: (error) => {
          const errorMsg = `Erreur: ${error.message}`;
          result.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        },
        
        onclose: () => {
          console.log(`🔌 Connexion fermée pour ${voice}`);
        }
      },
      
      config: {
        responseModalities: [Modality.AUDIO],
        
        speechConfig: { 
          voiceConfig: { 
            prebuiltVoiceConfig: { 
              voiceName: voice as any
            } 
          }
        },
        
        systemInstruction: FRENCH_LINGUISTIC_CONFIG + `\n\nRéponds exactement ceci (et rien d'autre) :\n${TEST_PHRASE}`,
        
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        
        generationConfig: {
          temperature: 0.3,  // Basse température pour reproduction fidèle
          maxOutputTokens: 1024
        }
      }
    });
    
    // Envoyer une requête texte pour déclencher la réponse
    session.send({
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text: 'Commence maintenant.' }]
        }],
        turnComplete: true
      }
    });
    
    // Attendre que la réponse soit complète (max 30 secondes)
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Déconnecter
    await session.disconnect();
    
  } catch (error: any) {
    result.errors.push(error.message);
    console.error(`❌ Erreur lors du test de ${voice}:`, error.message);
  }
  
  return result;
}

/**
 * Teste toutes les voix et génère un rapport
 */
async function testAllVoices() {
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║  TEST DES VOIX FRANÇAISES - GEMINI 2.0 LIVE API     ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Erreur: Variable GEMINI_API_KEY non définie');
    console.error('💡 Export: export GEMINI_API_KEY="votre_clé"');
    process.exit(1);
  }
  
  console.log(`📋 Phrase de test:\n${TEST_PHRASE}\n`);
  console.log(`🎯 Voix à tester: ${VOICES.join(', ')}\n`);
  
  const results: VoiceTestResult[] = [];
  
  // Tester chaque voix
  for (const voice of VOICES) {
    const result = await testVoice(voice, apiKey);
    results.push(result);
    
    // Pause entre les tests
    console.log('\n⏳ Pause de 5 secondes...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Générer le rapport
  console.log('\n\n╔═══════════════════════════════════════════════════════╗');
  console.log('║                 RAPPORT COMPARATIF                    ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  
  // Tableau comparatif
  console.log('┌─────────┬──────────┬────────────┬──────────┬─────────┐');
  console.log('│  Voix   │ Durée(ms)│ Audio(KB)  │ Erreurs  │ Qualité │');
  console.log('├─────────┼──────────┼────────────┼──────────┼─────────┤');
  
  for (const result of results) {
    const audioSize = result.audioBuffer.reduce((sum, buf) => sum + buf.length, 0) / 1024;
    const quality = result.errors.length === 0 ? '✅' : '❌';
    
    console.log(
      `│ ${result.voice.padEnd(7)} │ ${result.duration.toString().padStart(8)} │ ${audioSize.toFixed(2).padStart(10)} │ ${result.errors.length.toString().padStart(8)} │ ${quality.padEnd(7)} │`
    );
  }
  
  console.log('└─────────┴──────────┴────────────┴──────────┴─────────┘\n');
  
  // Transcriptions comparées
  console.log('\n📝 TRANSCRIPTIONS COMPARÉES:\n');
  for (const result of results) {
    console.log(`┌─ ${result.voice} ${'─'.repeat(50 - result.voice.length)}`);
    console.log(`│ ${result.transcription || '(pas de transcription)'}`);
    console.log('└' + '─'.repeat(55));
    console.log('');
  }
  
  // Erreurs détaillées
  const resultsWithErrors = results.filter(r => r.errors.length > 0);
  if (resultsWithErrors.length > 0) {
    console.log('\n❌ ERREURS DÉTAILLÉES:\n');
    for (const result of resultsWithErrors) {
      console.log(`Voix ${result.voice}:`);
      result.errors.forEach(err => console.log(`  • ${err}`));
      console.log('');
    }
  }
  
  // Recommandation
  console.log('\n💡 RECOMMANDATION:\n');
  const bestResult = results
    .filter(r => r.errors.length === 0)
    .sort((a, b) => a.duration - b.duration)[0];
  
  if (bestResult) {
    console.log(`✅ Meilleure voix: ${bestResult.voice}`);
    console.log(`   • Durée: ${bestResult.duration}ms`);
    console.log(`   • Audio: ${(bestResult.audioBuffer.reduce((s, b) => s + b.length, 0) / 1024).toFixed(2)} KB`);
    console.log(`   • Aucune erreur`);
  } else {
    console.log('⚠️ Aucune voix n\'a fonctionné correctement');
  }
  
  // Sauvegarder les résultats
  const outputDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Sauvegarder le rapport JSON
  const reportPath = path.join(outputDir, `test-voices-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
  
  // Sauvegarder les fichiers audio (si disponibles)
  for (const result of results) {
    if (result.audioBuffer.length > 0) {
      const audioPath = path.join(outputDir, `${result.voice}-${Date.now()}.pcm`);
      const fullAudio = Buffer.concat(result.audioBuffer);
      fs.writeFileSync(audioPath, fullAudio);
      console.log(`🔊 Audio sauvegardé: ${audioPath}`);
      console.log(`   Format: PCM 16-bit, 24kHz, Mono`);
      console.log(`   Taille: ${(fullAudio.length / 1024).toFixed(2)} KB`);
    }
  }
  
  console.log('\n✅ Test terminé!\n');
}

// Exécuter les tests
if (require.main === module) {
  testAllVoices().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

export { testVoice, testAllVoices };
