import type { AgentSkill } from './types.js';

export interface AgentSkillsIndex {
  skills: { id: string; name: string; description: string; digest: string }[];
}

function canonicalJSON(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJSON).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJSON(v)}`).join(',')}}`;
}

async function sha256Hex(input: string): Promise<string> {
  const buffer = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function agentSkillsIndex(skills: AgentSkill[]): Promise<AgentSkillsIndex> {
  const entries = await Promise.all(
    skills.map(async (skill) => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      digest: `sha256-${await sha256Hex(canonicalJSON(skill.manifest))}`,
    })),
  );
  return { skills: entries };
}
