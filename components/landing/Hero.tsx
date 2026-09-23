import { feeLabel } from '@/lib/site';
import { CtaLockup } from '@/components/shared/CtaLockup';
import { ArrowDownIcon } from '@/components/shared/icons';
import { BrandMark } from './BrandMark';
import { VslFrame } from './VslFrame';

/**
 * BEAT 1 · HERO / VSL.
 *
 * Shape: FOCAL MEDIA. §8, the heaviest composite on the page: the whole
 * beat exists to hand the reader to the film and then, the moment the film
 * ends, to the button.
 *
 * ORDER IS THE COPY'S AND IS FIXED, top to bottom:
 *   logo → audience-gate pill → three-tier H1 → the "without" line → deck →
 *   pre-video lead → 8 condition chips → watch cue → VSL →
 *   CTA lockup (button, 3 badges, countdown) → credibility table
 *
 * The copy has no outcome-pill row after the table, so none is built: the
 * blueprint's post-Kunal "4 outcome pills" slot stays empty rather than
 * being filled with invented outcomes.
 *
 * Server component. The only client parts are the countdown inside the
 * lockup (and the film, once it has an id).
 */

/* The copy's eight conditions, as its two rows of four, in its order.
   These are what clients were DEALING WITH, not results, so they are
   rendered as neutral chips, not as ticks or wins. */
const CONDITIONS = [
  'Irregular Cycles',
  'Endometriosis',
  'Fibroids',
  'Thyroid',
  'Adenomyosis',
  'Low AMH',
  'PCOS',
  'Hormonal Imbalance',
] as const;

/* The credibility table, verbatim. The fee renders from lib/site.ts (the
   single-source price law); the other three are the client's figures. */
const STATS = [
  { k: '2000+', v: 'Clients Coached Globally' },
  { k: '10+ Years', v: 'Coaching Experience' },
  { k: '95%', v: 'Success Rate' },
  { k: feeLabel, v: 'To Start', price: true },
] as const;

export function Hero() {
  return (
    <section id="top" className="sdp-hero">
      {/* Outside .sdp-hero-inner on purpose: see BrandMark.tsx. */}
      <BrandMark />

      <div className="sdp-wrap sdp-hero-inner">
        {/* Audience gate: a bordered pill with a glowing dot. It names who
            this is for before the page claims anything. */}
        <div className="sdp-eyebrow-pill">
          <span className="glowdot" aria-hidden />
          <span>For women struggling to conceive despite trying for months or years</span>
        </div>

        <h1 className="sdp-h1" data-sdp-reveal style={{ '--d': '.06s' } as React.CSSProperties}>
          <span className="sdp-h1-l1">Get <em>Pregnant Naturally</em></span>
          <span className="sdp-h1-l2">Even if you have PCOS, Thyroid,</span>
          <span className="sdp-h1-l3">Low AMH or Unexplained Fertility Issues</span>
        </h1>

        {/* The "without" line is the headline's second promise (what the
            reader gets to avoid), so it is set heavier than the deck under
            it, in the body voice, and never merged into the H1. */}
        <p className="sdp-hero-without" data-sdp-reveal style={{ '--d': '.10s' } as React.CSSProperties}>
          Without More IVF/IUI Attempts, Hormonal Injections or Stressful Medical Procedures
        </p>

        <p className="sdp-hero-sub" data-sdp-reveal style={{ '--d': '.13s' } as React.CSSProperties}>
          Through a <strong>personalised fertility programme</strong> designed to improve fertility
          readiness, strengthen underlying health &amp; prepare your body for your next attempt at
          conception.
        </p>

        <p className="sdp-hero-lead" data-sdp-reveal style={{ '--d': '.15s' } as React.CSSProperties}>
          <strong>2,000+ women across India, USA, Canada, UK, Australia &amp; the Middle East</strong>{' '}
          improved their fertility readiness while dealing with:
        </p>

        <div
          className="sdp-hero-markers"
          data-sdp-reveal
          style={{ '--d': '.17s' } as React.CSSProperties}
          aria-label="Conditions clients were dealing with"
        >
          {CONDITIONS.map((m) => (
            <span className="sdp-marker-chip" key={m}>
              <span className="sdp-marker-dot" aria-hidden />
              {m}
            </span>
          ))}
        </div>

        <a className="sdp-above-vsl" href="#vsl" data-sdp-reveal style={{ '--d': '.20s' } as React.CSSProperties}>
          Watch the short video below
          <span className="sdp-above-vsl-arrow" aria-hidden>
            <ArrowDownIcon />
          </span>
        </a>

        <VslFrame />

        <div data-sdp-reveal style={{ '--d': '.26s' } as React.CSSProperties}>
          <CtaLockup />
        </div>

        <div className="sdp-cred-row" data-sdp-reveal style={{ '--d': '.34s' } as React.CSSProperties}>
          {STATS.map((s) => (
            <div className={`sdp-cred-card${'price' in s && s.price ? ' is-price' : ''}`} key={s.v}>
              <div className="sdp-cred-num">{s.k}</div>
              <div className="sdp-cred-lbl">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
