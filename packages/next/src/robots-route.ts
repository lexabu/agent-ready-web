import { robotsTxt, type AgentReadinessConfig } from 'agent-ready-web';

export function createRobotsRoute(config: AgentReadinessConfig): () => Promise<Response> {
  return async () =>
    new Response(
      robotsTxt({
        siteUrl: config.siteUrl,
        contentSignals: config.contentSignals,
        aiCrawlers: config.aiCrawlers,
        userAgents: config.userAgents,
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
}
