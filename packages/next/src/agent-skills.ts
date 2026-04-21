import { agentSkillsIndex, type AgentReadinessConfig } from 'agent-ready-web';

export function createAgentSkillsRoute(config: AgentReadinessConfig): () => Promise<Response> {
  if (!config.agentSkills) {
    throw new Error('config.agentSkills must be defined to use createAgentSkillsRoute');
  }
  const skills = config.agentSkills;
  return async () => {
    const index = await agentSkillsIndex(skills);
    return new Response(JSON.stringify(index), {
      headers: { 'content-type': 'application/json' },
    });
  };
}
