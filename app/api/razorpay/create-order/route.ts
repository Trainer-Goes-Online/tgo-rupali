import crypto from 'crypto';

import { NextResponse } from 'next/server';

import {
  ATTR_COOKIE,
  packJsonNote,
  readAttrCookie,
} from '@/lib/attribution-edge';
import { CHECKOUT_CONFIG, isTestMode } from '@/lib/checkout-config';
import {
  readClientIp,
  readClientUserAgent,
  readRequestCookie,
} from '@/lib/request-signals';

/**
 * Creates the Razorpay order the browser then pays. The webhook that fires
 * Purchase receives only what Razorpay stored, and this is the last request
 * the buyer's own browser makes, so the notes are written here.
 *
 * 15 note keys at 256 chars each, and Razorpay REJECTS the order past either.
 * One key per field, never a chunked blob: slicing a serialised object cuts
 * it mid-value and every field comes back empty together.
 */

const truncate = (v: unknown, max = 256) => {
  const s = v == null ? '' : String(v);
  return s.length > max ? s.slice(0, max) : s;
};

export async function POST(req: Request) {
  const { keyId, keySecret } = CHECKOUT_CONFIG.razorpay;
  if (!keyId || !keySecret) {
    console.error('[create-order] Razorpay keys not configured');
    return NextResponse.json({ ok: false, reason: 'not-configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }

  const firstName = truncate(body.firstName, 80).trim();
  const lastName = truncate(body.lastName, 80).trim();
  const email = truncate(body.email, 160).trim();
  const phone = truncate(body.phone, 20).replace(/\D/g, '');
  const city = truncate(body.city, 80).trim();
  const country = truncate(body.country, 2).trim().toLowerCase() || 'in';
  const occupation = truncate(body.occupation, 32).trim();

  if (!firstName || !lastName || !email || !phone || !city) {
    return NextResponse.json({ ok: false, reason: 'missing-fields' }, { status: 400 });
  }

  const utm = (body.utm ?? {}) as Record<string, string | undefined>;

  const leadId = crypto.randomUUID();

  /* From headers, never the body: a user agent sent up in JSON is forgeable. */
  const clientIp = readClientIp(req);
  const clientUserAgent = readClientUserAgent(req);

  /* Body first, cookie as the catch. Same-origin, so the cookies are already
     on this request, and they survive when the pixel is blocked. */
  const fbc = truncate(body.fbc) || truncate(readRequestCookie(req, '_fbc'));
  const fbp = truncate(body.fbp) || truncate(readRequestCookie(req, '_fbp'));
  const edge = readAttrCookie(readRequestCookie(req, ATTR_COOKIE));

  const landingUrl = truncate(body.landingUrl, 256) || truncate(edge.landingUrl, 256);
  const referrer = truncate(body.referrer, 200) || truncate(edge.referrer, 200);
  const fbclid = truncate(body.fbclid, 200) || truncate(edge.fbclid, 200);
  const utmOf = (bodyVal: unknown, edgeVal: unknown, max: number) =>
    truncate(bodyVal, max) || truncate(edgeVal, max);

  /* Fourteen of the fifteen allowed. No phone, timestamp or amount: Razorpay
     returns those on the webhook payload, so they never have to travel. */
  const notes: Record<string, string> = {
    kind: CHECKOUT_CONFIG.orderKind,
    lead_id: leadId,
    /* Readable in the Razorpay dashboard, for refunds. */
    name: truncate(`${firstName} ${lastName}`.trim()),
    email: truncate(email),
    /* Grouped so they do not each burn a key. packJsonNote shortens the
       longest VALUE, so an overlong city costs the city and nothing else. */
    cust: packJsonNote({
      fn: truncate(firstName, 40),
      ln: truncate(lastName, 40),
      ct: truncate(city, 40),
      co: country,
      dl: truncate(body.dialCode, 6),
    }),
    meta: packJsonNote({
      oc: truncate(occupation, 32),
      xid: truncate(body.externalId, 40),
      ga: truncate(body.gaClientId, 40),
    }),
    /* TGO's convention: medium/campaign/content carry Meta names, term the
       ad id. 20/55/55/55/25 serialises to 246 of 256. */
    utm: packJsonNote({
      s: utmOf(utm.source, edge.utmSource, 20),
      m: utmOf(utm.medium, edge.utmMedium, 55),
      c: utmOf(utm.campaign, edge.utmCampaign, 55),
      n: utmOf(utm.content, edge.utmContent, 55),
      t: utmOf(utm.term, edge.utmTerm, 25),
    }),
    /* Own key, never a bundle: a truncated identifier joins to nothing. */
    fbc,
    fbp,
    ip: clientIp,
    ua: truncate(clientUserAgent, 256),
    clid: fbclid,
    ref: referrer,
    lp: landingUrl,
  };

  /* Repaired, not just logged: a rejected order is an unpaid buyer. */
  for (const [k, v] of Object.entries(notes)) {
    if (v.length > 256) {
      console.error(`[create-order] note "${k}" over 256 chars (${v.length}), trimming`);
      notes[k] = v.slice(0, 256);
    }
  }
  if (Object.keys(notes).length > 15) {
    console.error('[create-order] notes over Razorpay 15-key cap', Object.keys(notes).length);
  }

  try {
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        amount: CHECKOUT_CONFIG.amountPaise,
        currency: CHECKOUT_CONFIG.currency,
        receipt: `rn_${Date.now()}`,
        notes,
      }),
    });

    const order = await res.json();
    if (!res.ok || !order?.id) {
      /* One line: a pretty-printed object gets truncated by the log viewer,
         and the tail is where Razorpay puts `description` and `field`. */
      const err = order?.error ?? {};
      /* A 401 is never about the payload. Lengths and trimmed-flags reveal
         nothing about the secret but catch every cause of a bad pair. */
      if (res.status === 401) {
        console.error(
          `[create-order] auth shape keyIdPrefix=${keyId.slice(0, 9)} ` +
            `keyIdLen=${keyId.length} (expect 23) secretLen=${keySecret.length} (expect 24) ` +
            `keyIdClean=${keyId === keyId.trim()} secretClean=${keySecret === keySecret.trim()} ` +
            `secretLooksLikeKeyId=${keySecret.startsWith('rzp_')}`,
        );
      }
      console.error(
        `[create-order] razorpay rejected http=${res.status} code=${err.code ?? '?'} ` +
          `step=${err.step ?? '?'} field=${err.field ?? '-'} desc=${err.description ?? JSON.stringify(order)}`,
      );
      return NextResponse.json({ ok: false, reason: 'gateway' }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      leadId,
      isTest: isTestMode(),
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId, // publishable by design: the browser needs it to open the sheet
    });
  } catch (e) {
    console.error('[create-order] failed', e);
    return NextResponse.json({ ok: false, reason: 'network' }, { status: 502 });
  }
}
