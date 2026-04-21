import type { AgentReadinessConfig } from './types.js';

export function defineAgentReadiness<T extends AgentReadinessConfig>(config: T): T {
  return config;
}
