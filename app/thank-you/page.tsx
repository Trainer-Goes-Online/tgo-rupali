'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

import { SiteFooter } from '@/components/shared/SiteFooter';
import { emailPrimary, phonePrimary, phonePrimaryE164 } from '@/lib/site';
import {
  ALONGSIDE_MEDICAL_CARE,
  OFFER_PENDING,
  START_COVERS,
  START_TITLE,
} from '@/lib/offer';
import { SealCheckIcon, CheckIcon } from '@/components/shared/icons';

/**
 * THE CONFIRMATION · /thank-you
 *
 *   checkout -> PAYMENT -> /book-a-call -> BOOKING -> /thank-you
 *
 * By the time anyone lands here they have paid AND booked, so the only thing
 * left to influence is whether they turn up prepared. Every push to book is
 * gone: on a page reached only by booking, a "book your slot" button is a bug.
 *
 * BAND RHYTHM: dark (confirmation), light (what this is), light-alt (prep),
 * dark (close). The page opens and closes on the deepest surface.
 *
 * ⚠️ "WHAT THIS IS" IS A PLACEHOLDER. The client's copy never describes what
 * the ₹97 books, so the section that should say what it covers and what it is
 * not renders lib/offer.ts's pending panel instead of invented prose. The prep
 * section below it is safe: it is Rupali's own list, from section 7 items 1
 * and 2, of what she reviews before a plan is built.
 */

/* Section 7 items 1 and 2 of the copy source, split at the source's own
   commas, in its own order. Nothing added. */
const HAVE_READY = [
  ['Your blood reports', 'Blood reports, fertility markers and any relevant scans or ultrasounds. Bring them even if they read as normal.'],
  ['Your fertility history', 'What has been tried so far, and what came of it.'],
  ['Your medical concerns', 'The conditions you are managing, and the medicines and supplements you take.'],
  ['Your menstrual cycle', 'How it actually runs, not how it is supposed to.'],
  ['Your food habits and routine', 'A normal day of eating, not an ideal one, and the hours your week really has.'],
  ['Your sleep, digestion and activity', 'The things that never show on a report.'],
] as const;

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYou />
    </Suspense>
  );
}

function ThankYou() {
  /* `booked=1` is set by the Cal handoff on /book-a-call. Its absence is not
     treated as an error: somebody may arrive from their own history or a Cal
     dashboard redirect, and a confirmation page that accuses a real buyer of
     not having booked is worse than one that simply confirms. */
  useSearchParams();

  return (
    <div className="rn-ty">
      {/* ── 1 · CONFIRMATION ─────────────────────────────────────── */}
      <section className="ty-sec ty-dark ty-hero">
        <div className="ty-wrap">
          <span className="ty-seal" aria-hidden>
            <SealCheckIcon />
          </span>
          <span className="ty-badge">Booking confirmed</span>
          <h1 className="ty-h1">
            Your slot is <em>locked in.</em>
          </h1>
          <p className="ty-sub">
            The details are on their way to the email address you booked with.
            Put it in your calendar now, while it is in front of you.
          </p>

          <ul className="ty-chips">
            <li>
              <span className="ty-tick" aria-hidden>
                <CheckIcon />
              </span>
              Confirmation by email, with your joining details
            </li>
            <li>
              <span className="ty-tick" aria-hidden>
                <CheckIcon />
              </span>
              A reminder before it starts
            </li>
          </ul>
        </div>
      </section>

      {/* ── 2 · WHAT THIS IS ─────────────────────────────────────── */}
      <section className="ty-sec ty-light">
        <div className="ty-wrap">
          <span className="ty-eyebrow center">WHAT YOU HAVE BOOKED</span>
          <h2 className="ty-h2">
            Your <em>{START_TITLE}</em>
          </h2>

          {OFFER_PENDING || START_COVERS.length === 0 ? (
            <div className="ty-pending" role="note">
              <b>Pre-launch · this section is not written yet</b>
              <p>
                Nothing in the client&rsquo;s copy says what this booking
                covers, how long it runs, or what happens at the end of it, so
                this page says nothing about it rather than inventing it. Fill{' '}
                <code>START_TITLE</code> and <code>START_COVERS</code> in{' '}
                <code>lib/offer.ts</code> and this panel is replaced by the
                three-point list below it.
              </p>
            </div>
          ) : (
            <ol className="ty-ord-grid">
              {START_COVERS.map((c, i) => (
                <li key={c}>
                  <span className="ty-ord">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{c}</h3>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* ── 3 · PREP ─────────────────────────────────────────────── */}
      <section className="ty-sec ty-tint">
        <div className="ty-wrap">
          <span className="ty-eyebrow center">BEFORE IT STARTS</span>
          <h2 className="ty-h2">
            What to keep <em>ready.</em>
          </h2>
          <p className="ty-sub">
            Rupali builds your plan from your actual situation rather than
            assumptions, so the more of this you have to hand, the further the
            time goes. You do not need perfect data.
          </p>

          <ul className="ty-ready">
            {HAVE_READY.map(([t, b]) => (
              <li key={t}>
                <h3>{t}</h3>
                <p>{b}</p>
              </li>
            ))}
          </ul>

          <p className="ty-note">{ALONGSIDE_MEDICAL_CARE}</p>
        </div>
      </section>

      {/* ── 4 · CLOSE ────────────────────────────────────────────── */}
      <section className="ty-sec ty-dark ty-close">
        <div className="ty-wrap">
          <h2 className="ty-h2">
            See you <em>then.</em>
          </h2>
          <p className="ty-sub">
            Something come up, or the confirmation not arrived? Write to{' '}
            <a href={`mailto:${emailPrimary}`}>{emailPrimary}</a> or call{' '}
            <a href={`tel:${phonePrimaryE164}`}>{phonePrimary}</a>.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
