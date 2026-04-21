import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { unstable_dev, type Unstable_DevWorker } from 'wrangler';

let worker: Unstable_DevWorker;

const WORKER_ENTRY = fileURLToPath(new URL('../src/index.ts', import.meta.url));

beforeAll(async () => {
  worker = await unstable_dev(WORKER_ENTRY, {
    experimental: { disableExperimentalWarning: true },
    logLevel: 'error',
  });
}, 60000);

afterAll(async () => {
  await worker.stop();
});

describe('cloudflare-worker example', () => {
  it('serves /robots.txt', async () => {
    const res = await worker.fetch('/robots.txt');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/^text\/plain/);
  });

  it('serves /sitemap.xml', async () => {
    const res = await worker.fetch('/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/application\/xml/);
  });

  it('serves /.well-known/api-catalog', async () => {
    const res = await worker.fetch('/.well-known/api-catalog');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/linkset+json');
  });

  it('serves /.well-known/agent-skills/index.json', async () => {
    const res = await worker.fetch('/.well-known/agent-skills/index.json');
    expect(res.status).toBe(200);
  });

  it('returns 404 for unmatched paths (handleAgentRoutes returned null)', async () => {
    const res = await worker.fetch('/some/other/path');
    expect(res.status).toBe(404);
  });
});
