# agent-ready-web

## 0.1.1

### Patch Changes

- Fix `Content-Signal` emission format. The 0.1.0 release emitted `# Content-Signals: …` (plural, as a `#` comment) at the top of `robots.txt`. Cloudflare's `isitagentready.com` scanner and the `draft-romm-aipref-contentsignals` spec expect the **singular** directive `Content-Signal: …` — without the `#` — **inside a `User-agent:` group** (signals inherit to matching UAs). 0.1.0 consumers fail the Content-Signals check on the scanner even though the line was present.

  New emission (inside the `User-agent: *` stanza):

  ```
  User-agent: *
  Content-Signal: ai-train=no, search=yes, ai-input=no
  Allow: /
  …
  ```

  No config changes required — existing `contentSignals: { … }` config values still drive the output.

## 0.1.0

### Minor Changes

- 05af0a5: Initial 0.1.0 release.

  **`agent-ready-web`** — framework-agnostic generators: `defineAgentReadiness`, `robotsTxt` (RFC 9309 + Content-Signals), `sitemap` (sitemaps.org 0.9), `linkHeaders` (RFC 8288), `apiCatalog` (RFC 9727), `agentSkillsIndex` (canonical-JSON SHA-256 digests).

  **`@agent-ready-web/next`** — Next.js App Router adapters: `createRobots`, `createRobotsRoute` (preserves Content-Signals), `createSitemap`, `createMiddleware` (Link headers only), `createApiCatalogRoute`, `createAgentSkillsRoute`.

  **`@agent-ready-web/cloudflare`** — Workers adapter: `handleAgentRoutes` for `/robots.txt`, `/sitemap.xml`, `/.well-known/api-catalog`, `/.well-known/agent-skills/index.json`.

  Markdown content negotiation is explicitly deferred to v0.2 — enabling it throws `Not implemented` from the Next.js middleware adapter.
