import { describe, expect, it } from 'vitest';
import { createAgentSkillsRoute } from '../src/index.js';

describe('createAgentSkillsRoute', () => {
  it('returns GET handler emitting application/json with sha256 digests', async () => {
    const GET = createAgentSkillsRoute({
      siteUrl: 'https://x.test',
      contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
      aiCrawlers: {},
      userAgents: [],
      sitemap: { urls: async () => [] },
      linkHeaders: {},
      agentSkills: [
        { id: 'contact', name: 'Contact', description: 'Send a message', manifest: {} },
      ],
    });
    const res = await GET();
    expect(res.headers.get('content-type')).toBe('application/json');
    const body = (await res.json()) as { skills: { digest: string }[] };
    expect(body.skills[0]!.digest).toMatch(/^sha256-[a-f0-9]{64}$/);
  });

  it('throws when agentSkills is undefined', () => {
    expect(() =>
      createAgentSkillsRoute({
        siteUrl: 'https://x.test',
        contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
        aiCrawlers: {},
        userAgents: [],
        sitemap: { urls: async () => [] },
        linkHeaders: {},
      }),
    ).toThrowError(/agentSkills/);
  });
});
