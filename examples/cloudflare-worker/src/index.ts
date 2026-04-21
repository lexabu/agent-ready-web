import { handleAgentRoutes } from '@agent-ready-web/cloudflare';
import config from './agent-readiness.config.js';

export default {
  async fetch(request: Request): Promise<Response> {
    const handled = await handleAgentRoutes(request, config);
    if (handled) return handled;
    return new Response('Not found', { status: 404 });
  },
} satisfies ExportedHandler;
