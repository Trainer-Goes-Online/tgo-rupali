import { CtaLockup } from '@/components/shared/CtaLockup';
import { SiteFooter } from '@/components/shared/SiteFooter';

/**
 * BEAT 11 · FINAL CTA  (DARK: the premium peak)
 *
 * The copy ends at the FAQ ("***") and carries no closing headline, so the
 * peak repeats the page's own promise, the hero H1, verbatim (the Deepti
 * precedent), rather than inventing a new line. Lean, per the locked rule:
 * headline → CTA lockup → colophon. No body paragraphs.
 *
 * Depth is the closing-stage weld (structure-library Welds): forest floor,
 * two soft blooms (lime leaf + raspberry fruit, the logo's two accents), a
 * masked dot grid drifting slowly, a lit seam on the top edge. Pure finish,
 * no content.
 *
 * `id="finale"` is what the sticky bar watches to step aside, so the peak
 * is never covered and needs no reserved space.
 *
 * FOOTER: the colophon is the identity line only. LAUNCH owns the shared
 * SiteFooter (registered name, postal address, phone, email, legal links,
 * which Razorpay's merchant review reads on the site) and should mount it
 * FOLDED inside this section, under the colophon, as on Deepti.
 */
export function Finale() {
  return (
    <section id="finale" className="sdp-finale sdp-dark">
      <div className="sdp-wrap sdp-finale-inner">
        <h2 className="sdp-h1 sdp-finale-h" data-sdp-reveal>
          <span className="sdp-h1-l1">Get <em>Pregnant Naturally</em></span>
          <span className="sdp-h1-l2">Even if you have PCOS, Thyroid,</span>
          <span className="sdp-h1-l3">Low AMH or Unexplained Fertility Issues</span>
        </h2>

        <div data-sdp-reveal style={{ '--d': '.1s' } as React.CSSProperties}>
          <CtaLockup />
        </div>

        <div className="sdp-colophon">
          <SiteFooter folded />
        </div>
      </div>
    </section>
  );
}
