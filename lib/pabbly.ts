/**
 * Pabbly Connect: the fulfilment hand-off. Analytics tells Meta and GA4 that a
 * sale happened; this tells the automation WHO BOUGHT. It fires from the
 * Razorpay webhook and nowhere else, for the same reason Purchase does.
 *
 * Failure here must never fail the webhook: Razorpay retries a non-200 and a
 * retry re-fires Meta and GA4, so it reports its own success and swallows its
 * own errors.
 *
 * It carries the Meta match keys as well as the fulfilment fields, because
 * this is the ONLY place a full unhashed record of a sale exists anywhere:
 * Meta gets hashes, GA4 gets no PII, Razorpay holds only what it needs to
 * charge a card. Without them a mis-sent conversion is unrecoverable.
 *
 * Never remove a key once Pabbly steps map it. It does not error, it silently
 * blanks a column downstream.
 */
export const pabblyReady = () => Boolean(process.env.PABBLY_WEBHOOK_URL);

export type PabblyPurchase = {
  leadId: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  /** "+91", kept apart from `phone`, which arrives as full E.164. */
  dialCode: string;
  countryCode: string;
  fbc: string;
  fbp: string;
  clientIp: string;
  clientUserAgent: string;
  externalId: string;
  eventSourceUrl: string;
  amountRupees: number;
  isTest: boolean;
  purchaseEventId: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  referrer: string;
  landingUrl: string;
  paymentId: string;
  orderId: string;
  currency: string;
  product: string;
  occupation: string;
};

/* Every key on every call, empty where unknown: Pabbly builds its field mapper
   from the FIRST payload it sees, and a key that is merely absent cannot be
   mapped later without re-running the trigger. */
const s = (v: unknown) => (v == null ? '' : String(v));

/* One constant behind both `type` and `event`, so a workflow branching on
   either takes the same path. */
const RECORD_TYPE = 'purchase';

export async function sendPabblyPurchase(
  p: PabblyPurchase,
): Promise<{ ok: boolean; status: number }> {
  const url = process.env.PABBLY_WEBHOOK_URL ?? '';
  if (!url) return { ok: false, status: 0 };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      /* FLAT keys, one level deep. Pabbly maps one level, and a nested object
         arrives as an unusable blob in the step mapper. */
      body: JSON.stringify({
        lead_id: s(p.leadId),
        created_at: s(p.createdAt),
        first_name: s(p.firstName),
        last_name: s(p.lastName),
        email: s(p.email),
        phone: s(p.phone),
        city: s(p.city),
        /* Separate from `phone`, which arrives as full E.164. "+1" and "+91"
           both begin with a 1, so no leading-digit rule recovers the code once
           the two are merged. */
        dial_code: s(p.dialCode),
        country_code: s(p.countryCode),
        type: RECORD_TYPE,
        fbc: s(p.fbc),
        fbp: s(p.fbp),
        client_ip_address: s(p.clientIp),
        client_user_agent: s(p.clientUserAgent),
        external_id: s(p.externalId),
        event_source_url: s(p.eventSourceUrl),
        amount: p.amountRupees,
        /* A real boolean, not the string "false": a Pabbly router condition on
           a non-empty string treats "false" as true and would route every live
           sale down the test branch. */
        is_test: Boolean(p.isTest),
        purchase_event_id: s(p.purchaseEventId),
        utm_source: s(p.utmSource),
        utm_medium: s(p.utmMedium),
        utm_campaign: s(p.utmCampaign),
        utm_content: s(p.utmContent),
        utm_term: s(p.utmTerm),
        fbclid: s(p.fbclid),
        referrer: s(p.referrer),
        landing_url: s(p.landingUrl),

        event: RECORD_TYPE,
        payment_id: s(p.paymentId),
        order_id: s(p.orderId),
        name: `${s(p.firstName)} ${s(p.lastName)}`.trim(),
        currency: s(p.currency),
        product: s(p.product),
        occupation: s(p.occupation),
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
