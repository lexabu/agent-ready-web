import { describe, expect, it } from 'vitest';
import type { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { createMiddleware } from '../src/index.js';

describe('createMiddleware', () => {
  it('adds Link header for matching path', async () => {
    const mw = createMiddleware({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: {},
      userAgents: [],
      sitemap: { urls: async () => [] },
      linkHeaders: { '/': [{ href: '/sitemap.xml', rel: 'sitemap' }] },
    });
    const req = new NextRequest(new URL('https://x.test/'));
    const res = (await mw(req, {} as never)) as NextResponse;
    expect(res.headers.get('link')).toBe('</sitemap.xml>; rel="sitemap"');
  });

  it('leaves Link header absent for unmatched path', async () => {
    const mw = createMiddleware({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: {},
      userAgents: [],
      sitemap: { urls: async () => [] },
      linkHeaders: { '/': [{ href: '/sitemap.xml', rel: 'sitemap' }] },
    });
    const req = new NextRequest(new URL('https://x.test/nope'));
    const res = (await mw(req, {} as never)) as NextResponse;
    expect(res.headers.get('link')).toBeNull();
  });

  it('throws clear "Not implemented" when markdownNegotiation is enabled', () => {
    expect(() =>
      createMiddleware({
        siteUrl: 'https://x.test',
        contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
        aiCrawlers: {},
        userAgents: [],
        sitemap: { urls: async () => [] },
        linkHeaders: {},
        markdownNegotiation: { enabled: true },
      }),
    ).toThrowError(/markdown negotiation is not implemented/i);
  });
});
