import { describe, expect, it } from 'vitest';
import { apiCatalog } from '../src/index.js';

describe('apiCatalog', () => {
  it('returns RFC 9727 linkset object verbatim when already shaped', () => {
    const input = {
      linkset: [
        {
          anchor: 'https://apex.test/api/contact',
          'service-desc': [{ href: '/api/openapi.json', type: 'application/openapi+json;version=3.1' }],
        },
      ],
    };
    expect(apiCatalog(input)).toEqual(input);
  });

  it('freezes the returned object to prevent accidental mutation', () => {
    const out = apiCatalog({ linkset: [] });
    expect(Object.isFrozen(out)).toBe(true);
  });
});
