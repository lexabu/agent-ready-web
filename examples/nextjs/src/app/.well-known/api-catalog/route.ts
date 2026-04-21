import { createApiCatalogRoute } from '@agent-ready-web/next';
import config from '@/agent-readiness.config';

export const GET = createApiCatalogRoute(config);
