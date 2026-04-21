import { describe, expect, it } from 'vitest';
import type { AgentReadinessConfig } from 'agent-ready-web';
import { handleAgentRoutes } from '../src/index.js';

const baseConfig: AgentReadinessConfig = {
  siteUrl: 'https://x.test',
  contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
  aiCrawlers: { GPTBot: 'allow' },
  userAgents: [{ name: '*', allow: ['/'] }],
  sitemap: { urls: async () => [{ url: 'https://x.test/' }] },
  linkHeaders: {},
};

function req(path: string): Request {
  return new Request(new URL(path, 'https://x.test').toString());
}

describe('handleAgentRoutes', () => {
  it('serves /robots.txt with text/plain', async () => {
    const res = await handleAgentRoutes(req('/robots.txt'), baseConfig);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(200);
    expect(res!.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(await res!.text()).toMatch(/^# Content-Signals:/m);
  });

  it('serves /sitemap.xml with application/xml', async () => {
    const res = await handleAgentRoutes(req('/sitemap.xml'), baseConfig);
    expect(res!.status).toBe(200);
    expect(res!.headers.get('content-type')).toBe('application/xml; charset=utf-8');
    expect(await res!.text()).toContain('<urlset');
  });

  it('serves /.well-known/api-catalog when apiCatalog defined', async () => {
    const res = await handleAgentRoutes(req('/.well-known/api-catalog'), {
      ...baseConfig,
      apiCatalog: { linkset: [{ anchor: 'https://x.test/api' }] },
    });
    expect(res!.status).toBe(200);
    expect(res!.headers.get('content-type')).toBe('application/linkset+json');
  });

  it('returns null for /.well-known/api-catalog when apiCatalog undefined', async () => {
    const res = await handleAgentRoutes(req('/.well-known/api-catalog'), baseConfig);
    expect(res).toBeNull();
  });

  it('serves /.well-known/agent-skills/index.json when agentSkills defined', async () => {
    const res = await handleAgentRoutes(req('/.well-known/agent-skills/index.json'), {
      ...baseConfig,
      agentSkills: [{ id: 'a', name: 'A', description: 'd', manifest: {} }],
    });
    expect(res!.status).toBe(200);
    const body = (await res!.json()) as { skills: { digest: string }[] };
    expect(body.skills[0]!.digest).toMatch(/^sha256-[a-f0-9]{64}$/);
  });

  it('returns null for any other path', async () => {
    expect(await handleAgentRoutes(req('/'), baseConfig)).toBeNull();
    expect(await handleAgentRoutes(req('/api/whatever'), baseConfig)).toBeNull();
    expect(await handleAgentRoutes(req('/sitemap-images.xml'), baseConfig)).toBeNull();
  });

  it('does NOT proxy or augment non-agent-readiness paths', async () => {
    const res = await handleAgentRoutes(req('/download/foo.dmg'), baseConfig);
    expect(res).toBeNull();
  });
});
