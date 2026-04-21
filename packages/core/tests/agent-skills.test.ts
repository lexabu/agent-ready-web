import { describe, expect, it } from 'vitest';
import { agentSkillsIndex } from '../src/index.js';

const EMPTY_OBJECT_SHA256 = '44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a';

describe('agentSkillsIndex', () => {
  it('computes sha256 digest over canonical JSON manifest (known vector for {})', async () => {
    const skills = [
      {
        id: 'contact',
        name: 'Contact',
        description: 'Send a message',
        manifest: {},
      },
    ];
    const index = await agentSkillsIndex(skills);
    expect(index.skills).toHaveLength(1);
    expect(index.skills[0]!.id).toBe('contact');
    expect(index.skills[0]!.digest).toBe(`sha256-${EMPTY_OBJECT_SHA256}`);
  });

  it('is stable across repeat calls (deterministic digest)', async () => {
    const skills = [{ id: 'a', name: 'A', description: 'd', manifest: { x: 1 } }];
    const a = await agentSkillsIndex(skills);
    const b = await agentSkillsIndex(skills);
    expect(a.skills[0]!.digest).toBe(b.skills[0]!.digest);
  });

  it('sorts object keys for canonical JSON (order-independent digest)', async () => {
    const a = await agentSkillsIndex([
      { id: 'a', name: 'A', description: 'd', manifest: { x: 1, y: 2 } },
    ]);
    const b = await agentSkillsIndex([
      { id: 'a', name: 'A', description: 'd', manifest: { y: 2, x: 1 } },
    ]);
    expect(a.skills[0]!.digest).toBe(b.skills[0]!.digest);
  });
});
