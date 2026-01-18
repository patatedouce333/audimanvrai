
import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { saveConversationAuto } from '../services/extremeSaving';

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
}

export interface AppLog {
  id: string;
  type: 'info' | 'tool' | 'error' | 'success';
  message: string;
  timestamp: number;
  data?: any;
}

interface UseLiveAudioReturn {
  isConnected: boolean;
  isConnecting: boolean;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  error: string | null;
  connect: (systemInstruction: string) => Promise<void>;
  disconnect: () => void;
  testMicrophone: () => Promise<{ ok: boolean; level: number }>;
  resetMicrophone: () => void;
  volume: number;
  history: ChatMessage[];
  summaryText: string;
  setMemoryScope: (scope: string) => void;
  appendSummaryText: (text: string) => void;
  clearHistory: () => void;
  clearSummary: () => void;
  importHistory: (text: string) => void;
  currentInput: string;
  currentOutput: string;
  voiceName: string;
  setVoiceName: (voice: string) => void;
  logs: AppLog[];
  clearLogs: () => void;
  isSearching: boolean;
}

const HISTORY_KEY_PREFIX = 'oracle_history_';
const SUMMARY_KEY_PREFIX = 'oracle_summary_';
const SUMMARY_BACKUP_PREFIX = 'oracle_summary_backup_';
const ABSOLUTE_MEMORY_KEY_PREFIX = 'oracle_absolute_memory_v75_';
const LEGACY_ABSOLUTE_MEMORY_KEY = 'oracle_absolute_memory_v75';

const getHistoryKey = (scope: string) => `${HISTORY_KEY_PREFIX}${scope}`;
const getSummaryKey = (scope: string) => `${SUMMARY_KEY_PREFIX}${scope}`;
const getSummaryBackupKey = (scope: string) => `${SUMMARY_BACKUP_PREFIX}${scope}`;
const getAbsoluteMemoryKey = (scope: string) => `${ABSOLUTE_MEMORY_KEY_PREFIX}${scope}`;

type AbsoluteMemoryBundle = {
  scope: string;
  updatedAt: number;
  history: ChatMessage[];
  summary: string;
};

const parseJson = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const normalizeHistory = (value: any): ChatMessage[] => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((m) => m && typeof m.text === 'string' && (m.role === 'user' || m.role === 'model' || m.role === 'system'))
    .map((m) => ({
      role: m.role,
      text: m.text,
      timestamp: typeof m.timestamp === 'number' ? m.timestamp : Date.now(),
    }));
};

const loadAbsoluteMemory = (scope: string): AbsoluteMemoryBundle | null => {
  const scopedRaw = localStorage.getItem(getAbsoluteMemoryKey(scope));
  if (scopedRaw) {
    const parsed = parseJson<AbsoluteMemoryBundle | any>(scopedRaw, null);
    if (parsed && typeof parsed === 'object') {
      return {
        scope,
        updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
        history: normalizeHistory(parsed.history),
        summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      };
    }
  }

  const legacyRaw = localStorage.getItem(LEGACY_ABSOLUTE_MEMORY_KEY);
  if (legacyRaw) {
    const legacyParsed = parseJson<any>(legacyRaw, null);
    if (Array.isArray(legacyParsed)) {
      return {
        scope,
        updatedAt: Date.now(),
        history: normalizeHistory(legacyParsed),
        summary: '',
      };
    }
    if (legacyParsed && typeof legacyParsed === 'object') {
      return {
        scope,
        updatedAt: typeof legacyParsed.updatedAt === 'number' ? legacyParsed.updatedAt : Date.now(),
        history: normalizeHistory(legacyParsed.history),
        summary: typeof legacyParsed.summary === 'string' ? legacyParsed.summary : '',
      };
    }
  }

  return null;
};

const writeAbsoluteMemory = (scope: string, history: ChatMessage[], summary: string) => {
  const payload: AbsoluteMemoryBundle = {
    scope,
    updatedAt: Date.now(),
    history,
    summary,
  };
  localStorage.setItem(getAbsoluteMemoryKey(scope), JSON.stringify(payload));
};

export const useLiveAudio = (): UseLiveAudioReturn => {
  const [memoryScope, setMemoryScope] = useState('medical');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [voiceName, setVoiceName] = useState('Kore');
  const initialMemory = (() => {
    const absolute = loadAbsoluteMemory('medical');
    if (absolute) return absolute;
    return {
      scope: 'medical',
      updatedAt: Date.now(),
      history: parseJson<ChatMessage[]>(localStorage.getItem(getHistoryKey('medical')), []),
      summary: localStorage.getItem(getSummaryKey('medical')) || '',
    } as AbsoluteMemoryBundle;
  })();

  const [history, setHistory] = useState<ChatMessage[]>(() => initialMemory.history);
  const [summaryText, setSummaryText] = useState<string>(() => initialMemory.summary);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [logs, setLogs] = useState<AppLog[]>([]);

  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const sessionRef = useRef<any>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  
  const isMutedRef = useRef(false);
  const isConnectedRef = useRef(false);
  const inputAccumulatorRef = useRef('');
  const outputAccumulatorRef = useRef('');
  const historyRef = useRef<ChatMessage[]>(history);
  const summaryRef = useRef<string>(summaryText);

  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { isConnectedRef.current = isConnected; }, [isConnected]);
  useEffect(() => { 
    historyRef.current = history;
    localStorage.setItem(getHistoryKey(memoryScope), JSON.stringify(history));
    writeAbsoluteMemory(memoryScope, history, summaryRef.current);
  }, [history, memoryScope]);
  useEffect(() => {
    summaryRef.current = summaryText;
    localStorage.setItem(getSummaryKey(memoryScope), summaryText);
    localStorage.setItem(getSummaryBackupKey(memoryScope), summaryText);
    writeAbsoluteMemory(memoryScope, historyRef.current, summaryText);
  }, [summaryText, memoryScope]);

  useEffect(() => {
    const absolute = loadAbsoluteMemory(memoryScope);
    if (absolute) {
      setHistory(absolute.history);
      setSummaryText(absolute.summary);
      return;
    }
    const savedHistory = localStorage.getItem(getHistoryKey(memoryScope));
    const savedSummary = localStorage.getItem(getSummaryKey(memoryScope)) || localStorage.getItem(getSummaryBackupKey(memoryScope)) || '';
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);
    setSummaryText(savedSummary);
  }, [memoryScope]);

  const addLog = useCallback((type: AppLog['type'], message: string, data?: any) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
      data
    }, ...prev].slice(0, 50));
  }, []);

  const appendSummary = useCallback((userText?: string, modelText?: string) => {
    if (!userText && !modelText) return;
    const ts = new Date().toLocaleString();
    const clean = (text: string) => text.replace(/\s+/g, ' ').trim().slice(0, 280);
    const parts: string[] = [];
    if (userText) parts.push(`U: ${clean(userText)}`);
    if (modelText) parts.push(`A: ${clean(modelText)}`);
    const line = `[${ts}] ${parts.join(' | ')}`;
    setSummaryText(prev => (prev ? `${prev}\n${line}` : line));
    saveConversationAuto(memoryScope, userText, modelText, { persona: memoryScope });
  }, [memoryScope]);

  const appendSummaryText = useCallback((text: string) => {
    if (!text.trim()) return;
    setSummaryText(prev => (prev ? `${prev}\n${text}` : text));
  }, []);

  const isDisconnectingRef = useRef(false);

  const stopAudio = useCallback((reason?: string) => {
    if (isDisconnectingRef.current) return;
    isDisconnectingRef.current = true;
    
    addLog('info', reason || 'Session terminée.');
    
    // Fermer la session proprement
    if (sessionRef.current) {
      try {
        sessionRef.current.disconnect?.();
      } catch (e) {}
      sessionRef.current = null;
    }
    
    sourcesRef.current.forEach(s => { try { s.stop(); s.disconnect(); } catch (e) {} });
    sourcesRef.current.clear();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (inputAudioContextRef.current) inputAudioContextRef.current.close().catch(() => {});
    if (outputAudioContextRef.current) outputAudioContextRef.current.close().catch(() => {});
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsMuted(false);
    setIsSearching(false);
    setVolume(0);
    inputAccumulatorRef.current = '';
    outputAccumulatorRef.current = '';
    setCurrentInput('');
    setCurrentOutput('');
    sessionPromiseRef.current = null;
    
    setTimeout(() => {
      isDisconnectingRef.current = false;
    }, 1000);
  }, [addLog]);

  const requestMicrophone = useCallback(async () => {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
          sampleSize: 16,
        },
      });
    } catch (err) {
      addLog('error', 'Échec contraintes strictes micro, fallback minimal.');
      return await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    }
  }, [addLog]);

  const testMicrophone = useCallback(async () => {
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const testCtx = new AudioContextClass();
      const source = testCtx.createMediaStreamSource(testStream);
      const analyser = testCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);
      let sum = 0;
      const samples = 20;
      for (let i = 0; i < samples; i++) {
        analyser.getFloatTimeDomainData(buffer);
        let frameSum = 0;
        for (let j = 0; j < buffer.length; j++) frameSum += buffer[j] * buffer[j];
        sum += Math.sqrt(frameSum / buffer.length);
        await new Promise(res => setTimeout(res, 50));
      }

      const level = (sum / samples) * 100;
      testStream.getTracks().forEach(t => t.stop());
      source.disconnect();
      analyser.disconnect();
      await testCtx.close();

      return { ok: level > 1, level };
    } catch (err: any) {
      addLog('error', 'Test micro échoué: ' + (err?.message || 'Inconnue'));
      return { ok: false, level: 0 };
    }
  }, [addLog]);

  const resetMicrophone = useCallback(() => {
    stopAudio('Réinitialisation micro');
  }, [stopAudio]);

  const connect = useCallback(async (baseInstruction: string) => {
    if (isConnected || isConnecting || isDisconnectingRef.current) return;
    
    // Nettoyer toute connexion précédente
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    
    setIsConnecting(true);

    try {
      const stream = await requestMicrophone();
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx; 
      outputAudioContextRef.current = outputCtx;

      if (inputCtx.state === 'suspended') await inputCtx.resume();
      if (outputCtx.state === 'suspended') await outputCtx.resume();

      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
      
      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Calcul du volume pour le retour visuel
        let sum = 0; 
        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
        const rms = Math.sqrt(sum / inputData.length);
        setVolume(rms * 100);

        // N'envoyer de l'audio que si la session est établie et non muté
        if (sessionRef.current && !isMutedRef.current && isConnectedRef.current) {
           const pcmBlob = createBlob(inputData, inputCtx.sampleRate, 16000);
           try {
             sessionRef.current.sendRealtimeInput({ media: pcmBlob });
           } catch (e) {
             console.error('Erreur envoi audio:', e);
           }
        }
      };
      
      source.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);

      // On ne garde que les 10 derniers échanges pour éviter de saturer le systemInstruction
      const recentHistory = historyRef.current.slice(-10);
      const historyLog = recentHistory.length > 0 
        ? `\n\n### HISTORIQUE RÉCENT :\n${recentHistory.map(m => `[${m.role === 'user' ? 'Auteur' : 'Oracle'}]: ${m.text}`).join('\n')}\n`
        : "";

      const linguisticInstruction = `
    Tu parles un français impeccable, naturel et moderne. Évite les tournures de phrases trop rigides. Utilise une ponctuation expressive pour guider ton intonation. Si l'utilisateur est hésitant, sois patient et réconfortant. Priorise la diction française de France, sans anglicismes inutiles.

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

      const summaryLog = summaryRef.current
        ? `\n\n### MÉMOIRE RÉSUMÉE (TXT) :\n${summaryRef.current.split('\n').slice(-50).join('\n')}\n`
        : "";
      const directiveNoQuestions = "\n\nDIRECTIVE: Réponds de façon directe et complète. Évite de poser des questions. Si une info manque, fais une hypothèse prudente et continue.\n";

      const fullInstruction = linguisticInstruction + "\n" + baseInstruction + directiveNoQuestions + historyLog + summaryLog;

      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY as string });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Session ouverte');
            setIsConnected(true); 
            setIsConnecting(false); 
            addLog('success', 'Liaison neuronale établie.'); 
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              setIsSearching(true);
              addLog('tool', 'Recherche en cours...');
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = outputCtx.currentTime;
              setIsSearching(false);
              return;
            }

            const inText = message.serverContent?.inputTranscription?.text;
            const outText = message.serverContent?.outputTranscription?.text;
            
            if (inText) { inputAccumulatorRef.current += inText; }
            if (outText) { outputAccumulatorRef.current += outText; }

            if (message.serverContent?.turnComplete) {
              setIsSearching(false);
              const u = inputAccumulatorRef.current.trim();
              const m = outputAccumulatorRef.current.trim();
              if (u || m) {
                setHistory(prev => [
                  ...prev, 
                  ...(u ? [{ role: 'user' as const, text: u, timestamp: Date.now() }] : []),
                  ...(m ? [{ role: 'model' as const, text: m, timestamp: Date.now() }] : [])
                ]);
                appendSummary(u, m);
              }
              inputAccumulatorRef.current = ''; outputAccumulatorRef.current = '';
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputCtx) {
              const buf = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const node = outputCtx.createBufferSource();
              node.buffer = buf; 
              node.connect(outputCtx.destination);
              const start = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              node.start(start); 
              nextStartTimeRef.current = start + buf.duration;
              node.onended = () => sourcesRef.current.delete(node);
              sourcesRef.current.add(node);
            }
          },
          onerror: (e) => { 
            console.error('Erreur session:', e);
            addLog('error', 'Erreur: ' + (e?.message || JSON.stringify(e))); 
            stopAudio('Echec de connexion'); 
          },
          onclose: (event) => {
            console.log('Session fermée, event:', event);
            // Ne rien faire si on est en train de se déconnecter manuellement
            if (!isDisconnectingRef.current) {
              addLog('error', 'Fermeture inattendue');
              stopAudio('Session terminée par le serveur');
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName } }
          },
          systemInstruction: fullInstruction,
          tools: [{ googleSearch: {} }]
        }
      });
      sessionPromiseRef.current = sessionPromise;
      
      // Stocker la session résolue
      sessionPromise.then(session => {
        sessionRef.current = session;
      }).catch(err => {
        console.error('Erreur session:', err);
        stopAudio('Échec initialisation');
      });
    } catch (err: any) { 
      setIsConnecting(false); 
      let msg = 'Erreur Microphone';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
         msg = 'Accès micro refusé. Vérifiez vos paramètres.';
      } else if (err.name === 'NotFoundError') {
         msg = 'Aucun microphone détecté.';
      }
      addLog('error', `${msg} (${err?.message || 'Inconnue'})`);
      stopAudio(msg); 
    }
  }, [isConnected, isConnecting, stopAudio, voiceName, addLog]);

  const importHistory = useCallback((text: string) => {
    const lines = text.split('\n');
    const newHistory: ChatMessage[] = [];
    lines.forEach(line => {
      if (line.includes('[AUTEUR] : ')) {
        newHistory.push({ role: 'user', text: line.split('[AUTEUR] : ')[1].trim(), timestamp: Date.now() });
      } else if (line.includes('[EXPERT] : ')) {
        newHistory.push({ role: 'model', text: line.split('[EXPERT] : ')[1].trim(), timestamp: Date.now() });
      }
    });
    if (newHistory.length > 0) {
      setHistory(newHistory);
      addLog('success', 'Dossier importé.');
    }
  }, [addLog]);

  return { isConnected, isConnecting, isMuted, setIsMuted, error, connect, disconnect: () => stopAudio('Arrêt'), testMicrophone, resetMicrophone, volume, history, summaryText, setMemoryScope, appendSummaryText, clearHistory: () => { setHistory([]); localStorage.removeItem(getHistoryKey(memoryScope)); writeAbsoluteMemory(memoryScope, [], summaryRef.current); }, clearSummary: () => { setSummaryText(''); localStorage.removeItem(getSummaryKey(memoryScope)); localStorage.removeItem(getSummaryBackupKey(memoryScope)); writeAbsoluteMemory(memoryScope, historyRef.current, ''); }, importHistory, currentInput, currentOutput, voiceName, setVoiceName, logs, clearLogs: () => setLogs([]), isSearching };
};
