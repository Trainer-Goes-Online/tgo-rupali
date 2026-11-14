'use client';

/**
 * /checkout  ·  the ₹97 start.
 *
 * Built to the house checkout anatomy: a header with a way back, a centred
 * masthead, then a two-column body with the form on the left and a STICKY
 * order summary on the right that becomes a compact card above the form on a
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

import { business, bumpLabel, feeLabel, inrLabel, site } from '@/lib/site';
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
  CardIcon,
  CheckIcon,
  LockIcon,
  ShieldCheckIcon,
  StarIcon,
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

/* THE BUMP OFFER. Copy as supplied by the client; the price comes from
   NEXT_PUBLIC_BUMP_FEE via lib/site.ts and is re-derived on the server, so the
   browser only ever says yes or no. */
const BUMP_TITLE = '4 Fertility Guides';
const BUMP_HEADLINE = '4 ready-to-use guides to support your fertility journey.';
/* Names match the PDFs the buyer downloads (FitWithRupali_Guide1..4), so the
   checkout, the confirmation email and the files all say the same thing. */
type GuideIcon = 'foods' | 'kitchen' | 'tea' | 'his';
const BUMP_ITEMS: { title: string; sub: string; icon: GuideIcon }[] = [
  {
    title: 'The Fertility Food Blueprint',
    sub: 'Everyday foods to support hormones & preconception health',
    icon: 'foods',
  },
  { title: 'The Fertility Kitchen', sub: '5 simple meals & snacks for busy days', icon: 'kitchen' },
  { title: 'Sip & Nourish', sub: '5 easy teas with everyday ingredients', icon: 'tea' },
  {
    title: 'His Fertility Blueprint',
    sub: 'Simple food & lifestyle habits for your partner',
    icon: 'his',
  },
];

/**
 * One small two-tone icon per guide: forest line work, a raspberry or lime
 * accent, all from theme tokens. 24-unit grid, drawn at 22px in the bump card.
 */
function GuideGlyph({ name }: { name: GuideIcon }) {
  const line = {
    stroke: 'var(--brand-deep)',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (name) {
    /* A bowl of greens with berries: the food blueprint. */
    case 'foods':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <path d="M6.6 10.8c-.7-2.1.6-4 2.6-4.1.5-1.7 2.5-2.5 4-1.6 1.6-.6 3.4.4 3.6 2.1 1.5.4 2.2 2 1.7 3.6" fill="var(--leaf)" stroke="var(--brand)" strokeWidth="1.3" strokeLinejoin="round" />
          <circle cx="10" cy="9.4" r="1.2" fill="var(--action)" />
          <circle cx="14.6" cy="8.6" r="1" fill="var(--action-bright)" />
          <path d="M3.5 11h17a8.5 8.5 0 0 1-17 0Z" fill="var(--bg)" {...line} />
          <path d="M9 19.4h6" fill="none" {...line} />
        </svg>
      );
    /* A cooking pot with steam and a leaf on the lid: the kitchen. */
    case 'kitchen':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <path d="M9 2.8c-.9 1 .9 1.8 0 2.8M12.5 2.4c-.9 1 .9 1.8 0 2.8" stroke="var(--action)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M4 8.6h16" fill="none" {...line} />
          <path d="M10.6 8.6V7.4a1.4 1.4 0 0 1 2.8 0v1.2" fill="none" {...line} />
          <path d="M5 10.6h14v5.6a3.6 3.6 0 0 1-3.6 3.6H8.6A3.6 3.6 0 0 1 5 16.2Z" fill="var(--bg)" {...line} />
          <path d="M5 12.4H2.8M19 12.4h2.2" fill="none" {...line} />
          <path d="M14.4 12.6c-2.6 0-3.8 1.7-3.8 4 2.3 0 3.8-1.3 3.8-4Z" fill="var(--leaf)" stroke="var(--brand)" strokeWidth="1.1" strokeLinejoin="round" />
        </svg>
      );
    /* A teacup with steam and a leaf on the saucer side. */
    case 'tea':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <path d="M8.5 3.2c-.9 1 .9 1.8 0 2.8M12 2.6c-.9 1 .9 1.8 0 2.8" stroke="var(--action)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          <path d="M4 8.5h12v4.2A5.5 5.5 0 0 1 10.5 18.2h-1A5.5 5.5 0 0 1 4 12.7Z" fill="var(--bg)" {...line} />
          <path d="M16 10h1.4a2.3 2.3 0 0 1 0 4.6H15.6" fill="none" {...line} />
          <path d="M3 20.6h14" fill="none" {...line} />
          <path d="M21.4 15.2c-3.4 0-4.8 2.2-4.8 5.2 3 0 4.8-1.6 4.8-5.2Z" fill="var(--leaf)" stroke="var(--brand)" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M5.2 11.2h9.6" stroke="var(--brand-soft)" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    /* The male symbol with a leaf inside: his fertility blueprint. */
    case 'his':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          <circle cx="10" cy="14" r="6.4" fill="var(--bg)" {...line} />
          <path d="M14.6 9.4 20.4 3.6M15.2 3.6h5.2v5.2" fill="none" {...line} />
          <path d="M13 11c-3.6 0-5.2 2.3-5.2 5.4 3.2 0 5.2-1.7 5.2-5.4Z" fill="var(--leaf)" stroke="var(--brand)" strokeWidth="1.1" strokeLinejoin="round" />
          <path d="M7.9 16.3c1.4-1.6 2.8-2.8 4.3-3.7" stroke="var(--brand-deep)" strokeWidth="1" strokeLinecap="round" fill="none" />
        </svg>
      );
  }
}

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
  /* Off by default: a pre-ticked add-on is a chargeback waiting to happen. */
  const [bump, setBump] = useState(false);
  const totalLabel = inrLabel(site.feeInr + (bump ? site.bumpInr : 0));

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
          bump,
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
        description: bump ? `${START_TITLE} + ${BUMP_TITLE}` : START_TITLE,
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

                {/* A div, not a label: a label re-clicks the button inside it,
                    which would reopen the list right after a pick. */}
                <div>
                  <span className="f-label" id="occ-label">You are currently</span>
                  <ThemedSelect
                    labelId="occ-label"
                    placeholder="Please choose"
                    options={OCCUPATIONS}
                    value={f.occupation}
                    onChange={(x) => setF((s) => ({ ...s, occupation: x }))}
                    bad={touched && !v.occupation}
                  />
                  <span className="f-note">
                    So your plan is built around the hours you actually have.
                  </span>
                </div>
              </div>

              <BumpOffer on={bump} onChange={setBump} />

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
                {busy ? <span>Taking you to payment</span> : <CtaLabel total={totalLabel} />}
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
              <OrderSummary bump={bump} onRemoveBump={() => setBump(false)} total={totalLabel} />
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
        {/* The same bump state as the card in the form, so ticking either
            ticks both and the total below moves with it. */}
        <label className={`pay-stuck-bump${bump ? ' is-on' : ''}`}>
          <input type="checkbox" checked={bump} onChange={(e) => setBump(e.target.checked)} />
          <span>
            <b>Add {BUMP_TITLE}</b> &middot; +{bumpLabel}
          </span>
        </label>
        <div className="pay-stuck-inner">
          <span className="pay-stuck-fig">
            <span className="pay-stuck-cap">Total due today</span>
            <strong>{totalLabel}</strong>
          </span>
          <button type="submit" form="pay-form" className="pay-stuck-go" disabled={busy}>
            {busy ? <span>Taking you to payment</span> : <CtaLabel total={totalLabel} />}
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
 * Below 1000px: the eyebrow, the lead item and the scope note only.
 */
function OrderSummary({
  bump,
  onRemoveBump,
  total,
}: {
  bump: boolean;
  onRemoveBump: () => void;
  total: string;
}) {
  return (
    <div className="sum">
      <div>
        <p className="pay-eyebrow">ORDER SUMMARY</p>
        <span className="sum-title">What you are paying for</span>
      </div>

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

      {bump && (
        <div className="sum-lead sum-bump">
          <span className="sum-bump-chip" aria-hidden>
            <GuidesIcon />
          </span>
          <span className="sum-lead-body">
            <b>{BUMP_TITLE}</b>
            <span>
              One-time add-on &middot;{' '}
              <button type="button" className="sum-bump-remove" onClick={onRemoveBump}>
                Remove
              </button>
            </span>
          </span>
          <span className="sum-lead-price">{bumpLabel}</span>
        </div>
      )}

      <div className="sum-details">
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
        <span className="sum-total-fig">{total}</span>
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
 * The add-on's thumbnail: a stack of four guide booklets with a leaf on the
 * front cover. Forest pages, raspberry spine, lime leaf, all read from the
 * theme tokens so it re-themes with the page.
 */
function GuidesIcon() {
  return (
    <svg viewBox="0 0 48 48" width="34" height="34" fill="none" aria-hidden>
      {/* the three booklets behind, fanned */}
      <rect x="17" y="6" width="22" height="29" rx="3" transform="rotate(10 28 20)" fill="var(--brand-soft)" stroke="var(--brand)" strokeWidth="1.6" />
      <rect x="14" y="8" width="22" height="29" rx="3" transform="rotate(4 25 22)" fill="var(--bg)" stroke="var(--brand)" strokeWidth="1.6" />
      <rect x="11" y="11" width="22" height="29" rx="3" transform="rotate(-3 22 25)" fill="var(--bg)" stroke="var(--brand)" strokeWidth="1.6" />
      {/* the front booklet */}
      <g transform="rotate(-8 20 28)">
        <rect x="8" y="14" width="22" height="29" rx="3" fill="var(--bg)" stroke="var(--brand-deep)" strokeWidth="1.8" />
        <rect x="8" y="14" width="4.5" height="29" rx="2" fill="var(--action)" />
        <path d="M24.5 21c-5.5 0-8 3.6-8 8.6 4.9 0 8-2.7 8-8.6Z" fill="var(--leaf)" stroke="var(--brand)" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M16.6 29.6c2.2-2.6 4.4-4.4 6.6-5.8" stroke="var(--brand-deep)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M15.5 35.5h10M15.5 38.5h7" stroke="var(--brand-ring)" strokeWidth="1.6" strokeLinecap="round" />
      </g>
      {/* the count */}
      <circle cx="38" cy="38" r="7" fill="var(--action)" stroke="var(--bg)" strokeWidth="1.8" />
      <text x="38" y="41.4" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#fff" fontFamily="var(--fb)">4</text>
    </svg>
  );
}

/* No list price on this offer, so the fee stands alone: no strike, no % off.
   The figure is the live total, so it moves with the add-on. */
function CtaLabel({ total }: { total: string }) {
  return <span>Book My Consultation Now - {total}</span>;
}

/**
 * THE BUMP OFFER. One card, one decision: the footer bar is the toggle and
 * the summary's "Remove" undoes it. Unticked by default.
 */
function BumpOffer({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`bump${on ? ' is-on' : ''}`}>
      <span className="bump-badge">
        <StarIcon size={11} />
        Recommended
      </span>
      <div className="bump-body">
        <div className="bump-top">
          <span className="bump-eyebrow">One-time add-on</span>
          <span className="bump-price">+ {bumpLabel}</span>
        </div>
        <p className="bump-head">{BUMP_HEADLINE}</p>
        <ul className="bump-list">
          {BUMP_ITEMS.map((it) => (
            <li key={it.title}>
              <span className="bump-ico" aria-hidden>
                <GuideGlyph name={it.icon} />
              </span>
              <span>
                <b>{it.title}</b>
                <span>{it.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <label className="bump-toggle">
        <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
        <span>
          {on ? `Added to your order · ${bumpLabel}` : `Tap to add for ${bumpLabel} more`}
        </span>
      </label>
    </div>
  );
}

/**
 * A themed single-choice dropdown. A native <select>'s open list is drawn by
 * the OS and ignores CSS, so this is a button + listbox following the ARIA
 * select-only combobox pattern: arrows / Home / End move, Enter or Space
 * picks, Escape and outside clicks close.
 */
function ThemedSelect({
  labelId,
  placeholder,
  options,
  value,
  onChange,
  bad,
}: {
  labelId: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  bad: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = `${labelId}-list`;
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const openAt = () => {
    const i = options.findIndex((o) => o.value === value);
    setActive(i < 0 ? 0 : i);
    setOpen(true);
  };
  const pick = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openAt();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(active);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className={`tsel${open ? ' is-open' : ''}`} ref={root}>
      <button
        type="button"
        role="combobox"
        className={`tsel-btn${current ? '' : ' is-empty'}`}
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={bad || undefined}
        onClick={() => (open ? setOpen(false) : openAt())}
        onKeyDown={onKey}
      >
        <span>{current ? current.label : placeholder}</span>
        <span className="tsel-caret" aria-hidden />
      </button>
      {open && (
        <ul className="tsel-list" role="listbox" id={listId} aria-labelledby={labelId}>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`tsel-opt${i === active ? ' is-active' : ''}`}
              onPointerEnter={() => setActive(i)}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => pick(i)}
            >
              <span>{o.label}</span>
              {o.value === value && (
                <span className="tsel-tick" aria-hidden>
                  <CheckIcon size={12} />
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
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
