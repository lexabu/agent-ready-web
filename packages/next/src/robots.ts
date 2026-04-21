import type { AgentReadinessConfig } from 'agent-ready-web';

export interface NextRobotsRule {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
  crawlDelay?: number;
}

export interface NextRobotsResult {
  rules: NextRobotsRule[];
  sitemap?: string | string[];
  host?: string;
}

export function createRobots(config: AgentReadinessConfig): () => NextRobotsResult {
  return () => {
    const rules: NextRobotsRule[] = config.userAgents.map((u) => ({
      userAgent: u.name,
      ...(u.allow ? { allow: u.allow } : {}),
      ...(u.disallow ? { disallow: u.disallow } : {}),
      ...(typeof u.crawlDelay === 'number' ? { crawlDelay: u.crawlDelay } : {}),
    }));
    for (const [bot, disposition] of Object.entries(config.aiCrawlers)) {
      rules.push({
        userAgent: bot,
        ...(disposition === 'allow' ? { allow: '/' } : { disallow: '/' }),
      });
    }
    return {
      rules,
      sitemap: new URL('/sitemap.xml', config.siteUrl).toString(),
      host: config.siteUrl,
    };
  };
}
