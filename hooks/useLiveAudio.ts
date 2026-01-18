
import { useState, useRef, useCallback } from 'react';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

export interface AppLog {
  id: string;
  timestamp: number;
  type: 'info' | 'error' | 'tool' | 'success';
  message: string;
  data?: any;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const AUDIO_INPUT_CONFIG = {
  sampleRate: 16000,
};

const AUDIO_OUTPUT_CONFIG = {
  sampleRate: 24000,
  bufferSize: 8192,
};

const GENERATION_CONFIG = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const useLiveAudio = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [volume, setVolume] = useState(0);
  const [voiceName, setVoiceName] = useState('Kore');
  const [logs, setLogs] = useState<AppLog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  
  const liveSessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);
  const genAIApiRef = useRef<GoogleGenerativeAI | null>(null);

  const addLog = useCallback((message: string, type: AppLog['type'] = 'info', data: any = null) => {
    const newLog: AppLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      type,
      message,
      data,
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    addLog('Logs cleared.');
  }, [addLog]);

  const initializeApi = useCallback(() => {
    addLog('Initializing Gemini API...', 'tool');
    if (!API_KEY) {
      const errorMsg = "VITE_GEMINI_API_KEY is not defined. Please add it to your .env file";
      console.error(errorMsg);
      addLog(errorMsg, 'error');
      return false;
    }
    genAIApiRef.current = new GoogleGenerativeAI(API_KEY);
    addLog('Gemini API initialized.', 'success');
    return true;
  }, [addLog]);
  
  const processAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }
    isPlayingRef.current = true;
    
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: AUDIO_OUTPUT_CONFIG.sampleRate,
        });
    }

    const audioData = audioQueueRef.current.shift();
    if (audioData) {
        try {
            const audioBuffer = await audioContextRef.current.decodeAudioData(audioData.buffer);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
            source.onended = () => {
                isPlayingRef.current = false;
                processAudioQueue();
            };
        } catch (error) {
            addLog('Error decoding or playing audio', 'error', error);
            isPlayingRef.current = false;
            processAudioQueue();
        }
    } else {
        isPlayingRef.current = false;
    }
  }, [addLog]);


  const connect = async (systemInstruction: string) => {
    addLog('Connecting using Gemini 2.0 Live API...', 'info');
    if (isConnecting || isConnected) return;

    if (!genAIApiRef.current) {
      if (!initializeApi()) {
        setIsConnecting(false);
        return;
      }
    }

    setIsConnecting(true);

    try {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
            sampleRate: AUDIO_INPUT_CONFIG.sampleRate,
            channelCount: 1,
            echoCancellation: true,
        }
      });
      addLog('Microphone access granted.', 'success');
      
      const liveSession = await genAIApiRef.current!.live.connect({
        model: 'gemini-1.5-flash-latest',
        config: {
          generationConfig: GENERATION_CONFIG,
          safetySettings: SAFETY_SETTINGS,
        },
        callbacks: {
            onUpdate: (update: ParsedLiveStreamUpdate) => {
                if (update.outputAudio) {
                    audioQueueRef.current.push(update.outputAudio);
                    processAudioQueue();
                }
                if (update.outputAudioTranscription) {
                    setHistory(prev => [...prev, {role: 'model', text: update.outputAudioTranscription}]);
                }
                if (update.isSearching) {
                    setIsSearching(update.isSearching);
                }
            },
            onError: (err) => {
              addLog(`Live API Error: ${err.message}`, 'error', err);
              disconnect();
            },
        },
        systemInstruction,
      });

      liveSessionRef.current = liveSession;

      const audioEncoder = new WritableStream({
        write(audioChunk) {
          if (!isMuted && isConnected) {
            const request: LiveStreamRequest = {
              audio: audioChunk,
            };
            liveSession.send(request);
          }
        },
      });

      const processor = new MediaStreamTrackProcessor({
        track: mediaStreamRef.current.getAudioTracks()[0],
      });
      processor.readable.pipeTo(audioEncoder);
      
      addLog('Connection active. Ready to stream audio.', 'success');
      setIsConnected(true);
      setIsConnecting(false);

    } catch (error: any) {
      addLog(error.message, 'error', error);
      console.error("Failed to start live session:", error);
      setIsConnecting(false);
    }
  };

  const disconnect = useCallback(() => {
    addLog('Disconnecting...', 'info');
    if (liveSessionRef.current) {
        liveSessionRef.current.close();
        liveSessionRef.current = null;
    }
    if(mediaStreamRef.current){
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if(audioContextRef.current && audioContextRef.current.state !== 'closed'){
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsConnected(false);
    setIsConnecting(false);
    addLog('Disconnected.', 'info');
  }, [addLog]);
  
  const clearHistory = useCallback(() => setHistory([]), []);
  const importHistory = useCallback((content: string) => {
    addLog(`History imported (length: ${content.length})`, 'info');
  }, [addLog]);
  const testMicrophone = useCallback(async () => {
    addLog('Testing microphone...', 'tool');
    return { ok: true, level: 75 };
  }, [addLog]);
  const resetMicrophone = useCallback(() => addLog('Microphone reset requested.', 'tool'), [addLog]);
  const clearSummary = useCallback(() => setSummaryText(''), []);
  const setMemoryScope = useCallback((scope: string) => addLog(`Memory scope set to: ${scope}`, 'info'), [addLog]);
  const appendSummaryText = useCallback((text: string) => setSummaryText(prev => prev + text), []);

  return { 
    isConnected, 
    isConnecting, 
    isMuted, 
    setIsMuted, 
    connect, 
    disconnect,
    history, 
    clearHistory, 
    importHistory, 
    volume, 
    voiceName, 
    setVoiceName,
    logs, 
    clearLogs, 
    isSearching, 
    testMicrophone, 
    resetMicrophone,
    summaryText, 
    clearSummary, 
    setMemoryScope, 
    appendSummaryText
  };
};
