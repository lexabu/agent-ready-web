import { createSitemap } from '@agent-ready-web/next';
import config from '@/agent-readiness.config';

export const dynamic = 'force-dynamic';

export default createSitemap(config);
