import { describe, expect, it } from 'vitest';
import { createApiCatalogRoute } from '../src/index.js';

describe('createApiCatalogRoute', () => {
  it('returns GET handler emitting application/linkset+json', async () => {
    const GET = createApiCatalogRoute({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: {},
      userAgents: [],
      sitemap: { urls: async () => [] },
      linkHeaders: {},
      apiCatalog: {
        linkset: [
          {
            anchor: 'https://x.test/api/contact',
            'service-desc': [{ href: '/api/openapi.json' }],
          },
        ],
      },
    });
    const res = await GET();
    expect(res.headers.get('content-type')).toBe('application/linkset+json');
    const body = (await res.json()) as { linkset: unknown[] };
    expect(body.linkset).toHaveLength(1);
  });

  it('throws when called on a config without apiCatalog defined', () => {
    expect(() =>
      createApiCatalogRoute({
        siteUrl: 'https://x.test',
        contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
        aiCrawlers: {},
        userAgents: [],
        sitemap: { urls: async () => [] },
        linkHeaders: {},
      }),
    ).toThrowError(/apiCatalog/);
  });
});
