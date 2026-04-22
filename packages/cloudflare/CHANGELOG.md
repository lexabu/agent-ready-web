# @agent-ready-web/cloudflare

## 0.1.2

### Patch Changes

- Updated dependencies
  - agent-ready-web@0.1.1 (fixes `Content-Signal` emission — directive, not `#` comment; singular, inside `User-agent: *` stanza).

## 0.1.1

### Patch Changes

- Fix `workspace:*` protocol leaking into the published `dependencies` field, which caused `EUNSUPPORTEDPROTOCOL` when consumers tried to install the package with npm/yarn. The initial 0.1.0 tarballs were published with `npm publish`, which does not rewrite the pnpm workspace protocol to a concrete version range. This release ships with the correct `"agent-ready-web": "^0.1.0"` specifier, published via `pnpm publish`.

## 0.1.0

### Minor Changes

- 05af0a5: Initial 0.1.0 release.

  **`agent-ready-web`** — framework-agnostic generators: `defineAgentReadiness`, `robotsTxt` (RFC 9309 + Content-Signals), `sitemap` (sitemaps.org 0.9), `linkHeaders` (RFC 8288), `apiCatalog` (RFC 9727), `agentSkillsIndex` (canonical-JSON SHA-256 digests).

  **`@agent-ready-web/next`** — Next.js App Router adapters: `createRobots`, `createRobotsRoute` (preserves Content-Signals), `createSitemap`, `createMiddleware` (Link headers only), `createApiCatalogRoute`, `createAgentSkillsRoute`.

  **`@agent-ready-web/cloudflare`** — Workers adapter: `handleAgentRoutes` for `/robots.txt`, `/sitemap.xml`, `/.well-known/api-catalog`, `/.well-known/agent-skills/index.json`.

  Markdown content negotiation is explicitly deferred to v0.2 — enabling it throws `Not implemented` from the Next.js middleware adapter.

### Patch Changes

- Updated dependencies [05af0a5]
  - agent-ready-web@0.1.0
