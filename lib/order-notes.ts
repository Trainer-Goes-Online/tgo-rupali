/**
 * Reading a Razorpay order's notes back on the webhook.
 *
 * The carrier is written by app/api/razorpay/create-order, ONE KEY PER FIELD.
 * Razorpay accepts a maximum of 15 note pairs at 256 characters each and
 * REJECTS the whole order if either is passed, so the layout is fourteen keys
 * with one spare:
 *
 *   kind · lead_id · name · email     human, for the Razorpay dashboard
 *   cust · meta · utm                 three small packJsonNote bundles
 *   fbc · fbp · ip · ua · clid · ref · lp    one signal each
 *
 * NEVER CHUNK. An earlier house design serialised everything into one JSON
 * string sliced across x0..x9, and the slice cut the JSON mid-value: the parse
 * threw at this end and every field came back empty together, so one long
 * campaign name took the buyer's device, city, click id and landing page with
 * it. One key per field means an oversized value costs only its own field.
 *
 * Six fields are deliberately NOT carried, because Razorpay sends them on the
 * webhook payload anyway: email, phone, the capture timestamp, the payment id,
 * the order id and the amount. A field that never travels cannot be lost.
 */

export type OrderContext = {
  firstName: string;
  lastName: string;
  city: string;
  /** "+91", kept apart from the phone, which Razorpay returns as full E.164. */
  dialCode: string;
  country: string;
  /** The QualifiedLead segment answer. */
  occupation: string;
  externalId: string;
  fbc: string;
  fbp: string;
  gaCid: string;
  clientIp: string;
  clientUserAgent: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  fbclid: string;
  referrer: string;
  landingUrl: string;
};

export const EMPTY_CONTEXT: OrderContext = {
  firstName: '',
  lastName: '',
  city: '',
  dialCode: '',
  country: '',
  occupation: '',
  externalId: '',
  fbc: '',
  fbp: '',
  gaCid: '',
  clientIp: '',
  clientUserAgent: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  utmContent: '',
  utmTerm: '',
  fbclid: '',
  referrer: '',
  landingUrl: '',
};

const str = (v: unknown): string =>
  typeof v === 'string' ? v : v == null ? '' : String(v);

function readBundle(raw: unknown): Record<string, string> {
  const s = str(raw);
  if (!s) return {};
  try {
    const parsed = JSON.parse(s) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
  } catch {
    /* packJsonNote guarantees valid JSON, so this only fires on a note written
       by something else. An empty bundle costs those fields, never the rest. */
  }
  return {};
}

export function readOrderContext(notes: Record<string, unknown>): OrderContext {
  const cust = readBundle(notes.cust);
  const meta = readBundle(notes.meta);
  const utm = readBundle(notes.utm);

  return {
    firstName: str(cust.fn),
    lastName: str(cust.ln),
    city: str(cust.ct),
    dialCode: str(cust.dl),
    country: str(cust.co),
    occupation: str(meta.oc),
    externalId: str(meta.xid),
    gaCid: str(meta.ga),
    fbc: str(notes.fbc),
    fbp: str(notes.fbp),
    clientIp: str(notes.ip),
    clientUserAgent: str(notes.ua),
    utmSource: str(utm.s),
    utmMedium: str(utm.m),
    utmCampaign: str(utm.c),
    utmContent: str(utm.n),
    utmTerm: str(utm.t),
    fbclid: str(notes.clid),
    referrer: str(notes.ref),
    landingUrl: str(notes.lp),
  };
}
