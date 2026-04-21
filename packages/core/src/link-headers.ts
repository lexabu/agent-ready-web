import type { LinkHeaderEntry, LinkHeaderMap } from './types.js';

function formatEntry(entry: LinkHeaderEntry): string {
  const params: string[] = [`rel="${entry.rel}"`];
  if (entry.type !== undefined) params.push(`type="${entry.type}"`);
  if (entry.title !== undefined) params.push(`title="${entry.title}"`);
  return `<${entry.href}>; ${params.join('; ')}`;
}

export function linkHeaders(map: LinkHeaderMap): (pathname: string) => Headers {
  return (pathname: string) => {
    const headers = new Headers();
    const entries = map[pathname];
    if (entries && entries.length > 0) {
      headers.set('Link', entries.map(formatEntry).join(', '));
    }
    return headers;
  };
}
