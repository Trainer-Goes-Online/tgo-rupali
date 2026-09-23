import { site, feePaise } from '@/lib/site';
import { GA4_ITEM_ID, PRODUCT_LABEL } from '@/lib/offer';

/**
 * Every server-side constant the payment and tracking routes need. The price
 * comes from lib/site.ts, so the amount charged cannot drift from the amount
 * displayed.
 *
 * ⚠️ NO LIVE DOMAIN HAS BEEN SUPPLIED. SITE_URL is Meta's event_source_url on
 * every server-side event, so a guessed default would attribute real events to
 * a domain the client may not own: the fallback is empty and siteUrlReady() is
 * checked by the routes that need it. `||` and not `??`, because a host that
 * defines the key BLANK yields an empty string that `??` passes through.
 *
 * This is the ONE origin literal in the codebase. Before setting it:
 *   curl -sS -o /dev/null -D - https://the-domain | grep -iE '^HTTP/|^location:'
 * A 308 means that host is not canonical. House standard is the apex.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');

export const siteUrlReady = () => Boolean(SITE_URL);

export const CHECKOUT_CONFIG = {
  amountRupees: site.feeInr,
  amountPaise: feePaise,
  currency: 'INR',
  contentName: PRODUCT_LABEL,
  itemId: GA4_ITEM_ID,
  /* THIS FUNNEL'S MARK, written onto every order and checked by the webhook
     before it reports anything. One constant read from both ends, because the
     gate is worthless the day the two sides disagree about the spelling.
     Razorpay sends every payment on an ACCOUNT to every registered webhook
     URL, so without it a payment link, an invoice or a second funnel's sale is
     reported as a sale of this one. */
  orderKind: 'rupali_start',
  fallbackEventSourceUrl: SITE_URL,
  meta: {
    pixelId: process.env.META_PIXEL_ID ?? '',
    accessToken: process.env.META_CAPI_ACCESS_TOKEN ?? '',
    testEventCode: process.env.META_CAPI_TEST_EVENT_CODE ?? '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID ?? '',
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? '',
  },
} as const;

export const capiReady = () =>
  Boolean(CHECKOUT_CONFIG.meta.pixelId && CHECKOUT_CONFIG.meta.accessToken);

/** DERIVED, not declared: Razorpay stamps its environment into the key id, so
 *  this cannot drift the way an IS_TEST var does when somebody swaps the keys
 *  and forgets the flag. It rides to Pabbly as `is_test`. */
export const isTestMode = () =>
  CHECKOUT_CONFIG.razorpay.keyId.startsWith('rzp_test_') ||
  Boolean(CHECKOUT_CONFIG.meta.testEventCode);
