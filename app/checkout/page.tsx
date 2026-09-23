'use client';

/**
 * /checkout  ·  the ₹97 start.
 *
 * Built to the house checkout anatomy: a header with a way back, a centred
 * masthead, then a two-column body with the form on the left and a STICKY
 * order summary on the right that collapses into a tap-to-open accordion on a
 * phone. It declares no colour of its own: everything comes from :root via
 * app/checkout.css.
 *
 * ⚠️ WHAT THE ₹97 BUYS IS NOT IN THE SOURCE COPY. Every string describing it
 * comes from lib/offer.ts, where it is a visible placeholder, and the pending
 * banner at the top of this page renders until those are filled. Nothing here
 * invents a product name, a scope or a second price.
 *
 * THE FLOW:
 *   mount            -> trackBeginCheckout() + trackAddToCart()
 *   submit           -> trackInitiateCheckout({...}) (+ QualifiedLead)
 *                    -> POST /api/razorpay/create-order  (signals into notes)
 *                    -> new window.Razorpay({...}).open()
 *   handler(payment) -> redirect to /book-a-call?p=<payment_id>
 *
 * The Razorpay `handler` ONLY NAVIGATES. It fires no Purchase: the webhook
 * owns that, because a UPI payer finishes inside their bank app and never
 * returns to this tab.
 */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { business, feeLabel } from '@/lib/site';
import {
  OFFER_PENDING,
  PROGRAMME_TITLE,
  START_COVERS,
  START_SCOPE,
  START_TITLE,
} from '@/lib/offer';
import { collectSignals } from '@/lib/client-signals';
import {
  trackAddToCart,
  trackBeginCheckout,
  trackInitiateCheckout,
} from '@/lib/track';
import { asset } from '@/components/shared/asset-version';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { PaymentLogos } from '@/components/shared/PaymentLogos';
import {
  AlertIcon,
  ArrowRightIcon,
  CaretDownIcon,
  CardIcon,
  CheckIcon,
  LockIcon,
  ShieldCheckIcon,
} from '@/components/shared/icons';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RZP_SDK = 'https://checkout.razorpay.com/v1/checkout.js';

/* Loaded on demand rather than in the layout: roughly 100KB that only matters
   once someone actually presses pay. */
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RZP_SDK}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const el = document.createElement('script');
    el.src = RZP_SDK;
    el.async = true;
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

/* Dial codes carry the ISO-2 alongside them, because Meta's CAPI wants the
   COUNTRY as a hashed ISO 3166-1 alpha-2 code and not a dial code.

   India first, then the countries the client's own copy names: "2,000+ women
   across India, USA, Canada, UK, Australia & the Middle East". The Gulf states
   are listed individually because "Middle East" is not a dial code. */
const COUNTRIES: { iso: string; dial: string; label: string }[] = [
  { iso: 'in', dial: '+91', label: 'India (+91)' },
  { iso: 'ae', dial: '+971', label: 'UAE (+971)' },
  { iso: 'sa', dial: '+966', label: 'Saudi Arabia (+966)' },
  { iso: 'qa', dial: '+974', label: 'Qatar (+974)' },
  { iso: 'om', dial: '+968', label: 'Oman (+968)' },
  { iso: 'kw', dial: '+965', label: 'Kuwait (+965)' },
  { iso: 'bh', dial: '+973', label: 'Bahrain (+973)' },
  { iso: 'us', dial: '+1', label: 'USA (+1)' },
  { iso: 'ca', dial: '+1', label: 'Canada (+1)' },
  { iso: 'gb', dial: '+44', label: 'UK (+44)' },
  { iso: 'au', dial: '+61', label: 'Australia (+61)' },
  { iso: 'nz', dial: '+64', label: 'New Zealand (+64)' },
  { iso: 'sg', dial: '+65', label: 'Singapore (+65)' },
  { iso: 'my', dial: '+60', label: 'Malaysia (+60)' },
  { iso: 'za', dial: '+27', label: 'South Africa (+27)' },
];

/* THE SEGMENT SPLIT, and the seventh field. It drives QualifiedLead, which
   fires at the same instant as InitiateCheckout for the qualifying half only,
   and it is the one descriptive value allowed into Meta's custom_data because
   neither answer names a condition.

   ⚠️ NOBODY HAS ASKED RUPALI WHICH HALF SHE SELLS TO MOST. The house default
   (working_professional qualifies) is what the route enforces; flipping it is
   one comparison in app/api/meta/event/route.ts plus one in lib/track.ts. */
const OCCUPATIONS = [
  { value: 'working_professional', label: 'Working professional' },
  { value: 'homemaker', label: 'Homemaker' },
] as const;

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string; // ISO-2
  phone: string;
  occupation: string;
};

export default function CheckoutPage() {
  const [f, setF] = useState<Fields>({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    country: 'in',
    phone: '',
    occupation: '',
  });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState('');
  /* The post-payment acknowledgement. It exists because of a real failure mode
     on this exact flow: Razorpay's handler only fires once the sheet has
     settled, and a buyer who closes the tab on seeing "success" never reaches
     /book-a-call. They have paid and have no slot, and the first anyone knows
     is a support message. */
  const [ack, setAck] = useState(false);

  /* ARRIVAL. GA4 gets begin_checkout, Meta gets AddToCart. InitiateCheckout
     deliberately does NOT fire here: it waits until the details are valid and
     the sheet actually opens, which is what the ads optimise on. This is also
     the only Meta event a DIRECT arrival ever gets, so it is ref-guarded
     against StrictMode's double effect. */
  const arrived = useRef(false);
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    trackBeginCheckout();
    trackAddToCart();
  }, []);

  const v = useMemo(() => {
    const digits = f.phone.replace(/\D/g, '');
    return {
      firstName: f.firstName.trim().length > 1,
      lastName: f.lastName.trim().length > 0,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()),
      city: f.city.trim().length > 1,
      /* The dial code comes from the picker, so this validates the SUBSCRIBER
         number only: 7 to 12 digits covers every country in the list without
         pulling in libphonenumber-js. India is the strict case at exactly 10. */
      phone: f.country === 'in' ? digits.length === 10 : digits.length >= 7 && digits.length <= 12,
      occupation: f.occupation !== '',
    };
  }, [f]);
  const valid =
    v.firstName && v.lastName && v.email && v.city && v.phone && v.occupation;

  const dial = COUNTRIES.find((c) => c.iso === f.country)?.dial ?? '+91';
  /* E.164 without the plus, which is what both Meta and Razorpay expect. */
  const e164 = `${dial}${f.phone}`.replace(/\D/g, '');

  const startPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFailed('');
    if (!valid || !ack || busy) return;
    setBusy(true);

    /* Fired BEFORE the sheet opens rather than after payment, because this is
       the moment intent is real: the details are valid and the buyer is
       committing. QualifiedLead goes out from inside this call, for the
       qualifying answer only. */
    trackInitiateCheckout({
      email: f.email.trim(),
      phone: e164,
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      city: f.city.trim(),
      country: f.country,
      occupation: f.occupation,
    });

    try {
      const sdk = await loadRazorpay();
      if (!sdk) throw new Error('sdk');

      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: f.firstName.trim(),
          lastName: f.lastName.trim(),
          email: f.email.trim(),
          phone: e164,
          city: f.city.trim(),
          country: f.country,
          occupation: f.occupation,
          /* Sent SEPARATELY from the phone, which goes up as full E.164.
             Pabbly gets its own dial_code column, so a workflow can route on
             the country without parsing a number back apart. */
          dialCode: dial,
          ...collectSignals(),
        }),
      });
      const order = await res.json();

      if (!res.ok || !order?.ok) {
        setBusy(false);
        setFailed(
          order?.reason === 'not-configured'
            ? 'Payments are not switched on yet. Nothing has been charged.'
            : 'We could not start the payment. Please try again.',
        );
        return;
      }

      const rzp = new window.Razorpay!({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        /* The REGISTERED name, not a brand nickname. This is what appears in
           the payment sheet and on the buyer's card statement, and a mismatch
           between the two is a chargeback reason on its own. */
        name: business.registeredName,
        /* ⚠️ NO SQUARE BRAND MARK SUPPLIED. Razorpay renders `image` inside an
           iframe served from its own domain, so it must be an ABSOLUTE url or
           it resolves against checkout.razorpay.com and 404s into a blank
           tile. The key is omitted rather than pointed at a file that does not
           exist. Drop a square logo at /public/brand/rupali-square.jpg, bump
           ASSET_V, and add:
             image: `${window.location.origin}${asset('/brand/rupali-square.jpg')}`
           The existing /public/brand/fit-with-rupali-logo.png will not do: it
           has a white ground the landing page blends away with mix-blend-mode,
           which an iframe on another origin cannot do. */
        description: START_TITLE,
        prefill: {
          name: `${f.firstName.trim()} ${f.lastName.trim()}`.trim(),
          email: f.email.trim(),
          contact: e164,
        },
        /* Raspberry, read from the stylesheet rather than hardcoded, so the
           sheet follows a re-theme like everything else. Razorpay wants a
           literal hex, which is the one place a token cannot be passed
           through. */
        theme: { color: readToken('--action', '#C0084A') },
        modal: { ondismiss: () => setBusy(false) },
        /* Purchase is NOT fired here. The webhook owns it, so a UPI payer who
           finishes in their bank app and never returns is still counted. */
        handler: (r: { razorpay_payment_id: string }) => {
          window.location.href = `/book-a-call?p=${encodeURIComponent(r.razorpay_payment_id)}`;
        },
      });
      rzp.open();
    } catch {
      setBusy(false);
      setFailed('We could not start the payment. Please try again.');
    }
  };

  return (
    <div className="rn-pay">
      {/* The VSL blueprint's first checkout element: charcoal trust strip,
          three icon items separated by dots. Reassurance before navigation,
          at the moment a card number is about to be typed. */}
      <div className="checkout-announce" role="region" aria-label="Checkout trust">
        <span className="checkout-announce-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secure Checkout
        </span>
        <span className="checkout-announce-dot" aria-hidden />
        <span className="checkout-announce-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2l8 3v7c0 4.97-3.35 9.26-8 10-4.65-.74-8-5.03-8-10V5l8-3z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          1:1 With Dt. Rupali Nayak
        </span>
        <span className="checkout-announce-dot" aria-hidden />
        <span className="checkout-announce-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Razorpay Verified · 256-bit SSL
        </span>
      </div>

      <section className="pay-body">
        <div className="wrap">
          {OFFER_PENDING && (
            <div className="pay-pending" role="note">
              <b>Pre-launch · not ready to take money</b>
              <p>
                What this {feeLabel} buys has not been supplied by Fit With
                Rupali, so this page is showing placeholders where the
                description of it should be. Fill <code>lib/offer.ts</code> and
                this banner disappears.
              </p>
            </div>
          )}

          <div className="pay-mast">
            <span className="pay-pill">
              <ShieldCheckIcon size={13} />
              100% Money-Back Guarantee
            </span>
            <h1>
              Start your <em>personalised</em> fertility plan
            </h1>
            <p className="pay-deck">
              Your details go to Dt. Rupali Nayak so she can start from your
              actual situation rather than assumptions.
            </p>
          </div>

          <div className="pay-grid">
            {/* id is load-bearing: the mobile docked bar lives OUTSIDE this
                form (it has to, to be position:fixed against the viewport
                without the form's stacking context) and submits it by
                `form="pay-form"`. That routes it through the same
                startPayment, the same validation and the same busy guard, so
                there is one payment path and not two to keep in step. */}
            <form id="pay-form" className="pay-card" onSubmit={startPayment} noValidate>
              <p className="pay-eyebrow">YOUR DETAILS</p>
              <h2>Where should we reach you?</h2>
              <p className="pay-hint">
                Rupali&rsquo;s team uses these to arrange your booking and to
                send you the receipt.
              </p>

              {/* THE ONE INSTRUCTION THAT HAS TO LAND BEFORE PAYMENT. It sits
                  ABOVE the fields, not beside the button: by the time someone
                  is on the button they are committing, and this is a thing
                  they need to know while they still have attention for it.
                  Razorpay's handler is what navigates to /book-a-call, so the
                  gap between "payment succeeded" and "calendar opens" is real
                  and a closed tab lands a paid buyer with no slot. */}
              <div className="pay-note" role="note">
                <span className="pay-note-chip" aria-hidden>
                  <AlertIcon size={13} />
                </span>
                <p>
                  <strong>
                    Important: please don&rsquo;t close this page after paying.
                  </strong>{' '}
                  The moment your payment succeeds, please wait up to{' '}
                  <strong>10 seconds</strong> without closing or refreshing this
                  tab. You&rsquo;ll then be taken automatically to the calendar
                  to pick your <strong>preferred date and time</strong>.{' '}
                  <strong>
                    Leaving early may stop your booking from being completed.
                  </strong>
                </p>
              </div>

              <div className="pay-fields">
                {/* First and last are SEPARATE fields, not one "Full name"
                    split on a space. Splitting guesses: it hands a two-word
                    surname to the first name, and gives a single-word entry no
                    last name at all. Meta hashes fn and ln independently, so a
                    bad guess is a permanently worse match. */}
                <div className="pay-two">
                  <Field
                    label="First name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="First name"
                    value={f.firstName}
                    onChange={(x) => setF((s) => ({ ...s, firstName: x }))}
                    bad={touched && !v.firstName}
                  />
                  <Field
                    label="Last name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={f.lastName}
                    onChange={(x) => setF((s) => ({ ...s, lastName: x }))}
                    bad={touched && !v.lastName}
                  />
                </div>

                <Field
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={f.email}
                  onChange={(x) => setF((s) => ({ ...s, email: x }))}
                  bad={touched && !v.email}
                  note="Your receipt and booking details go here."
                />

                {/* City and country are on this form because they are Meta
                    match keys (ct and country), and city hashing strips spaces
                    and punctuation, so "New Delhi" and "newdelhi" hash the
                    same. Every field here is here to be SENT, not to be
                    collected. */}
                <Field
                  label="Town / City"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Your town or city"
                  value={f.city}
                  onChange={(x) => setF((s) => ({ ...s, city: x }))}
                  bad={touched && !v.city}
                />

                <label>
                  <span className="f-label">WhatsApp number</span>
                  <div className="pay-phone">
                    <select
                      autoComplete="tel-country-code"
                      aria-label="Country dialling code"
                      value={f.country}
                      onChange={(e) => setF((s) => ({ ...s, country: e.target.value }))}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.iso} value={c.iso}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="98XXX XXXXX"
                      value={f.phone}
                      onChange={(e) => setF((s) => ({ ...s, phone: e.target.value }))}
                      aria-invalid={(touched && !v.phone) || undefined}
                    />
                  </div>
                  <span className="f-note">
                    Rupali&rsquo;s team will contact you on this number.
                  </span>
                </label>

                <label>
                  <span className="f-label">You are currently</span>
                  <select
                    value={f.occupation}
                    onChange={(e) => setF((s) => ({ ...s, occupation: e.target.value }))}
                    aria-invalid={(touched && !v.occupation) || undefined}
                  >
                    <option value="">Please choose</option>
                    {OCCUPATIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <span className="f-note">
                    So your plan is built around the hours you actually have.
                  </span>
                </label>
              </div>

              {/* The same promise as the note above, asked for rather than
                  told, at the moment of paying. Its own line of error text and
                  not the fields' one: "add your name and a valid number" is
                  useless feedback to someone whose only miss is the tick. */}
              <label className="pay-ack">
                <input
                  type="checkbox"
                  checked={ack}
                  onChange={(e) => setAck(e.target.checked)}
                  aria-invalid={(touched && !ack) || undefined}
                />
                <span>
                  I understand that after payment, I&rsquo;ll wait up to{' '}
                  <strong>10 seconds</strong> for the booking page to open, then
                  pick my preferred date and time.
                </span>
              </label>

              {touched && !valid && (
                <p className="pay-error">
                  Please add your name, a working email, your city, a valid
                  number and choose one option.
                </p>
              )}
              {touched && valid && !ack && (
                <p className="pay-error">
                  Please tick the box above so we know to expect you on the
                  booking page.
                </p>
              )}
              {failed && <p className="pay-error">{failed}</p>}

              <button type="submit" className="pay-cta" disabled={busy}>
                <span>{busy ? 'Taking you to payment' : `Pay ${feeLabel} & Continue`}</span>
                <span className="arrow" aria-hidden>
                  <ArrowRightIcon size={13} />
                </span>
              </button>

              {/* THE THREE POINTERS. House standard under every checkout CTA.
                  The third is a LINK to the refund policy rather than the
                  refund line in words, because whether the ₹97 is refundable
                  is one of the commercial facts nobody has confirmed. Writing
                  "fully refundable" or "non-refundable" here would invent a
                  term the client has not agreed. */}
              <div className="pay-points">
                <span>
                  <LockIcon />
                  Razorpay Secured
                </span>
                <span className="sep" aria-hidden>
                  &middot;
                </span>
                <span>SSL Encrypted</span>
                <span className="sep" aria-hidden>
                  &middot;
                </span>
                <span>
                  <Link href="/refund">Refund &amp; cancellation policy</Link>
                </span>
              </div>

              <p className="pay-privacy">
                Your personal data is used to process this payment, to arrange
                your booking, and for the purposes described in our{' '}
                <Link href="/privacy">privacy policy</Link>. Your health
                information is handled under the same policy.
              </p>

              <div className="pay-methods">
                <span className="pay-methods-label">100% secure and safe payments</span>
                <PaymentLogos />
              </div>
            </form>

            <div className="pay-sum-col">
              <OrderSummary />
            </div>
          </div>
        </div>
      </section>

      {/* ── THE MOBILE DOCKED BAR ────────────────────────────────────────
          Below 1000px the layout is one column and the summary column stops
          being sticky, so the price and the action both scroll away while
          the fields are being filled. This puts them back. It is NOT the
          landing page's StickyCta: that bar's job is to send someone to
          /checkout, which is where this reader already is. */}
      <div className="pay-stuck" aria-hidden={busy ? true : undefined}>
        <div className="pay-stuck-inner">
          <span className="pay-stuck-fig">
            <span className="pay-stuck-cap">Total due today</span>
            <strong>{feeLabel}</strong>
          </span>
          <button type="submit" form="pay-form" className="pay-stuck-go" disabled={busy}>
            <span>{busy ? 'Taking you to payment' : 'Pay & book'}</span>
            <span className="arrow" aria-hidden>
              <ArrowRightIcon size={12} />
            </span>
          </button>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

/**
 * Read a CSS custom property off the document root. Razorpay's sheet takes a
 * literal hex and cannot read a token, and this is the only value on the build
 * that has to leave CSS. Reading it back rather than retyping the hex means a
 * re-theme moves the payment sheet with it.
 */
function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch {
    return fallback;
  }
}

/**
 * THE ORDER SUMMARY. One line item, its real price, and no invented value
 * stack: nothing inside the offer has been priced, and "worth ₹4,500" against
 * an unnamed step would be inventing a client fact on a live sales page.
 *
 * Accordion below 1000px, always open above it. The toggle keeps its
 * aria-expanded on both, because the CSS hides the caret rather than removing
 * the button.
 */
function OrderSummary() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sum">
      <button
        type="button"
        className="sum-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="sum-details"
      >
        <span>
          <span className="sum-kicker">ORDER SUMMARY</span>
          <span className="sum-title">What you are paying for</span>
          <span className="sum-tap">
            {open ? 'Tap to hide the details' : 'Tap to see what is included'}
          </span>
        </span>
        <span className="sum-caret" aria-hidden>
          <CaretDownIcon />
        </span>
      </button>

      <div className="sum-lead">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="sum-lead-chip"
          src={asset('/rupali.jpeg')}
          alt=""
          aria-hidden
          width={52}
          height={52}
        />
        <span className="sum-lead-body">
          <b>{START_TITLE}</b>
          <span>With Dt. Rupali Nayak, clinical dietitian</span>
        </span>
        <span className="sum-lead-price">{feeLabel}</span>
      </div>

      <div id="sum-details" className={open ? 'sum-details open' : 'sum-details'}>
        <p className="sum-sub">WHAT IS INCLUDED</p>
        {START_COVERS.length > 0 ? (
          <ul className="sum-covers">
            {START_COVERS.map((c) => (
              <li key={c}>
                <span className="ck" aria-hidden>
                  <CheckIcon size={10} />
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="sum-tap">
            [TO CONFIRM: the line items this {feeLabel} includes. Nothing is
            listed here until Fit With Rupali supplies them.]
          </p>
        )}
      </div>

      <div className="sum-rule" />

      <div className="sum-total">
        <span className="sum-total-label">Total</span>
        <span className="sum-total-fig">{feeLabel}</span>
      </div>

      <div className="sum-method">
        <CardIcon />
        <span>
          <b>UPI &middot; Cards &middot; NetBanking</b>
          <span>Paid securely through Razorpay.</span>
        </span>
      </div>

      {/* THE SCOPE LINE, and the most load-bearing sentence on this page. The
          likeliest chargeback on this funnel is a buyer who pays ₹97 and
          believes they have joined the 90-day programme. It is a placeholder
          because the client has not said which it is. */}
      <div className="sum-scope">
        <b>What this {feeLabel} covers</b>
        <p>{START_SCOPE}</p>
        <p>
          The {PROGRAMME_TITLE} itself is described on the previous page and is
          priced separately.
        </p>
      </div>
    </div>
  );
}

/**
 * One field. Kept as a component so every input carries the same label
 * treatment, the same error state and the same focus ring, and so a new field
 * cannot be added with a different one.
 */
function Field({
  label,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  bad,
  note,
}: {
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  bad: boolean;
  note?: string;
}) {
  return (
    <label>
      <span className="f-label">{label}</span>
      <input
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={bad || undefined}
      />
      {note && <span className="f-note">{note}</span>}
    </label>
  );
}
