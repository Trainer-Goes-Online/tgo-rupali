'use client';

/**
 * The identifiers a browser can supply for event matching. `external_id` is
 * ours, a stable random id per browser. `_fbc` and `_fbp` are Meta's own
 * cookies; `_fbc` only exists if the visitor arrived with an fbclid, so it is
 * synthesised from the URL exactly as Meta's pixel would.
 */

import { readAttribution } from '@/lib/attribution';

const EXTERNAL_ID_KEY = 'rn_external_id';

export function getOrCreateExternalId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = localStorage.getItem(EXTERNAL_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(EXTERNAL_ID_KEY, id);
    return id;
  } catch {
    return '';
  }
}

export function readCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : '';
}

/** Meta's format: fb.1.<timestamp>.<fbclid> */
export function captureFbclid(): void {
  if (typeof window === 'undefined') return;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (!fbclid || readCookie('_fbc')) return;
  const value = `fb.1.${Date.now()}.${fbclid}`;
  document.cookie = `_fbc=${value}; path=/; max-age=${60 * 60 * 24 * 90}; SameSite=Lax`;
}

/** From STORAGE, not the current url: on /checkout there is no query string,
 *  and every paid sale would be written to the order with blank UTMs. */
export function readUtm() {
  const a = readAttribution();
  const pick = (v: string) => v || undefined;
  return {
    source: pick(a.utmSource),
    medium: pick(a.utmMedium),
    campaign: pick(a.utmCampaign),
    content: pick(a.utmContent),
    term: pick(a.utmTerm),
  };
}

/** The _ga cookie is `GA1.1.1234567890.1699999999` and GA4 wants only the last
 *  two parts joined. The whole cookie lands as an unattributed session. */
export function readGaClientId(): string {
  const raw = readCookie('_ga');
  if (!raw) return '';
  const parts = raw.split('.');
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : '';
}

/** Everything a server route needs from the browser. Note what is NOT here:
 *  the IP and user agent, both read server-side, because a browser cannot know
 *  its own IP and a user agent sent up in a body is forgeable. */
export function collectSignals() {
  const a = readAttribution();
  return {
    externalId: getOrCreateExternalId(),
    gaClientId: readGaClientId(),
    fbc: readCookie('_fbc') || undefined,
    fbp: readCookie('_fbp') || undefined,
    eventSourceUrl: typeof window !== 'undefined' ? window.location.href : '',
    utm: readUtm(),
    fbclid: a.fbclid,
    referrer: a.referrer,
    landingUrl: a.landingUrl,
  };
}
