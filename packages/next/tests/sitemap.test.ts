import { describe, expect, it } from 'vitest';
import { createSitemap } from '../src/index.js';

describe('createSitemap', () => {
  it('returns async function yielding MetadataRoute.Sitemap shape', async () => {
    const sitemap = createSitemap({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: {},
      userAgents: [],
      sitemap: {
        urls: async () => [
          {
            url: 'https://x.test/',
            lastModified: new Date('2026-04-21'),
            changeFrequency: 'weekly',
            priority: 1.0,
          },
        ],
      },
      linkHeaders: {},
    });
    const out = await sitemap();
    expect(out).toHaveLength(1);
    expect(out[0]!.url).toBe('https://x.test/');
    expect(out[0]!.priority).toBe(1.0);
  });
});
