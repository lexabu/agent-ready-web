import { defineAgentReadiness } from 'agent-ready-web';

const SITE_URL = 'http://localhost:8787';

export default defineAgentReadiness({
  siteUrl: SITE_URL,
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
  userAgents: [{ name: '*', allow: ['/'] }],
  sitemap: {
    urls: async () => [{ url: `${SITE_URL}/` }],
  },
  linkHeaders: {},
  apiCatalog: {
    linkset: [{ anchor: `${SITE_URL}/api/hello` }],
  },
  agentSkills: [
    {
      id: 'say-hello',
      name: 'Say Hello',
      description: 'Returns a greeting.',
      manifest: { endpoint: '/api/hello' },
    },
  ],
});
