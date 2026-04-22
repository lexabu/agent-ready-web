import { spawn, type ChildProcess } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const PORT = 3101;
const BASE = `http://localhost:${PORT}`;
let server: ChildProcess;

async function waitFor(url: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // keep trying
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

beforeAll(async () => {
  server = spawn('pnpm', ['exec', 'next', 'start', '--port', String(PORT)], {
    stdio: 'pipe',
    env: { ...process.env, PORT: String(PORT), SITE_URL: BASE },
    cwd: new URL('../', import.meta.url).pathname,
  });
  await waitFor(`${BASE}/`);
}, 60000);

afterAll(() => {
  server.kill('SIGTERM');
});

describe('nextjs example e2e', () => {
  it('/robots.txt passes RFC 9309 basic shape + Content-Signal directive', async () => {
    const res = await fetch(`${BASE}/robots.txt`);
    expect(res.headers.get('content-type')).toMatch(/^text\/plain/);
    const body = await res.text();
    expect(body).toMatch(/^Content-Signal: ai-train=yes, search=yes, ai-input=yes$/m);
    expect(body).toMatch(/^User-agent: \*/m);
    expect(body).toMatch(/^Sitemap: /m);
  });

  it('/sitemap.xml returns urlset XML', async () => {
    const res = await fetch(`${BASE}/sitemap.xml`);
    const body = await res.text();
    expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(body).toMatch(new RegExp(`<loc>${BASE}/</loc>`));
  });

  it('/.well-known/api-catalog returns RFC 9727 linkset', async () => {
    const res = await fetch(`${BASE}/.well-known/api-catalog`);
    expect(res.headers.get('content-type')).toBe('application/linkset+json');
    const body = (await res.json()) as { linkset: { anchor: string }[] };
    expect(body.linkset[0]!.anchor).toMatch(/^http/);
  });

  it('/.well-known/agent-skills/index.json returns index with valid sha256 digests', async () => {
    const res = await fetch(`${BASE}/.well-known/agent-skills/index.json`);
    const body = (await res.json()) as { skills: { digest: string }[] };
    expect(body.skills[0]!.digest).toMatch(/^sha256-[a-f0-9]{64}$/);
  });

  it('/ returns 200 with Link: header containing api-catalog and sitemap refs', async () => {
    const res = await fetch(`${BASE}/`);
    const link = res.headers.get('link') ?? '';
    expect(link).toContain('rel="api-catalog"');
    expect(link).toContain('rel="sitemap"');
  });
});
