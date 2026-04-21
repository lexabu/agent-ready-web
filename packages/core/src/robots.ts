import type { AICrawlerPolicy, ContentSignals, UserAgentRule } from './types.js';

export interface RobotsTxtInput {
  siteUrl: string;
  contentSignals: ContentSignals;
  aiCrawlers: AICrawlerPolicy;
  userAgents: UserAgentRule[];
}

export function robotsTxt(input: RobotsTxtInput): string {
  const { siteUrl, contentSignals, aiCrawlers, userAgents } = input;
  const lines: string[] = [];

  lines.push(
    `# Content-Signals: ai-train=${contentSignals['ai-train']}, search=${contentSignals.search}, ai-input=${contentSignals['ai-input']}`,
  );
  lines.push('');

  for (const rule of userAgents) {
    lines.push(`User-agent: ${rule.name}`);
    for (const path of rule.allow ?? []) lines.push(`Allow: ${path}`);
    for (const path of rule.disallow ?? []) lines.push(`Disallow: ${path}`);
    if (typeof rule.crawlDelay === 'number') lines.push(`Crawl-delay: ${rule.crawlDelay}`);
    lines.push('');
  }

  for (const [bot, disposition] of Object.entries(aiCrawlers)) {
    lines.push(`User-agent: ${bot}`);
    lines.push(disposition === 'allow' ? 'Allow: /' : 'Disallow: /');
    lines.push('');
  }

  const sitemapUrl = new URL('/sitemap.xml', siteUrl).toString();
  lines.push(`Sitemap: ${sitemapUrl}`);

  return lines.join('\n') + '\n';
}
