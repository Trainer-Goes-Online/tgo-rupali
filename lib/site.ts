/**
 * Central site config for the funnel.
 *
 * SINGLE-SOURCE PRICE LAW: `site.feeInr` is the only declaration of a price
 * in this codebase. The credibility table's "₹97 To Start" renders from it,
 * and LAUNCH's checkout, Razorpay amount and every Meta / GA4 `value` must
 * read the derived values below rather than typing the number again.
 *
 * The guard is `Number(x ?? '97') || 97`: a .env.local copied from
 * .env.example ships the key present but BLANK, and Number('') is 0, which
 * would advertise a zero fee with nothing throwing anywhere.
 *
 * The var is NEXT_PUBLIC_START_FEE, not NEXT_PUBLIC_PROGRAMME_FEE: ₹97 is
 * the copy's "To Start" figure, and the 90-day programme fee is a separate
 * number nobody has supplied. See lib/offer.ts.
 *
 * LAUNCH extends this file (footer, policy pages, Razorpay's merchant
 * review). The `business` block below is client-supplied 2026-09-19,
 * verbatim; the first phone and email in each list are primary.
 */
export const business = {
  registeredName: 'FITWITHRUPALI',
  tradingName: 'FitWithRupali',
  address:
    'Qr No. 1A, FitWithRupali, Street 9, Sector 4, Block A, Bhilai, District Durg, Chhattisgarh – 490001',
  phones: ['8959892666', '9817949302'],
  emails: ['nutritionist.rupali2403@gmail.com', 'fitwithrupali1@gmail.com'],
  jurisdictionState: 'Chhattisgarh',
};

/**
 * DERIVED CONTACT VALUES. The client supplied two phones and two emails; the
 * first of each is primary and is the one every surface shows. wa.me and
 * tel: want different shapes of the same number, so both are built here
 * rather than re-typed per page.
 */
export const phonePrimary = business.phones[0];
export const phoneSecondary = business.phones[1];
export const phonePrimaryE164 = `+91${business.phones[0].replace(/\D/g, '')}`;
export const phoneSecondaryE164 = `+91${business.phones[1].replace(/\D/g, '')}`;
export const emailPrimary = business.emails[0];
export const emailSecondary = business.emails[1];

/** Client-supplied, already a single line. Used by the footer and the legal pages. */
export const addressLine = business.address;

export const site = {
  /** LAUNCH's half of the funnel; every CTA on the landing page links here. */
  checkoutUrl: '/checkout',
  feeInr: Number(process.env.NEXT_PUBLIC_START_FEE ?? '97') || 97,
  /** The copy's "OFFER ENDS IN : TIMER OF 5 HOURS". */
  offerHours: 5,
};

/** The copy's CTA, verbatim. The same string at every lockup on the page. */
export const CTA_LABEL =
  'Click Here To Get Your Personalised Fertility & Natural Conception Plan';

export const feePaise = site.feeInr * 100;
export const feeLabel = `₹${site.feeInr.toLocaleString('en-IN')}`;
