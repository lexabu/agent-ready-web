import type { ApiCatalogLinkset } from './types.js';

export function apiCatalog(input: ApiCatalogLinkset): ApiCatalogLinkset {
  return Object.freeze({
    ...input,
    linkset: Object.freeze([...input.linkset]),
  }) as ApiCatalogLinkset;
}
