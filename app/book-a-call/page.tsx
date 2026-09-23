'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { SiteFooter } from '@/components/shared/SiteFooter';
import {
  emailPrimary,
  feeLabel,
  phonePrimary,
  phonePrimaryE164,
} from '@/lib/site';
import { START_TITLE } from '@/lib/offer';
import { AlertIcon, WhatsappIcon } from '@/components/shared/icons';
import { trackPurchase, trackSchedule, trackViewItem } from '@/lib/track';

/**
 * THE SIXTH SURFACE · /book-a-call
 *
 *   checkout -> PAYMENT -> /book-a-call?p=<payment_id> -> BOOKING -> /thank-you
 *
 * This is the FIRST page after a payment, which puts two jobs on it:
 *   1. it fires the browser-side GA4 purchase, keyed on the payment id (Meta's
 *      Purchase is unaffected: the Razorpay webhook owns it, so a buyer who
 *      closes the tab here is still counted);
 *   2. it carries the payment id forward, so the thank-you can key on it.
 *
 * The page is NOT a calendar with a heading on it. Its whole job is to turn a
 * PAID buyer into a BOOKED one, because the gap between those two is where a
 * funnel quietly loses the people it already charged.
 *
 * ⚠️ WHAT THE BUYER IS BOOKING IS NOT IN THE SOURCE COPY. There is no call,
 * consultation or session described anywhere in funnel-copy/01-landing-vsl.md,
 * and no duration, so every line here that would describe it reads from
 * lib/offer.ts and is a visible placeholder. The preparation list below is
 * safe because it is the client's own words: the inputs section 7 items 1 and
 * 2 say Rupali reviews before a plan is built.
 */

/* Note for a future move off cal.com: the loader path is not the same on every
   Cal instance (cal.id serves it at /embed-link/embed.js), so check it rather
   than assuming an origin swap is enough. */
const CAL_LINK: string = 'fitwithrupali/1-on-1-fertility-clarity-call';

/** The embed app. The script and `Cal('init')` both use this host. */
const CAL_ORIGIN = 'https://app.cal.com';

/** cal.com namespaces per EVENT, so the namespace IS the slug. */
const CAL_NS = CAL_LINK.split('/')[1] ?? '';

/** The public booking page, for the "calendar not showing?" fallback only. */
const CAL_URL = `https://cal.com/${CAL_LINK}`;

/* Cal's own loader, verbatim from their snippet apart from the url. It defines
   window.Cal as a QUEUE straight away and appends the real script itself,
   which is why nothing here waits on script.onload: calls made before the
   script lands are replayed when it does. */
type CalQueue = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, (...args: unknown[]) => void>;
  q?: unknown[][];
  config?: { forwardQueryParams?: boolean };
};
/* Takes the FULL script url, not an origin: a derived path is a guess that
   silently 404s on the wrong host. */
function loadCal(scriptSrc: string) {
  const C = window as unknown as { Cal?: CalQueue; document: Document };
  const A = scriptSrc;
  const L = 'init';
  const p = (a: { q?: unknown[][] }, ar: unknown[]) => {
    (a.q = a.q || []).push(ar);
  };
  const d = C.document;
  C.Cal =
    C.Cal ||
    function (this: unknown, ...ar: unknown[]) {
      const cal = C.Cal as CalQueue;
      if (!cal.loaded) {
        cal.ns = {};
        cal.q = cal.q || [];
        (d.head.appendChild(d.createElement('script')) as HTMLScriptElement).src = A;
        cal.loaded = true;
      }
      if (ar[0] === L) {
        const api = function (...a: unknown[]) {
          p(api as unknown as { q?: unknown[][] }, a);
        } as unknown as ((...a: unknown[]) => void) & { q?: unknown[][] };
        const namespace = ar[1];
        api.q = api.q || [];
        if (typeof namespace === 'string') {
          cal.ns![namespace] = cal.ns![namespace] || (api as (...a: unknown[]) => void);
          p(cal.ns![namespace] as unknown as { q?: unknown[][] }, ar);
          p(cal as unknown as { q?: unknown[][] }, ['initNamespace', namespace]);
        } else {
          p(cal as unknown as { q?: unknown[][] }, ar);
        }
        return;
      }
      p(cal as unknown as { q?: unknown[][] }, ar);
    };
  return C.Cal as CalQueue;
}

/* Built from lib/site.ts rather than typed, so the number and address here can
   never drift from the ones on the legal pages and in the footer, which are
   the ones Razorpay's merchant review checks. wa.me wants bare digits. */
const WA_DIGITS = phonePrimaryE164.replace(/\D/g, '');

/* Pre-filled so the buyer sends a usable message instead of "hi". The blank
   labels are the four things the team needs to place a slot by hand. */
const RESCUE_WA_TEXT = encodeURIComponent(
  "Hi Rupali, I've paid but none of the listed slots work for me. My details: Name: | Email: | Phone: | Preferred day and time:",
);
const RESCUE_MAILTO = `mailto:${emailPrimary}?subject=${encodeURIComponent(
  'Booking: preferred slot request',
)}&body=${encodeURIComponent('Name:\nEmail:\nPhone:\nPreferred day and time:\n')}`;

/* Inside the calendar card, under the embed: the three things a person
   hesitating over a time slot is actually wondering. Build-written, drawn
   from FAQ 1 of the landing copy. */
const REASSURANCES = [
  [
    'Dt. Rupali Nayak herself',
    'She reviews your reports and builds your plan personally. You are not passed to a coaching team after you pay.',
  ],
  ['Confirmation by email', 'It arrives the moment you book, with the joining details.'],
  ['Reschedule if life happens', 'Your confirmation email carries the link to move your slot.'],
] as const;

/* What to bring. Section 7 items 1 and 2 of the copy list exactly what Rupali
   reviews before a plan is built, so this is her own list, split at her own
   commas and in her own order. Nothing here is a promise about the booking
   itself, which is the part nobody has described. */
const HAVE_READY = [
  {
    title: 'Your blood reports',
    body: 'Blood reports, fertility markers and any relevant scans or ultrasounds. Bring them even if they read as normal.',
  },
  {
    title: 'Your fertility history',
    body: 'Medical concerns, treatments already tried, and your menstrual cycle as it actually runs.',
  },
  {
    title: 'Your day as it is',
    body: 'Lifestyle, food habits, sleep, digestion, activity levels and your current routine.',
  },
] as const;

/* FAQ 1 and FAQ 3 of the landing copy, verbatim. These two are the objections
   that stand between a paid buyer and a booked one. */
const FAQS = [
  {
    q: 'Will I actually be working directly with Dt. Rupali?',
    a: 'Yes. Your journey is personally overseen by Dt. Rupali. She personally reviews your fertility history, health reports, menstrual patterns, current nutrition and lifestyle, builds your plan around your individual starting point, and continues to review and adjust it as you progress through the programme. So you are not joining a generic coaching system or being passed off after enrolment. The strategy and key decisions around your fertility plan come directly from Rupali.',
  },
  {
    q: 'I am already taking medicines or seeing a gynaecologist. Will this interfere with that?',
    a: 'No. The programme is meant to work alongside your existing medical care, not replace it. You should continue prescribed medicines and medical treatment under your doctor’s guidance. Rupali focuses on the nutrition, lifestyle and health factors within her scope while taking your existing reports and medical history into account.',
  },
] as const;

export default function BookACallPage() {
  return (
    <Suspense fallback={null}>
      <BookACall />
    </Suspense>
  );
}

function BookACall() {
  const paymentId = useSearchParams().get('p') ?? '';
  const [state, setState] = useState<'loading' | 'ready' | 'failed' | 'unset'>(
    CAL_LINK ? 'loading' : 'unset',
  );

  /* ── THE EMBED BOOTS ONCE, AND ONLY ONCE ──────────────────────────────
     Cal's `inline` command MOUNTS an embed into #rn-cal. Calling it twice does
     not refresh the first one, it puts a second instance in the same container
     and the two then fight over what it shows: one advances to the questions
     after a slot is tapped, the other re-renders the month view underneath.
     reactStrictMode is on, so in development every effect runs, cleans up and
     runs AGAIN, which is exactly how that shipped on a live page. The ref
     survives StrictMode's remount of the same instance; a genuine unmount gets
     a fresh component, a fresh ref and a correct re-boot. */
  const calBooted = useRef(false);

  /* The success handler is registered once, so it must not close over a stale
     payment id. A ref is read at fire time. */
  const payRef = useRef(paymentId);
  payRef.current = paymentId;

  /* GA4 only, and only with a payment id to key it on. `once()` inside
     trackPurchase means a refresh cannot double count. */
  useEffect(() => {
    if (paymentId) trackPurchase(paymentId);
  }, [paymentId]);

  /* ARRIVAL. A UPI buyer leaves the tab, finishes in a bank app and comes back
     hours later from a WhatsApp link straight onto this page, having touched
     neither the landing page nor a tracker. Without this they are invisible
     until they book.

     It shares the landing page's per-session `view_item` key deliberately: a
     buyer who arrived normally already fired ViewContent this session and must
     not fire a second one, while a direct arrival in a fresh session does.
     Ref-guarded against StrictMode's double effect on top of that. */
  const arrived = useRef(false);
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    trackViewItem();
  }, []);

  useEffect(() => {
    if (!CAL_LINK) return;

    let cancelled = false;
    /* The embed reports nothing on success or failure, so the only honest
       readiness signal is whether an iframe actually appeared in the mount
       point. Polled, then given up on, rather than assumed. */
    const started = Date.now();
    const poll = window.setInterval(() => {
      if (cancelled) return;
      if (document.querySelector('#rn-cal iframe')) {
        setState('ready');
        window.clearInterval(poll);
      } else if (Date.now() - started > 9000) {
        setState('failed');
        window.clearInterval(poll);
      }
    }, 300);

    if (calBooted.current) {
      return () => {
        cancelled = true;
        window.clearInterval(poll);
      };
    }
    calBooted.current = true;

    try {
      const Cal = loadCal(`${CAL_ORIGIN}/embed/embed.js`);
      Cal('init', CAL_NS, { origin: CAL_ORIGIN });

      /* Forwards the PARENT page's query string into the embed, which carries
         ?p=<payment_id> across the seam. The handler below reads the id from a
         ref on our side, so this is belt and braces. */
      Cal.config = Cal.config || {};
      Cal.config.forwardQueryParams = true;

      const ns = Cal.ns![CAL_NS];

      ns('inline', {
        elementOrSelector: '#rn-cal',
        /* On a narrow screen Cal leads with the time list instead of the month
           grid, which is the right first thing to show when the grid would be
           unreadable. */
        config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true' },
        calLink: CAL_LINK,
      });

      ns('ui', {
        /* Raspberry is this funnel's only action colour, so it is the only
           thing inside the embed that should look clickable either. Light is
           forced because the page is white and a dark calendar would drop into
           the middle of it. */
        cssVarsPerTheme: { light: { 'cal-brand': '#C0084A' }, dark: { 'cal-brand': '#C0084A' } },
        theme: 'light',
        hideEventTypeDetails: false,
        layout: 'month_view',
      });

      /* THE HANDOFF. Cal fires this when a booking completes inside the embed,
         and it is the only reliable in-page signal that the buyer actually
         booked. Without it they sit on a confirmed calendar with nowhere to go.

         Belt and braces: a redirect can also be set on the event type in Cal's
         own dashboard. If it is ever set it WINS over this, so point it at the
         same url or leave it empty. */
      ns('on', {
        action: 'bookingSuccessful',
        callback: () => {
          const id = payRef.current;
          /* Reported BEFORE navigating. capi() sends with keepalive, so the
             request survives the navigation this line causes, and
             trackSchedule is keyed on the payment id so a back-navigation into
             Cal's success state cannot count one booking twice. This is the
             step the funnel exists to produce. */
          trackSchedule(id ?? '');
          const q = id ? `?p=${encodeURIComponent(id)}&booked=1` : '?booked=1';
          window.location.href = `/thank-you${q}`;
        },
      });
    } catch {
      if (!cancelled) setState('failed');
      window.clearInterval(poll);
    }

    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
    /* Deliberately empty. The embed mounts once, and the only outside value
       the effect needs is the payment id, read through a ref at fire time.
       Re-running this on a dependency change is what mounted the second embed. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rn-book">
      <div className="bk-strip">
        <span className="bk-strip-tick" aria-hidden>
          ✓
        </span>
        Payment received
        <span className="bk-strip-sep" aria-hidden>
          ·
        </span>
        1 step left
      </div>

      <section className="bk-body">
        <div className="wrap">
          {/* Two steps, one done. Makes "you are nearly finished" a picture
              rather than a claim. */}
          <ol className="bk-steps" aria-label="Progress">
            <li className="done">
              <span className="bk-dot" aria-hidden>
                ✓
              </span>
              Paid
            </li>
            <li className="now" aria-current="step">
              <span className="bk-dot" aria-hidden>
                2
              </span>
              Pick your time
            </li>
          </ol>

          <div className="bk-mast">
            <span className="bk-pill">One step left</span>
            <h1>
              Pick a time. <em>Bring your reports.</em>
            </h1>
            <p className="bk-deck">
              Your {feeLabel} is in. Now put a date against it, so Rupali can
              start from your actual reports rather than assumptions.
            </p>
          </div>

          <div className="bk-card bk-wide" id="calendar">
            <div className="bk-card-head">
              <h2>Pick a slot that works for you</h2>
              <p>All times are shown in your own time zone.</p>
            </div>

            <div className="bk-cal-inset">
              {state !== 'ready' && (
                <p
                  className={
                    state === 'loading' ? 'bk-cal-note' : `bk-cal-note ${state}`
                  }
                >
                  {state === 'unset'
                    ? 'The calendar is not connected. Use WhatsApp or email below and your booking works exactly the same.'
                    : state === 'failed'
                      ? 'The calendar could not load here. Use the direct link below and your booking will work exactly the same.'
                      : 'Loading the calendar.'}
                </p>
              )}
              <div id="rn-cal" className="bk-cal" />
            </div>

            {/* Always rendered, never revealed on error: a third-party embed
                fails invisibly, and a blank panel after a payment reads as a
                broken purchase. */}
            {CAL_LINK ? (
              <p className="bk-direct">
                Calendar not showing?{' '}
                <a href={CAL_URL} target="_blank" rel="noopener noreferrer">
                  Open the booking page directly
                </a>
                .
              </p>
            ) : null}

            <ul className="bk-reassure">
              {REASSURANCES.map(([t, b]) => (
                <li key={t}>
                  <span className="bk-check" aria-hidden>
                    ✓
                  </span>
                  <span>
                    <b>{t}.</b> {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── THE SLOT FALLBACK ────────────────────────────────────────
              For the buyer the calendar cannot serve. They have paid, none of
              the open times work, and without this the page's only answer is
              silence: the likeliest next move is to close the tab and hope
              someone gets in touch. It sits directly under the calendar
              because the moment it is needed is the moment the grid comes back
              with nothing usable, not ten sections later. It leads with the
              reassurance, because the fear is "I have paid and lost my place".

              WHILE THE CAL LINK IS UNSET THIS IS THE ONLY WAY TO BOOK. */}
          <div className="bk-rescue bk-wide">
            <span className="bk-rescue-eyebrow">
              <AlertIcon size={14} />
              Preferred slot not available?
            </span>
            <h2>Cannot find a time that works for you?</h2>
            <p>
              You have already paid and your place is held, so you will not lose
              it. If none of the times above suit you, send us your{' '}
              <strong>name, email, phone number and your preferred day and time</strong>
              , and we will set up your slot personally.
            </p>
            <div className="bk-rescue-acts">
              <a
                className="bk-rescue-wa"
                href={`https://wa.me/${WA_DIGITS}?text=${RESCUE_WA_TEXT}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsappIcon size={17} />
                Message us on WhatsApp
              </a>
              <a className="bk-rescue-mail" href={RESCUE_MAILTO}>
                Email us
              </a>
            </div>
            <p className="bk-rescue-direct">
              <a href={`https://wa.me/${WA_DIGITS}`}>{phonePrimary}</a>
              <span aria-hidden> · </span>
              <a href={`mailto:${emailPrimary}`}>{emailPrimary}</a>
            </p>
          </div>

          <h2 className="bk-h2">
            What to have <em>ready</em>
          </h2>
          <p className="bk-h2-sub">
            Rupali&rsquo;s own list of what she reviews before a plan is built.
          </p>
          <ol className="bk-value">
            {HAVE_READY.map((w, i) => (
              <li key={w.title}>
                <span className="bk-ord">{String(i + 1).padStart(2, '0')}</span>
                <h3>{w.title}</h3>
                <p>{w.body}</p>
              </li>
            ))}
          </ol>

          {/* The nudge. No no-show statistic: Rupali has no such figure and a
              made-up number is a made-up client fact. */}
          <div className="bk-nudge">
            <h2>
              The slot is the part people leave <em>for Monday.</em>
            </h2>
            <p>
              Paying was the decision. Booking is the one that puts a date on
              it. Your {START_TITLE} is already yours, it just needs a time
              against it, and the calendar above takes about twenty seconds.
            </p>
            <a className="bk-btn" href="#calendar">
              Pick my slot
              <span aria-hidden>&nbsp;&rarr;</span>
            </a>
          </div>

          <h2 className="bk-h2">Two quick questions before you book</h2>
          <div className="bk-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>

          <div className="bk-final">
            <h2>
              You&rsquo;ve paid. Now <em>lock the time.</em>
            </h2>
            <p>One slot. Then the reading of your reports begins.</p>
            <a className="bk-btn lg" href="#calendar">
              Take me to the calendar
              <span aria-hidden>&nbsp;&rarr;</span>
            </a>
          </div>

          <p className="bk-help">
            Trouble booking? Write to{' '}
            <a href={`mailto:${emailPrimary}`}>{emailPrimary}</a> or call{' '}
            <a href={`tel:${phonePrimaryE164}`}>{phonePrimary}</a>.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
