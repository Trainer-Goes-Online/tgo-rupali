'use client';

/**
 * GA4 events, standard ecommerce names only, so the built-in funnel and
 * revenue reports populate with no configuration. Money IS sent: a property
 * with pure event counts cannot answer what anything cost or earned.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type Ga4Item = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

type Money = { value: number; currency?: string; items?: Ga4Item[] };

function send(name: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
      return;
    }
    /* gtag.js has not finished loading. Queue onto dataLayer exactly as gtag
       itself would, by pushing the `arguments` object, so the tag replays the
       event when it initialises. The tag is afterInteractive and the first
       event fires from an effect, so this race is real. */
    window.dataLayer = window.dataLayer || [];
    function gtagShim() {
      // eslint-disable-next-line prefer-rest-params
      (window.dataLayer as unknown[]).push(arguments);
    }
    (gtagShim as (...args: unknown[]) => void)('event', name, params);
  } catch {
    /* never throw into a click */
  }
}

const money = (m: Money) => ({
  value: m.value,
  currency: m.currency ?? 'INR',
  ...(m.items && { items: m.items }),
});

export const ga4ViewItem = (m: Money) => send('view_item', money(m));
export const ga4AddToCart = (m: Money) => send('add_to_cart', money(m));
export const ga4BeginCheckout = (m: Money) => send('begin_checkout', money(m));
export const ga4AddPaymentInfo = (m: Money) => send('add_payment_info', money(m));
export const ga4Purchase = (m: Money & { transactionId: string }) =>
  send('purchase', { transaction_id: m.transactionId, ...money(m) });
/* The booked call. generate_lead is GA4's closest standard name to Meta's
   Schedule; the mapping lives in lib/track.ts. */
export const ga4GenerateLead = (m: Money) => send('generate_lead', money(m));

/* Some events fire once rather than on every call. The flag is stamped BEFORE
   the call, so a rapid double-click or a tab closed mid-navigation still
   dedupes. */
export function once(key: string, fire: () => void) {
  if (typeof window === 'undefined') return;

  /* THIS GATE DELIBERATELY DOES NOT CHECK FOR window.gtag. trackViewItem fires
     Meta's ViewContent from inside this callback. On a previous build the gtag
     check lived here, the project had no GA4 base tag, so the check never
     passed, so META'S ViewContent NEVER FIRED AT ALL. Meta must never go dark
     because GA4 is misconfigured; send() queues onto dataLayer on its own. */

  /* A purchase must never count twice for one transaction, so those keys are
     remembered for the life of the browser. Everything else is per SESSION: a
     durable view_item key means a returning visitor generates no ViewContent
     ever again, which starves the retargeting audience. */
  const durable = key.startsWith('purchase_');
  const k = `rn_ga4_${key}`;
  try {
    const store = durable ? window.localStorage : window.sessionStorage;
    if (store.getItem(k)) return;
    store.setItem(k, '1');
  } catch {
    /* private mode: fire anyway rather than lose the event */
  }
  fire();
}
