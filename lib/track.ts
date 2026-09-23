'use client';

import { site } from '@/lib/site';
import { GA4_ITEM_ID, PRODUCT_LABEL } from '@/lib/offer';
import { collectSignals } from '@/lib/client-signals';
import {
  ga4AddPaymentInfo,
  ga4AddToCart,
  ga4BeginCheckout,
  ga4GenerateLead,
  ga4Purchase,
  ga4ViewItem,
  once,
  type Ga4Item,
} from '@/lib/ga4';

/**
 * The one place a page calls to record something. Meta by name via the CAPI
 * route, GA4 by its own recommended name: the two vocabularies differ (Meta's
 * InitiateCheckout is GA4's begin_checkout) and the mapping lives here rather
 * than at every call site.
 *
 * The value on every event is the ₹97 start fee. The programme is sold
 * off-page, so reporting a programme value against a ninety-seven rupee charge
 * would teach the ad account to buy revenue that never reached Razorpay.
 */

const VALUE = site.feeInr;

/* GA4 only. The item name never reaches Meta: see lib/meta-capi.ts. */
const ITEM: Ga4Item = {
  item_id: GA4_ITEM_ID,
  item_name: PRODUCT_LABEL,
  price: VALUE,
  quantity: 1,
};
const money = { value: VALUE, currency: 'INR', items: [ITEM] };

type Person = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  /** ISO 3166-1 alpha-2, from the checkout's country picker. */
  country?: string;
  occupation?: string;
};

/** Fire-and-forget: analytics must never block or fail a click. */
function capi(eventName: string, person: Person = {}) {
  const s = collectSignals();
  try {
    void fetch('/api/meta/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventName, ...s, ...person }),
      keepalive: true, // survives the navigation a CTA click causes
    });
  } catch {
    /* ignore */
  }
}

/** Landing page: the offer has been seen. Once per SESSION. */
export function trackViewItem() {
  once('view_item', () => {
    capi('ViewContent');
    ga4ViewItem(money);
  });
}

/**
 * Checkout ARRIVAL, named for the Meta event it sends. It fires from the
 * checkout's MOUNT and nowhere else. Do not move it onto a CTA click listener:
 * a reader who taps two of the six lockups counts twice, which inflates
 * AddToCart volume and deflates the cost-per-AddToCart the ads are judged on.
 */
export function trackAddToCart() {
  capi('AddToCart');
  ga4AddToCart(money);
}

/** The checkout page has loaded. GA4's half of the arrival. */
export function trackBeginCheckout() {
  ga4BeginCheckout(money);
}

/**
 * Details valid and the sheet is opening. InitiateCheckout does NOT fire on
 * page load: a page-load IC makes Meta buy people who land rather than people
 * who try to pay.
 *
 * QualifiedLead goes out as its OWN capi() call. Meta dedupes on event_name
 * plus event_id and the route derives a different id per name, so two calls
 * give two events and no collision. Only the qualifying answer gets one: an
 * audience containing both cannot be targeted as one.
 */
export function trackInitiateCheckout(person: Person) {
  capi('InitiateCheckout', person);
  if (person.occupation === 'working_professional') {
    capi('QualifiedLead', person);
  }
  ga4AddPaymentInfo({ value: VALUE, currency: 'INR' });
}

/** GA4 only. Meta's Purchase comes from the webhook, where the payment is
 *  proven; firing it here too would double-count every sale. */
export function trackPurchase(transactionId: string) {
  /* Keyed on the payment id, not a fixed string: a refresh or a back-forward
     must not count the sale twice, but a genuine second purchase must still
     count. */
  once(`purchase_${transactionId}`, () => {
    ga4Purchase({ transactionId, ...money });
  });
}

/**
 * Booked. From Cal's `bookingSuccessful` callback and nowhere else.
 *
 * The payment is not the outcome of this funnel, the booking is: a buyer who
 * pays and never books is the waste this event makes visible. NO VALUE, because
 * the fee was counted on Purchase and sending it again doubles the revenue
 * attributed to one sale.
 */
export function trackSchedule(paymentId: string) {
  once(`schedule_${paymentId || 'anon'}`, () => {
    capi('Schedule', {});
    ga4GenerateLead({ value: 0, currency: 'INR' });
  });
}
