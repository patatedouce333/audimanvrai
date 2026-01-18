/**
 * Configuration Gemini 3 - Live Audio
 * Dernière mise à jour: 2026-01-18
 *
 * Migration guide: 2.5 → 3
 * - Performances: +25% accuracy, -30ms latency
 * - API compatible: Aucun breaking change
 */

export const GEMINI_MODELS = {
  // ⭐ PRODUCTION: Gemini 3 Flash Native Audio
  FLASH_3_NATIVE: 'gemini-3-flash-native-audio',

  // Premium: Gemini 3 Pro (coming weeks)
  PRO_3_NATIVE: 'gemini-3-pro-native-audio',  // Preview

  // Legacy (à supprimer après validation)
  FLASH_25_NATIVE: 'gemini-2.5-flash-native-audio-preview-12-2025',
} as const;

export const CURRENT_MODEL = GEMINI_MODELS.FLASH_3_NATIVE;

export const MODEL_SPECS = {
  [GEMINI_MODELS.FLASH_3_NATIVE]: {
    displayName: 'Gemini 3 Flash Native Audio',
    latency: '~150ms',
    supportsLiveAudio: true,
    supportsTranscription: true,
    supportsBarge_in: true,
    supportsMultilingual: true,
    maxContextTokens: 1_048_576,
    deprecated: false,
    shutdownDate: null,
    changelog: {
      affectiveDialog: 'Emotion-aware voice responses',
      robustInstructions: '90% instruction adherence',
      smoothConversation: 'Better multi-turn context retention',
      liveTranslation: '70+ languages, real-time',
    },
  },

  [GEMINI_MODELS.PRO_3_NATIVE]: {
    displayName: 'Gemini 3 Pro Native Audio (Preview)',
    latency: '~180ms',
    supportsLiveAudio: true,
    supportsDeepThink: true,
    contextWindow: '2M tokens',
    deprecated: false,
    inPreview: true,
  },

  [GEMINI_MODELS.FLASH_25_NATIVE]: {
    displayName: 'Gemini 2.5 Flash Native Audio (Legacy)',
    deprecated: true,
    shutdownDate: 'TBD',
    migrationPath: GEMINI_MODELS.FLASH_3_NATIVE,
  },
} as const;

// Export pour utilisation
export type ModelKey = keyof typeof GEMINI_MODELS;
export type ModelConfig = typeof MODEL_SPECS[GEMINI_MODELS.FLASH_3_NATIVE];