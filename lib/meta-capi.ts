import crypto from 'crypto';

/**
 * Meta Conversions API primitives, shared by every server-side event route.
 *
 * ── HEALTH CLASSIFICATION HYGIENE. READ BEFORE ADDING A FIELD. ───────────
 * This offer sells against a body: PCOS, thyroid, low AMH, endometriosis,
 * infertility. Meta classifies a dataset into its restricted "Health and
 * wellness condition" category by reading a handful of surfaces, and the
 * restriction binds at the ROOT DOMAIN and is not cleanly reversible. Two
 * signals are removable and this file owns both:
 *
 *   `custom_data` carries value, currency and order_id ONLY. It is NOT hashed
 *   and IS read, so a product string naming a fertility programme is a
 *   plain-text declaration of the condition. utm_campaign is worse: media
 *   buyers write those and they drift toward symptom language unreviewed.
 *
 *   `event_source_url` is reduced to the ORIGIN, server-side, because a path
 *   carries the same declaration and the caller is a browser posting
 *   window.location.href with that path and an fbclid on it.
 *
 * `user_data` stays MAXIMAL: all SHA-256 hashed, it is what EMQ is scored on,
 * and it declares nothing about the offer. Hygiene means removing description,
 * never removing matching. The standard event NAMES are kept for the same
 * reason: coded custom events forfeit AEM priority and every standard-event
 * prior in the ad account.
 */

export type Utm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

/** Origin only. A malformed url falls back to the raw string: it is not a leak. */
export function originOnly(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

/** Meta's standard events. Nothing outside this union is sendable. */
export type StandardEvent =
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'Purchase'
  /* The booking, which is what the funnel exists to produce: without it the ad
     account can optimise towards someone paying but not towards someone who
     took a slot, and those are different people. Schedule must also be added
     to the pixel's event allow-list or it is dropped without an error. */
  | 'Schedule';

/** Closed for the same reason: a free-form string is how a health term
 *  eventually reaches Meta as an event name. */
export type CustomEvent = 'QualifiedLead';

export type SendableEvent = StandardEvent | CustomEvent;

/**
 * The ONE descriptive value allowed into custom_data, and the type is what
 * keeps that safe: neither member is a health or condition term.
 *
 * ⚠️ WHICH HALF QUALIFIES IS NOT CONFIRMED. `working_professional` is the
 * house default; flipping it is one comparison in app/api/meta/event/route.ts.
 */
export type Occupation = 'working_professional' | 'homemaker';

export function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/* Normalisation rules are Meta's. An empty field returns undefined rather than
   a hash of the empty string, which would match every other empty field. */
export function hashEmail(v: string) {
  const s = v.trim().toLowerCase();
  return s ? sha256Hex(s) : undefined;
}
export function hashPhone(v: string) {
  const s = v.replace(/\D/g, ''); // E.164 without the plus
  return s ? sha256Hex(s) : undefined;
}
export function hashName(v: string) {
  const s = v.trim().toLowerCase();
  return s ? sha256Hex(s) : undefined;
}
export function hashCountry(v: string) {
  const s = v.trim().toLowerCase(); // ISO 3166-1 alpha-2
  return s ? sha256Hex(s) : undefined;
}

/* City: lowercase, and strip spaces and punctuation entirely. Meta's own
   normalisation removes them, so "New Delhi" and "newdelhi" must hash to the
   same value or the match is silently lost. */
export function hashCity(v: string) {
  const s = v.trim().toLowerCase().replace(/[^a-z]/g, '');
  return s ? sha256Hex(s) : undefined;
}

export type UserSignals = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  externalId?: string;
  fbc?: string;
  fbp?: string;
  clientIp?: string;
  clientUserAgent?: string;
};

function buildUserData(u: UserSignals) {
  return {
    ...(u.email && { em: [hashEmail(u.email)!] }),
    ...(u.phone && { ph: [hashPhone(u.phone)!] }),
    ...(u.firstName && { fn: [hashName(u.firstName)!] }),
    ...(u.lastName && { ln: [hashName(u.lastName)!] }),
    ...(u.country && { country: [hashCountry(u.country)!] }),
    ...(u.city && { ct: [hashCity(u.city)!] }),
    ...(u.externalId && { external_id: [sha256Hex(u.externalId)] }),
    ...(u.fbc && { fbc: u.fbc }),
    ...(u.fbp && { fbp: u.fbp }),
    ...(u.clientIp && { client_ip_address: u.clientIp }),
    ...(u.clientUserAgent && { client_user_agent: u.clientUserAgent }),
  };
}

/** One event, one POST. Never throws into a request: a failed analytics call
 *  must not fail a payment. */
export async function sendCapiEvent(params: {
  pixelId: string;
  accessToken: string;
  eventName: SendableEvent;
  eventId: string;
  eventSourceUrl: string;
  user: UserSignals;
  valueRupees: number;
  currency: string;
  /** Opaque. It says nothing about what was bought. */
  orderId?: string;
  occupation?: Occupation;
  testEventCode?: string;
}): Promise<{ ok: boolean; status: number; body: unknown }> {
  const body = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: originOnly(params.eventSourceUrl),
        action_source: 'website',
        user_data: buildUserData(params.user),
        /* Every key here is a number, an opaque id or a reviewed enum value,
           and that property is what keeps this dataset unclassified. */
        custom_data: {
          currency: params.currency,
          value: params.valueRupees,
          ...(params.orderId && { order_id: params.orderId }),
          ...(params.occupation && { occupation: params.occupation }),
        },
      },
    ],
    ...(params.testEventCode && { test_event_code: params.testEventCode }),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${params.pixelId}/events?access_token=${params.accessToken}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    return { ok: res.ok, status: res.status, body: await res.json() };
  } catch (e) {
    return { ok: false, status: 0, body: String(e) };
  }
}
