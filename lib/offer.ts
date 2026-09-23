/**
 * WHAT IS BEING SOLD, in one place, read by the checkout, the booking page and
 * the thank-you page.
 *
 * The ₹97 is defined by the client's Refund Policy of 13 Sep 2026: a one-time,
 * non-refundable booking fee for an initial 1:1 consultation, separate from
 * the 90-day programme. Wording below follows that document.
 */

/** Flip to false only when every PENDING_ value below has been replaced. */
export const OFFER_PENDING = false;

/* ── FROM THE CLIENT'S REFUND POLICY, 13 Sep 2026 ───────────────────── */

/** The checkout's line item and the payment sheet. */
export const START_TITLE = 'Initial 1:1 Consultation';

/** The policy states what the fee is and is not. Nothing here is invented. */
export const START_COVERS: string[] = [
  'A one-time booking fee that secures your consultation slot',
  'Your starting point assessed across your fertility history, reports, hormones, cycle and lifestyle',
  'The fertility health markers your 90-day programme would work towards, agreed with you',
];

/** Refund Policy clause 1, in the buyer's direction of reading. */
export const START_SCOPE =
  'The ₹97 is a one-time booking fee for your initial 1:1 consultation. Because it secures your slot, it is non-refundable. It is separate from the 90-day programme, which you may choose to enrol into after your consultation and which carries its own Money-Back Guarantee.';

/* THE PROGRAMME FEE IS DELIBERATELY NOT HERE (Atul, 23 Sep 2026: "we never
   tell the program fee in the vsl"). This site sells ONE thing, the ₹97
   consultation. The 90-day programme is priced and sold on the call, so its
   fee is not a missing value to chase, and nothing on any surface should
   print one or leave a gap where one would go. */

/* THE NEUTRAL LABEL, for Razorpay's sheet, the GA4 item and the Pabbly record.
   It never reaches Meta (see lib/meta-capi.ts) and it is kept separate from
   START_TITLE so that filling that in cannot push a fertility term into a
   tracked payload. */
export const PRODUCT_LABEL = 'Personalised Plan Booking';
export const GA4_ITEM_ID = 'rupali-start';

/* ── CLIENT'S OWN WORDS · verbatim from funnel-copy/01-landing-vsl.md ──── */

export const PROGRAMME_TITLE = '90-Day Fertility Programme';

/** Section 7's six headings, in the source's own order and wording. */
export const PROGRAMME_COMPONENTS = [
  'Complete Fertility & Health Assessment',
  'Bloodwork & Report Review',
  'Personalised Fertility Nutrition Plan',
  '2-Weeks Progress Reviews & Plan Adjustments',
  'Direct Accountability & Ongoing Support',
  'Male Fertility + Couple Support When Needed',
] as const;

/** The guarantee beat's own headline. */
export const GUARANTEE_TERMS =
  'Improve Your Agreed Fertility Health Markers In 90 Days. Or Get Your Money Back.';

/** "What We Ask In Return", the four ✓ rows, verbatim. */
export const GUARANTEE_ASKS = [
  'Your starting point is assessed on Day 1.',
  'Your 90-day plan is built around your baseline.',
  'You follow the programme consistently.',
  'Your progress is tracked throughout the 90 days.',
] as const;

/** FAQ 3, verbatim. The one sentence every medical-adjacent surface repeats. */
export const ALONGSIDE_MEDICAL_CARE =
  'The programme is meant to work alongside your existing medical care, not replace it.';
