/**
 * ASSET VERSIONING. Every /public reference goes through `asset()`.
 *
 * The PATH is the cache key: in the visitor's browser, at the CDN edge and
 * in Next's image optimizer. Save a re-cropped photo over the same filename
 * and nothing changes for anyone except the person who saved it. `asset()`
 * appends a version so the path changes when we say it changes.
 *
 * THE RULE: bump ASSET_V in the SAME pass as any artwork swap.
 */
export const ASSET_V = '7';

/**
 * @param path a /public path, e.g. '/proof/testimonial-01.webp'
 * @returns the same path with the current asset version appended
 */
export function asset(path: string): string {
  if (!path) return '';
  // external URLs (Vimeo, a CDN) carry their own cache policy
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${clean}${clean.includes('?') ? '&' : '?'}v=${ASSET_V}`;
}
