import { describe, it, expect } from 'vitest';
import { buildTxtContent } from '../services/extremeSaving';

describe('ExtremeSaving buildTxtContent', () => {
  it('builds standardized TXT with metadata', () => {
    const txt = buildTxtContent('medical', 'Bonjour', 'Réponse', { session: 'demo' });
    expect(txt).toContain('agentId: medical');
    expect(txt).toContain('session: demo');
    expect(txt).toContain('U: Bonjour');
    expect(txt).toContain('A: Réponse');
  });
});
