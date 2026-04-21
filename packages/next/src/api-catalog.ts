import { apiCatalog, type AgentReadinessConfig } from 'agent-ready-web';

export function createApiCatalogRoute(config: AgentReadinessConfig): () => Promise<Response> {
  if (!config.apiCatalog) {
    throw new Error('config.apiCatalog must be defined to use createApiCatalogRoute');
  }
  const frozen = apiCatalog(config.apiCatalog);
  return async () =>
    new Response(JSON.stringify(frozen), {
      headers: { 'content-type': 'application/linkset+json' },
    });
}
