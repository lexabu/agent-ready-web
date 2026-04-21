import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { sitemap } from '../src/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/sitemap-two-urls.xml'), 'utf8').trim();

describe('sitemap', () => {
  it('emits canonical two-url fixture', () => {
    const out = sitemap([
      {
        url: 'https://example.com/',
        lastModified: '2026-04-21',
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      { url: 'https://example.com/about' },
    ]);
    expect(out.trim()).toBe(fixture);
  });

  it('escapes special XML chars in URLs', () => {
    const out = sitemap([{ url: 'https://x.test/q?a=1&b=2' }]);
    expect(out).toContain('<loc>https://x.test/q?a=1&amp;b=2</loc>');
  });

  it('accepts Date objects for lastModified and serializes as YYYY-MM-DD', () => {
    const out = sitemap([
      { url: 'https://x.test/', lastModified: new Date('2026-04-21T00:00:00Z') },
    ]);
    expect(out).toContain('<lastmod>2026-04-21</lastmod>');
  });
});
