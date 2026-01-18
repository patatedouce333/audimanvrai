/**
 * Configuration Production Gemini 3
 * Janvier 2026
 */

export const GEMINI3_CONFIG = {
  // Model selection
  model: 'gemini-3-flash-native-audio' as const,

  // Live API settings
  liveAPI: {
    responseModalities: ['AUDIO'],

    speechConfig: {
      voice: 'Puck',  // Options: Charon, Kore, Fenrir, Zephyr, Puck
    },
  },

  // Audio settings
  audio: {
    sampleRate: 16000,           // Hz
    channelCount: 1,             // Mono
    bitDepth: 16,                // PCM-16
    encodingFormat: 'PCM_S16BE', // Big-endian
  },

  // Performance tuning
  performance: {
    chunkSize: 4096,             // Bytes per chunk
    flushInterval: 100,          // ms
    maxConcurrentSessions: 10,
  },

  // Features
  features: {
    affectiveDialog: true,       // ← NEW: Emotion-aware
    multilingualAuto: true,      // ← NEW: Auto language switching
    barge_in: true,              // User interruption
    transcription: true,          // STT
    memoryRetention: true,       // Multi-turn context
    googleSearch: true,          // Web grounding
  },

  // Retry logic
  retry: {
    maxAttempts: 3,
    backoffMs: 1000,
  },

  // Monitoring
  monitoring: {
    logLatency: true,
    logErrors: true,
    logTranscriptions: false,    // Privacy
  },
};

export type Gemini3Config = typeof GEMINI3_CONFIG;