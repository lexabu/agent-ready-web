import type { SitemapEntry } from './types.js';

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toDateString(value: Date | string): string {
  if (typeof value === 'string') return value;
  return value.toISOString().slice(0, 10);
}

export function sitemap(entries: SitemapEntry[]): string {
  const body = entries
    .map((entry) => {
      const parts = [`    <loc>${escape(entry.url)}</loc>`];
      if (entry.lastModified !== undefined) {
        parts.push(`    <lastmod>${toDateString(entry.lastModified)}</lastmod>`);
      }
      if (entry.changeFrequency !== undefined) {
        parts.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
      }
      if (entry.priority !== undefined) {
        parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
      }
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
