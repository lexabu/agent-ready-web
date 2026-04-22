# agent-ready-web

Agent readiness primitives for Next.js and Cloudflare Workers. Generates spec-compliant `robots.txt`, `sitemap.xml`, `Link:` headers (RFC 8288), `.well-known/api-catalog` (RFC 9727), and `.well-known/agent-skills/index.json` from a single config file.

One config, three packages:

```
┌──────────────────────────────┐    ┌────────────────────────┐
│  agent-readiness.config.ts   │───▶│  agent-ready-web       │ pure generators
└──────────────┬───────────────┘    └────────────────────────┘
               │                         ▲
               ├────────────────────────▶│  @agent-ready-web/next        Next.js App Router
               │                         │
               └────────────────────────▶│  @agent-ready-web/cloudflare  Workers handler
```

## Why

Cloudflare's Agent Readiness Score checker at [isitagentready.com](https://isitagentready.com) validates a 15-item checklist across Discoverability, Content, Bot Access Control, API/Auth/MCP discovery, and Commerce. As AI agents become a significant traffic source — Cloudflare reports AI-referred traffic up 7x since January 2025 and AI-attributed orders up 11x — agent legibility has become foundational web infrastructure alongside SEO.

This package covers the **Foundation + Discovery** subset (items 1, 2, 3, 5, 6, 7, 11). Item 4 (markdown content negotiation) is deferred to v0.2 — see [§ Markdown negotiation](#markdown-negotiation-deferred-to-v02). Items 8–10 and 12–15 are out of scope until use cases emerge.

## Install

Pick the adapter for your framework:

```bash
# Next.js App Router site
pnpm add agent-ready-web @agent-ready-web/next

# Cloudflare Worker
pnpm add agent-ready-web @agent-ready-web/cloudflare
```

Both adapters pull `agent-ready-web` transitively; it's listed above so the config file can `import { defineAgentReadiness } from 'agent-ready-web'` directly.

## Quickstart: Next.js

One config file, five one-liners.

```ts
// src/agent-readiness.config.ts
import { defineAgentReadiness } from 'agent-ready-web';

export default defineAgentReadiness({
  siteUrl: 'https://example.com',
  contentSignals: { 'ai-train': 'yes', search: 'yes', 'ai-input': 'yes' },
  aiCrawlers: {
    GPTBot: 'allow',
    'OAI-SearchBot': 'allow',
    'Claude-Web': 'allow',
    'anthropic-ai': 'allow',
    'Google-Extended': 'allow',
    PerplexityBot: 'allow',
    CCBot: 'allow',
  },
  userAgents: [{ name: '*', allow: ['/'], disallow: ['/api/', '/admin'] }],
  sitemap: {
    urls: async () => [
      {
        url: 'https://example.com/',
        lastModified: '2026-04-21',
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      { url: 'https://example.com/about' },
    ],
  },
  linkHeaders: {
    '/': [
      { href: '/.well-known/api-catalog', rel: 'api-catalog' },
      { href: '/sitemap.xml', rel: 'sitemap' },
    ],
  },
  apiCatalog: {
    linkset: [
      {
        anchor: 'https://example.com/api/contact',
        'service-desc': [
          { href: '/api/openapi.json', type: 'application/openapi+json;version=3.1' },
        ],
      },
    ],
  },
  agentSkills: [
    {
      id: 'contact',
      name: 'Contact',
      description: 'Send a message',
      manifest: { endpoint: '/api/contact' },
    },
  ],
});
```

```ts
// src/app/robots.txt/route.ts
import { createRobotsRoute } from '@agent-ready-web/next';
import config from '@/agent-readiness.config';
export const dynamic = 'force-dynamic';
export const GET = createRobotsRoute(config);
```

```ts
// src/app/sitemap.ts
import { createSitemap } from '@agent-ready-web/next';
import config from '@/agent-readiness.config';
export const dynamic = 'force-dynamic';
export default createSitemap(config);
```

```ts
// src/middleware.ts
import { createMiddleware } from '@agent-ready-web/next';
import configModule from '@/agent-readiness.config';
export const middleware = createMiddleware(configModule);
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)).*)',
  ],
};
```

```ts
// src/app/.well-known/api-catalog/route.ts
import { createApiCatalogRoute } from '@agent-ready-web/next';
import config from '@/agent-readiness.config';
export const dynamic = 'force-dynamic';
export const GET = createApiCatalogRoute(config);
```

```ts
// src/app/.well-known/agent-skills/index.json/route.ts
import { createAgentSkillsRoute } from '@agent-ready-web/next';
import config from '@/agent-readiness.config';
export const GET = createAgentSkillsRoute(config);
```

`createRobots(config)` is also available if you want to use Next.js's built-in `MetadataRoute.Robots` export — but it **cannot emit the `Content-Signal:` directive** because Next's metadata shape has no field for it. Use `createRobotsRoute` when you want the full robots.txt including Content-Signal.

## Quickstart: Cloudflare Workers

```ts
// src/index.ts
import { handleAgentRoutes } from '@agent-ready-web/cloudflare';
import config from './agent-readiness.config.js';

export default {
  async fetch(request: Request): Promise<Response> {
    const handled = await handleAgentRoutes(request, config);
    if (handled) return handled;
    // ... your normal Worker logic, or:
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler;
```

`handleAgentRoutes` returns a `Response` for exactly four paths — `/robots.txt`, `/sitemap.xml`, `/.well-known/api-catalog` (only if `config.apiCatalog` is defined), and `/.well-known/agent-skills/index.json` (only if `config.agentSkills` is defined). For any other path it returns `null`, leaving the Worker's existing logic free to handle it. It never proxies, augments, or buffers responses on other paths.

## Full config reference

Every field of `AgentReadinessConfig`:

| Field                            | Type                                            | Purpose                                                                                                                                                                                                                     |
| -------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siteUrl`                        | `string`                                        | Absolute origin of the site, e.g. `'https://example.com'`. Used to build the `Sitemap:` line in robots.txt and any absolute URLs downstream.                                                                                |
| `contentSignals`                 | `{ 'ai-train', 'search', 'ai-input' }`          | Emitted as a `Content-Signal:` directive inside the `User-agent: *` stanza (per [draft-romm-aipref-contentsignals](https://datatracker.ietf.org/doc/draft-romm-aipref-contentsignals/)). Values are `'yes'` or `'no'`. See [contentsignals.org](https://contentsignals.org/).                                                                  |
| `aiCrawlers`                     | `Record<string, 'allow' \| 'disallow'>`         | Per-bot dispositions appended to `robots.txt` as `User-agent:` stanzas with `Allow: /` or `Disallow: /`. Common keys: `GPTBot`, `OAI-SearchBot`, `Claude-Web`, `anthropic-ai`, `Google-Extended`, `PerplexityBot`, `CCBot`. |
| `userAgents`                     | `UserAgentRule[]`                               | Human-equivalent `User-agent:` stanzas with `allow` and `disallow` path arrays (plus optional `crawlDelay`). Typically `[{ name: '*', allow: ['/'], disallow: ['/api/', '/admin'] }]`.                                      |
| `sitemap`                        | `{ urls: () => Promise<SitemapEntry[]> }`       | Async URL source for `/sitemap.xml`. Each entry has `url` plus optional `lastModified`, `changeFrequency`, `priority`.                                                                                                      |
| `linkHeaders`                    | `Record<pathname, LinkHeaderEntry[]>`           | Per-path `Link:` header directives per RFC 8288. Use to advertise `api-catalog`, `sitemap`, and other rel links from HTML responses. Applied by `createMiddleware`.                                                         |
| `apiCatalog` (optional)          | `{ linkset: ApiCatalogLinksetItem[] }`          | RFC 9727 linkset served at `/.well-known/api-catalog`. Each item has an `anchor` URL and arrays of `service-desc`, `service-doc`, `service-meta` links. Omit if the site has no public API.                                 |
| `agentSkills` (optional)         | `AgentSkill[]`                                  | Skills declared to agents. Each skill has `id`, `name`, `description`, `manifest` (arbitrary JSON). Served at `/.well-known/agent-skills/index.json` with auto-computed SHA-256 digests over canonical-JSON manifests.      |
| `markdownNegotiation` (optional) | `{ enabled: boolean, exclude?, maxBodyBytes? }` | **Not implemented in v0.1.** Setting `enabled: true` causes `createMiddleware` to throw `Not implemented`. See [Markdown negotiation](#markdown-negotiation-deferred-to-v02).                                               |

### Content-Signals classification

- `ai-train=yes` means "use my content for AI model training". Set `no` to opt out of training.
- `search=yes` means "allow search-style retrieval for citation and grounding". Most sites want `yes`.
- `ai-input=yes` means "allow use as input to user-facing AI features" (e.g., summaries in chat answers). Related to but distinct from training.

### AI crawler classification gotchas

- `Google-Extended` is Google's **training-only** opt-out token (Bard/Gemini), not a search crawler. Regular `Googlebot` handles Google Search and follows standard `User-agent: *` rules.
- `Claude-Web` is Anthropic's retrieval bot for Claude search/citation. `anthropic-ai` is Anthropic's **training** bot. On sites with `ai-train=no`, `Claude-Web` can still be allowed (search) while `anthropic-ai` is disallowed (training).
- `OAI-SearchBot` is OpenAI's search crawler. `GPTBot` is OpenAI's training bot.

## Per-RFC mapping

Which `isitagentready.com` check each function satisfies:

| isitagentready item              | Spec                                                                                                             | Function                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1. robots.txt present            | [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309)                                                               | `robotsTxt`, `createRobotsRoute`             |
| 2. sitemap.xml present           | [sitemaps.org 0.9](https://www.sitemaps.org/protocol.html)                                                       | `sitemap`, `createSitemap`                   |
| 3. Content-Signals in robots.txt | [contentsignals.org](https://contentsignals.org/)                                                                | `robotsTxt`, `createRobotsRoute`             |
| 4. Markdown negotiation          | [Cloudflare: Markdown for Agents](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/) | **v0.2**                                     |
| 5. Link headers                  | [RFC 8288](https://www.rfc-editor.org/rfc/rfc8288)                                                               | `linkHeaders`, `createMiddleware`            |
| 6. Agent Skills Discovery        | [Cloudflare RFC](https://github.com/cloudflare/agent-skills-discovery-rfc)                                       | `agentSkillsIndex`, `createAgentSkillsRoute` |
| 7. API Catalog                   | [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727)                                                               | `apiCatalog`, `createApiCatalogRoute`        |

## Markdown negotiation (deferred to v0.2)

Markdown negotiation requires a post-render response-transformation point that Next.js/Vercel Edge middleware does not provide — middleware runs before rendering and cannot inspect or rewrite the rendered HTML body. The contract below will be implemented in v0.2 via a Cloudflare Worker front layer helper (`@agent-ready-web/cloudflare/markdown-negotiate`).

When v0.2 ships, the adapter will transform HTML → Markdown only when **all** of the following hold:

1. Request method is `GET` or `HEAD`.
2. Request `Accept` header prefers `text/markdown` over `text/html` by proper q-value parsing (not substring match).
3. Upstream response is `200 OK`.
4. Upstream response `Content-Type` is `text/html` (any charset).
5. Upstream response body size does not exceed configured `maxBodyBytes` (default 2 MB). If exceeded, the HTML is returned unchanged.
6. Request path is not in `markdownNegotiation.exclude` (defaults: `/api`, `/admin`, `/auth`, `/_next`).
7. `Vary: Accept` is always emitted on eligible paths regardless of which variant is served. The HTML path preserves streaming via `new Response(body, { ...init, headers })` without reading the body stream.

Setting `config.markdownNegotiation.enabled = true` in v0.1 causes `createMiddleware` to throw `Not implemented` so that accidental early opt-in is caught at boot rather than silently returning HTML forever.

## Contributing

- Fork, clone, `pnpm install`.
- Tests: `pnpm run test`. TDD is expected — write a failing test before adding behavior.
- Format: `pnpm run format`. Lint: `pnpm run lint`. Typecheck: `pnpm run typecheck`.
- Build: `pnpm -r --filter "./packages/*" run build`.
- Pack smoke: `./scripts/pack-smoke.sh` (packs each package, installs tarballs into scratch copies of the examples, runs their test suites).
- Before opening a PR, add a changeset: `pnpm changeset`.
- The CI matrix runs on Node 20.x and 22.x with pnpm 9.x. All checks must be green before merge.
- Releases are driven by [changesets](https://github.com/changesets/changesets). A PR with changesets is version-bumped and published automatically when merged to `main` via npm OIDC provenance — no long-lived tokens.

## License

MIT © [lexabu](https://github.com/lexabu)
