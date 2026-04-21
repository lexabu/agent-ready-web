import { NextResponse, type NextMiddleware, type NextRequest } from 'next/server';
import { linkHeaders, type AgentReadinessConfig } from 'agent-ready-web';

export function createMiddleware(config: AgentReadinessConfig): NextMiddleware {
  if (config.markdownNegotiation?.enabled) {
    throw new Error(
      'markdown negotiation is not implemented in @agent-ready-web/next v0.1 — deferred to v0.2 via a Cloudflare Worker front layer',
    );
  }
  const getLinkHeaders = linkHeaders(config.linkHeaders);
  return (req: NextRequest) => {
    const res = NextResponse.next();
    const headers = getLinkHeaders(req.nextUrl.pathname);
    const link = headers.get('link');
    if (link !== null) res.headers.set('Link', link);
    return res;
  };
}
