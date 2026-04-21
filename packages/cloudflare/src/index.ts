import {
  agentSkillsIndex,
  apiCatalog,
  robotsTxt,
  sitemap,
  type AgentReadinessConfig,
} from 'agent-ready-web';

export async function handleAgentRoutes(
  request: Request,
  config: AgentReadinessConfig,
): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/robots.txt') {
    return new Response(
      robotsTxt({
        siteUrl: config.siteUrl,
        contentSignals: config.contentSignals,
        aiCrawlers: config.aiCrawlers,
        userAgents: config.userAgents,
      }),
      { headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  if (path === '/sitemap.xml') {
    const urls = await config.sitemap.urls();
    return new Response(sitemap(urls), {
      headers: { 'content-type': 'application/xml; charset=utf-8' },
    });
  }

  if (path === '/.well-known/api-catalog') {
    if (!config.apiCatalog) return null;
    return new Response(JSON.stringify(apiCatalog(config.apiCatalog)), {
      headers: { 'content-type': 'application/linkset+json' },
    });
  }

  if (path === '/.well-known/agent-skills/index.json') {
    if (!config.agentSkills) return null;
    const index = await agentSkillsIndex(config.agentSkills);
    return new Response(JSON.stringify(index), {
      headers: { 'content-type': 'application/json' },
    });
  }

  return null;
}
