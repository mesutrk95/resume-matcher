import { describe, it, expect } from 'vitest';

describe('Environment Variables', () => {
  it('should load GEMINI_API_KEY from .env file', () => {
    expect(process.env.GEMINI_API_KEY).toBeDefined();
    expect(process.env.GEMINI_API_KEY).not.toBe('');
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
  });
});
