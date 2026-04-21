export type ContentSignalValue = 'yes' | 'no';
export type CrawlerDisposition = 'allow' | 'disallow';

export interface ContentSignals {
  'ai-train': ContentSignalValue;
  search: ContentSignalValue;
  'ai-input': ContentSignalValue;
}

export type AICrawlerPolicy = Record<string, CrawlerDisposition>;

export interface UserAgentRule {
  name: string;
  allow?: string[];
  disallow?: string[];
  crawlDelay?: number;
}

export interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapSource {
  urls: () => Promise<SitemapEntry[]> | SitemapEntry[];
}

export interface LinkHeaderEntry {
  href: string;
  rel: string;
  type?: string;
  title?: string;
}

export type LinkHeaderMap = Record<string, LinkHeaderEntry[]>;

export interface ApiCatalogLinksetItem {
  anchor: string;
  'service-desc'?: { href: string; type?: string }[];
  'service-doc'?: { href: string; type?: string }[];
  'service-meta'?: { href: string; type?: string }[];
}

export interface ApiCatalogLinkset {
  linkset: ApiCatalogLinksetItem[];
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  manifest: Record<string, unknown>;
}

export interface MarkdownNegotiationConfig {
  enabled: boolean;
  exclude?: string[];
  maxBodyBytes?: number;
}

export interface AgentReadinessConfig {
  siteUrl: string;
  contentSignals: ContentSignals;
  aiCrawlers: AICrawlerPolicy;
  userAgents: UserAgentRule[];
  sitemap: SitemapSource;
  linkHeaders: LinkHeaderMap;
  apiCatalog?: ApiCatalogLinkset;
  agentSkills?: AgentSkill[];
  markdownNegotiation?: MarkdownNegotiationConfig;
}
