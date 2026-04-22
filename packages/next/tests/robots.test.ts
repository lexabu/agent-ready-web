import { describe, expect, it } from 'vitest';
import { createRobots, createRobotsRoute } from '../src/index.js';

describe('createRobots', () => {
  it('returns a function that produces a Next MetadataRoute.Robots shape', () => {
    const robots = createRobots({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: { GPTBot: 'allow' },
      userAgents: [{ name: '*', allow: ['/'], disallow: ['/api/'] }],
      sitemap: { urls: async () => [] },
      linkHeaders: {},
    });
    const result = robots();
    expect(result.rules).toBeDefined();
    expect(result.sitemap).toBe('https://x.test/sitemap.xml');
    expect(result.host).toBe('https://x.test');
    const star = (result.rules as Array<{ userAgent: string | string[] }>).find(
      (r) => r.userAgent === '*',
    );
    expect(star).toBeDefined();
  });
});

describe('createRobotsRoute', () => {
  it('returns GET handler emitting text/plain robots.txt with Content-Signal directive', async () => {
    const GET = createRobotsRoute({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: {},
      userAgents: [{ name: '*', allow: ['/'] }],
      sitemap: { urls: async () => [] },
      linkHeaders: {},
    });
    const res = await GET();
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    const body = await res.text();
    expect(body).toMatch(/^Content-Signal: ai-train=yes, search=yes, ai-input=yes$/m);
    expect(body).not.toMatch(/^# Content-Signals:/m);
    expect(body).toMatch(/^Sitemap: https:\/\/x\.test\/sitemap\.xml$/m);
  });
});
