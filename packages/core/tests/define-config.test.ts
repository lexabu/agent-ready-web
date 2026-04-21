import { describe, expect, it } from 'vitest';
import { defineAgentReadiness } from '../src/index.js';

describe('defineAgentReadiness', () => {
  it('returns the config object unchanged (identity)', () => {
    const config = defineAgentReadiness({
      siteUrl: 'https://example.com',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: { GPTBot: 'allow' },
      userAgents: [{ name: '*', allow: ['/'], disallow: ['/api/'] }],
      sitemap: { urls: async () => [{ url: 'https://example.com/' }] },
      linkHeaders: {},
    });
    expect(config.siteUrl).toBe('https://example.com');
    expect(config.aiCrawlers.GPTBot).toBe('allow');
  });
});
