import { defineAgentReadiness } from 'agent-ready-web';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3100';

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
  userAgents: [{ name: '*', allow: ['/'], disallow: ['/api/', '/admin'] }],
  sitemap: {
    urls: async () => [
      {
        url: `${SITE_URL}/`,
        lastModified: '2026-04-21',
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      { url: `${SITE_URL}/about` },
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
        anchor: `${SITE_URL}/api/hello`,
        'service-desc': [
          { href: '/api/openapi.json', type: 'application/openapi+json;version=3.1' },
        ],
      },
    ],
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
