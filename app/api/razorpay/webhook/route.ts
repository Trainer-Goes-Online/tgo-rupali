import crypto from 'crypto';

import { NextResponse } from 'next/server';

import {
  CHECKOUT_CONFIG,
  capiReady,
  isTestMode,
  siteUrlReady,
} from '@/lib/checkout-config';
import { ga4ServerReady, sendGa4Purchase } from '@/lib/ga4-server';
import { sendCapiEvent, type Occupation } from '@/lib/meta-capi';
import { readOrderContext } from '@/lib/order-notes';
import { pabblyReady, sendPabblyPurchase } from '@/lib/pabbly';

/**
 * The only place a Purchase is reported. A browser-side one would miss every
 * UPI payer who completes in their bank app and never returns to the tab.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  const secret = CHECKOUT_CONFIG.razorpay.webhookSecret;

  if (!secret) {
    console.error('[rzp-webhook] no webhook secret configured');
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  /* Length check first: timingSafeEqual THROWS on unequal lengths. */
  const valid =
    sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

  if (!valid) {
    console.warn('[rzp-webhook] bad signature, rejected');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const parsed = JSON.parse(raw);
  if (parsed.event !== 'payment.captured') {
    return NextResponse.json({ ok: true, ignored: parsed.event });
  }

  const payment = parsed.payload?.payment?.entity ?? {};
  const notes = payment.notes ?? {};

  /* Webhooks are registered per URL on an ACCOUNT, so this endpoint receives
     every captured payment on it, not just this checkout's. 200 and not an
     error: a non-200 makes Razorpay retry the foreign payment for hours. */
  const kind = String(notes.kind ?? '');
  if (kind !== CHECKOUT_CONFIG.orderKind) {
    console.warn(
      `[rzp-webhook] ignored payment ${String(payment.id ?? '')}: kind="${kind || 'none'}", expected "${CHECKOUT_CONFIG.orderKind}"`,
    );
    return NextResponse.json({ ok: true, ignored: 'not-this-funnel' });
  }

  const paymentId = String(payment.id ?? '');
  const orderId = String(payment.order_id ?? '');
  const amountRupees = Number(payment.amount ?? 0) / 100;

  /* Unix seconds. Taken from the payload so nothing has to carry it. */
  const capturedAt = Number(payment.created_at ?? 0);
  const createdAt =
    Number.isFinite(capturedAt) && capturedAt > 0
      ? new Date(capturedAt * 1000).toISOString()
      : new Date().toISOString();

  const valueRupees = amountRupees || CHECKOUT_CONFIG.amountRupees;

  /* The only route back to the buyer's IP, device and campaign: this request
     came from Razorpay, so its own headers describe Razorpay. */
  const ctx = readOrderContext(notes);
  const country = ctx.country || 'in';

  /* Validated, not passed through: this reaches Meta's custom_data, which is
     unhashed and read during dataset classification. */
  const occupation: Occupation | undefined =
    ctx.occupation === 'working_professional' || ctx.occupation === 'homemaker'
      ? ctx.occupation
      : undefined;

  /* Razorpay holds what the buyer actually paid with, not what they typed. */
  const email = String(payment.email ?? '') || '';
  const phone = String(payment.contact ?? '') || '';

  const eventSourceUrl = CHECKOUT_CONFIG.fallbackEventSourceUrl;
  if (!siteUrlReady()) {
    console.error(
      '[rzp-webhook] NEXT_PUBLIC_SITE_URL is unset, so event_source_url is empty on this Purchase',
    );
  }

  /* Keyed on the payment id, so GA4 collapses this and the browser copy. */
  const ga4 = ga4ServerReady()
    ? await sendGa4Purchase({
        clientId: ctx.gaCid,
        transactionId: paymentId,
        valueRupees,
        currency: CHECKOUT_CONFIG.currency,
        itemId: CHECKOUT_CONFIG.itemId,
        itemName: CHECKOUT_CONFIG.contentName,
      })
    : { ok: false, status: 0 };

  /* ABOVE the CAPI guard on purpose: that guard returns early, so a missing
     Meta config must not stop a paying buyer being fulfilled. */
  const pabbly = pabblyReady()
    ? await sendPabblyPurchase({
        leadId: String(notes.lead_id ?? ''),
        createdAt,
        firstName: ctx.firstName,
        lastName: ctx.lastName,
        email,
        phone,
        city: ctx.city,
        dialCode: ctx.dialCode,
        countryCode: country,
        fbc: ctx.fbc,
        fbp: ctx.fbp,
        clientIp: ctx.clientIp,
        clientUserAgent: ctx.clientUserAgent,
        externalId: ctx.externalId,
        eventSourceUrl: eventSourceUrl ? `${eventSourceUrl}/checkout` : '',
        amountRupees: valueRupees,
        isTest: isTestMode(),
        purchaseEventId: paymentId,
        utmSource: ctx.utmSource,
        utmMedium: ctx.utmMedium,
        utmCampaign: ctx.utmCampaign,
        utmContent: ctx.utmContent,
        utmTerm: ctx.utmTerm,
        fbclid: ctx.fbclid,
        referrer: ctx.referrer,
        landingUrl: ctx.landingUrl,
        paymentId,
        orderId,
        currency: CHECKOUT_CONFIG.currency,
        product: CHECKOUT_CONFIG.contentName,
        occupation: ctx.occupation,
      })
    : { ok: false, status: 0 };

  if (!capiReady()) {
    console.warn('[rzp-webhook] CAPI not configured, Meta Purchase not sent');
    return NextResponse.json({
      ok: true,
      capi: 'skipped',
      ga4: ga4.ok,
      pabbly: pabbly.ok,
    });
  }

  /* event_id is the payment id: stable across retries, so no double count. */
  const result = await sendCapiEvent({
    pixelId: CHECKOUT_CONFIG.meta.pixelId,
    accessToken: CHECKOUT_CONFIG.meta.accessToken,
    eventName: 'Purchase',
    eventId: paymentId,
    eventSourceUrl,
    user: {
      email: email || undefined,
      phone: phone || undefined,
      firstName: ctx.firstName || undefined,
      lastName: ctx.lastName || undefined,
      country,
      city: ctx.city || undefined,
      externalId: ctx.externalId || undefined,
      fbc: ctx.fbc || undefined,
      fbp: ctx.fbp || undefined,
      /* From the buyer's own create-order request, never from this one. */
      clientIp: ctx.clientIp || undefined,
      clientUserAgent: ctx.clientUserAgent || undefined,
    },
    valueRupees,
    currency: CHECKOUT_CONFIG.currency,
    /* No product name, no UTMs: custom_data is unhashed and is read during
       dataset classification, and this offer sells against a condition. */
    orderId: orderId || undefined,
    occupation,
    testEventCode: CHECKOUT_CONFIG.meta.testEventCode || undefined,
  });

  console.log(
    `[rzp-webhook] ${paymentId} Purchase capi=${result.ok} ga4=${ga4.ok} pabbly=${pabbly.ok}`,
  );
  return NextResponse.json({
    ok: true,
    capi: result.ok ? 'sent' : 'error',
    ga4: ga4.ok ? 'sent' : 'skipped',
    pabbly: pabbly.ok ? 'sent' : 'skipped',
  });
}
