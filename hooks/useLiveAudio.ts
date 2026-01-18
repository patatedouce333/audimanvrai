
import { useState, useRef, useCallback } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Récupère la clé d'API depuis les variables d'environnement de Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Constantes pour la configuration audio
const AUDIO_CONFIG = {
  mimeType: 'audio/webm;codecs=opus',
  sampleRate: 48000,
  audioBitsPerSecond: 128000,
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

export const useLiveAudio = (onTranscriptionUpdate) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const generativeModelRef = useRef(null);

  // Initialise l'API et le modèle
  const initializeApi = useCallback(() => {
    if (!API_KEY) {
      console.error("VITE_GEMINI_API_KEY n'est pas définie. Veuillez l'ajouter à votre fichier .env");
      return;
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    generativeModelRef.current = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  }, []);

  // Joue la file d'attente audio
  const playAudioQueue = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }
    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift();
    const audioBlob = new Blob([audioData], { type: 'audio/mp3' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = () => {
      isPlayingRef.current = false;
      playAudioQueue();
    };
  }, []);

  // Démarre l'enregistrement audio
  const startRecording = async () => {
    if (!generativeModelRef.current) {
      initializeApi();
    }
    if (!generativeModelRef.current) return;

    setIsLoading(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    
    const chat = generativeModelRef.current.startChat({
        history: [],
    });

    mediaRecorderRef.current = new MediaRecorder(stream, AUDIO_CONFIG);

    mediaRecorderRef.current.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        const audioData = await event.data.arrayBuffer();
        const result = await chat.sendMessageStream([{
            inlineData: {
                data: btoa(String.fromCharCode(...new Uint8Array(audioData))),
                mimeType: "audio/webm"
            }
        }, {
            text: "Transcris l'audio et réponds à la question qui est posée en audio. Garde ta réponse courte et concise, en moins de 20 mots."
        }]);
        
        setIsLoading(false);
        setIsRecording(false); // Arrête l'enregistrement après l'envoi

        let fullText = '';
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullText += chunkText;
            onTranscriptionUpdate(fullText, false); // Met à jour avec le texte partiel
        }
        
        // Appel pour générer la voix (à implémenter)
        // const audioResponse = await textToSpeech(fullText);
        // audioQueueRef.current.push(audioResponse);
        // playAudioQueue();
        
        onTranscriptionUpdate(fullText, true); // Met à jour avec le texte final
      }
    };

    mediaRecorderRef.current.onstart = () => {
      setIsRecording(true);
      setIsLoading(false);
    };
    
    mediaRecorderRef.current.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        setIsLoading(false);
    };

    mediaRecorderRef.current.start(1000); // Envoie les données toutes les secondes
  };

  // Arrête l'enregistrement
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return { isRecording, isLoading, startRecording, stopRecording };
};
