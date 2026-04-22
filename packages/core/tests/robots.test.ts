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

  it('emits Content-Signal directive inside the User-agent: * stanza', () => {
    const out = robotsTxt({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'no', search: 'yes', 'ai-input': 'no' },
      aiCrawlers: {},
      userAgents: [{ name: '*', allow: ['/'] }],
    });
    // Per draft-romm-aipref-contentsignals: directive (no `#`), singular name,
    // immediately after the User-agent: line of the group it applies to.
    expect(out).toMatch(
      /^User-agent: \*\nContent-Signal: ai-train=no, search=yes, ai-input=no$/m,
    );
    expect(out).not.toMatch(/^# Content-Signals:/m);
  });

  it('does not emit Content-Signal inside non-* stanzas (signals inherit from *)', () => {
    const out = robotsTxt({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'no', search: 'yes', 'ai-input': 'no' },
      aiCrawlers: { GPTBot: 'disallow' },
      userAgents: [{ name: '*', allow: ['/'] }],
    });
    expect(out).toMatch(/^User-agent: GPTBot\nDisallow: \/$/m);
    // Only one Content-Signal line total.
    expect(out.match(/Content-Signal:/g)?.length).toBe(1);
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
