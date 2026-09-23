'use client';

/* The shared shape and the storage key live in the SERVER-SAFE sibling, and
   this file imports from it rather than the other way round. A `'use client'`
   module cannot be called from middleware or an API route: the import
   succeeds, the call throws. Keep the arrow pointing this way. */
import { CAP, EMPTY, KEY, cut, type Attribution } from '@/lib/attribution-edge';

export type { Attribution };

/**
 * First-touch attribution, the BROWSER copy. middleware.ts writes the same
 * object to a cookie at the edge before any JavaScript runs, and that is the
 * copy create-order depends on; this is the redundant second write.
 *
 * The problem both solve: reading the current url at checkout returns nothing,
 * because the buyer got there by clicking a link, so every UTM and the fbclid
 * evaporate one click after arrival.
 *
 * Overwrite rule: a visit carrying a utm_source or an fbclid is a new ad click
 * and replaces what is stored. A visit with neither leaves the stored campaign
 * ALONE, because blanking it is what makes paid sales look organic.
 */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    const q = new URLSearchParams(window.location.search);
    const fbclid = q.get('fbclid') ?? '';
    const utmSource = q.get('utm_source') ?? '';

    const stored = window.localStorage.getItem(KEY);
    if (stored && !utmSource && !fbclid) return;

    const next: Attribution = {
      utmSource: cut(utmSource, CAP.utm),
      utmMedium: cut(q.get('utm_medium'), CAP.utm),
      utmCampaign: cut(q.get('utm_campaign'), CAP.utm),
      utmContent: cut(q.get('utm_content'), CAP.utm),
      utmTerm: cut(q.get('utm_term'), CAP.utm),
      fbclid: cut(fbclid, CAP.fbclid),
      /* An INTERNAL referrer is not an acquisition source. Recording it would
         report every sale as coming from our own landing page. */
      referrer: isExternal(document.referrer)
        ? cut(document.referrer, CAP.referrer)
        : '',
      landingUrl: cut(window.location.href, CAP.landingUrl),
    };
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode or storage disabled: the edge cookie still has it */
  }
}

function isExternal(ref: string): boolean {
  if (!ref) return false;
  try {
    return new URL(ref).host !== window.location.host;
  } catch {
    return false;
  }
}

export function readAttribution(): Attribution {
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...(JSON.parse(raw) as Partial<Attribution>) };
  } catch {
    return EMPTY;
  }
}
