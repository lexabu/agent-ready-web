import { createMiddleware } from '@agent-ready-web/next';
import configModule from '@/agent-readiness.config';

export const middleware = createMiddleware(configModule);

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)).*)',
  ],
};
