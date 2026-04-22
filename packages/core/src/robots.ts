import type { AICrawlerPolicy, ContentSignals, UserAgentRule } from './types.js';

export interface RobotsTxtInput {
  siteUrl: string;
  contentSignals: ContentSignals;
  aiCrawlers: AICrawlerPolicy;
  userAgents: UserAgentRule[];
}

function formatContentSignal(signals: ContentSignals): string {
  return `Content-Signal: ai-train=${signals['ai-train']}, search=${signals.search}, ai-input=${signals['ai-input']}`;
}

export function robotsTxt(input: RobotsTxtInput): string {
  const { siteUrl, contentSignals, aiCrawlers, userAgents } = input;
  const lines: string[] = [];

  for (const rule of userAgents) {
    lines.push(`User-agent: ${rule.name}`);
    // Content-Signal is a per-UA-group directive (draft-romm-aipref-contentsignals).
    // Emit it inside the "*" group so it inherits to all crawlers that don't
    // have their own stanza. Named AI-crawler stanzas below override via Allow/Disallow.
    if (rule.name === '*') {
      lines.push(formatContentSignal(contentSignals));
    }
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
