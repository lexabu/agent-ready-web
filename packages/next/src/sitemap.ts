import type { AgentReadinessConfig, SitemapEntry } from 'agent-ready-web';

export function createSitemap(config: AgentReadinessConfig): () => Promise<SitemapEntry[]> {
  return async () => {
    const entries = await config.sitemap.urls();
    return entries;
  };
}
