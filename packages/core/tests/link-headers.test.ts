import { describe, expect, it } from 'vitest';
import { linkHeaders } from '../src/index.js';

describe('linkHeaders', () => {
  const getHeaders = linkHeaders({
    '/': [
      { href: '/.well-known/api-catalog', rel: 'api-catalog' },
      { href: '/sitemap.xml', rel: 'sitemap' },
    ],
    '/docs': [{ href: '/docs.md', rel: 'alternate', type: 'text/markdown' }],
  });

  it('returns Headers with Link: per RFC 8288 for matched pathname', () => {
    const headers = getHeaders('/');
    const link = headers.get('link');
    expect(link).toBe(
      '</.well-known/api-catalog>; rel="api-catalog", </sitemap.xml>; rel="sitemap"',
    );
  });

  it('includes type parameter when provided', () => {
    const headers = getHeaders('/docs');
    expect(headers.get('link')).toBe('</docs.md>; rel="alternate"; type="text/markdown"');
  });

  it('returns empty Headers for unmatched pathname', () => {
    const headers = getHeaders('/nope');
    expect(headers.get('link')).toBeNull();
  });
});
