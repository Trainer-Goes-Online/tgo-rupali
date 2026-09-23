import { CtaLockup } from '@/components/shared/CtaLockup';
import { CheckIcon, ShieldCheckIcon } from '@/components/shared/icons';

/**
 * BEAT 8 · THE RISK IS OURS. NOT YOURS.  (DARK band: risk)
 *
 * One SDP guarantee card, because an undertaking scattered across a
 * section stops reading as a single undertaking: rotated seal tile →
 * headline → the promise → "What We Ask In Return".
 *
 * The promise is an assurance (no shape), so it is set as type. The five
 * ✓ lines ARE a set, the terms, so they earn rows: a check, the term in
 * bold, its explanation under it. The fifth has no explanation in the copy
 * and gets none.
 *
 * The headline is an <h2> inside the card, not a section masthead above
 * it: the card is the whole beat.
 */
const ASKS = [
  {
    head: 'Your starting point is assessed on Day 1.',
    body: 'We establish your baseline across fertility history, blood reports, hormones, menstrual cycle, current health concerns, lifestyle and other relevant markers.',
  },
  {
    head: 'Your 90-day plan is built around your baseline.',
    body: 'Based on your assessment, Rupali creates a personalised plan focused on the areas that need attention first, rather than giving every woman the same fertility protocol.',
  },
  {
    head: 'You follow the programme consistently.',
    body: 'Your nutrition plan is followed, required check-ins are completed, progress updates are shared, and the agreed lifestyle recommendations are implemented consistently.',
  },
  {
    head: 'Your progress is tracked throughout the 90 days.',
    body: 'Your results are reviewed against the baseline established at the beginning, with your plan adjusted along the way based on how your body responds.',
  },
  { head: 'The 90 days run from your programme start date.' },
] as const;

export function Guarantee() {
  return (
    <section id="guarantee" className="sdp-guar sdp-dark">
      <div className="sdp-wrap">
        <div className="sdp-guarantee-card" data-sdp-reveal>
          <div className="sdp-guarantee-icon" aria-hidden>
            <ShieldCheckIcon size={42} />
          </div>

          <h2 className="sdp-h2 sdp-guarantee-h">
            The Risk Is Ours. <em>Not Yours.</em>
          </h2>

          <p className="sdp-guarantee-promise">
            Improve Your Agreed Fertility Health Markers In 90 Days. Or Get Your Money Back.
          </p>

          <div className="sdp-ask">
            <h3 className="sdp-ask-title">What We Ask In Return</h3>
            <ul className="sdp-ask-list">
              {ASKS.map((a) => (
                <li className="sdp-ask-row" key={a.head}>
                  <span className="sdp-ask-ck" aria-hidden>
                    <CheckIcon />
                  </span>
                  <div>
                    <strong className="sdp-ask-head">{a.head}</strong>
                    {'body' in a && <p>{a.body}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sdp-guar-cta" data-sdp-reveal>
          <CtaLockup />
        </div>
      </div>
    </section>
  );
}
