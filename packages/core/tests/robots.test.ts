import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { robotsTxt } from '../src/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(here, 'fixtures/robots-apex.txt'), 'utf8').trim();

describe('robotsTxt', () => {
  it('emits canonical apex fixture', () => {
    const out = robotsTxt({
      siteUrl: 'https://apexsofteng.com',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: { GPTBot: 'allow', 'anthropic-ai': 'disallow' },
      userAgents: [{ name: '*', allow: ['/'], disallow: ['/api/', '/admin'] }],
    });
    expect(out.trim()).toBe(fixture);
  });

  it('always emits Content-Signals comment header first', () => {
    const out = robotsTxt({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'no', search: 'yes', 'ai-input': 'no' },
      aiCrawlers: {},
      userAgents: [{ name: '*', allow: ['/'] }],
    });
    expect(out.startsWith('# Content-Signals: ai-train=no, search=yes, ai-input=no')).toBe(true);
  });

  it('Sitemap: line uses absolute URL derived from siteUrl', () => {
    const out = robotsTxt({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: {},
      userAgents: [{ name: '*', allow: ['/'] }],
    });
    expect(out).toMatch(/^Sitemap: https:\/\/x\.test\/sitemap\.xml$/m);
  });
});
