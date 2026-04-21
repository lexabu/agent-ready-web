import { createRobotsRoute } from '@agent-ready-web/next';
import config from '@/agent-readiness.config';

export const dynamic = 'force-dynamic';

export const GET = createRobotsRoute(config);
