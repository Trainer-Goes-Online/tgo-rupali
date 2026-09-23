import { site, CTA_LABEL } from '@/lib/site';
import { ArrowRightIcon, FlameIcon, PercentBadgeIcon, StarIcon } from './icons';
import { OfferTimer } from './OfferTimer';

/**
 * THE CTA LOCKUP. One group, reused verbatim at every CTA on the page.
 *
 * FIXED ORDER, straight from the copy and identical at every occurrence:
 *   1. the button
 *   2. the three risk badges
 *   3. the 5-hour offer countdown
 *
 * Never separated: Rush and Reassure belong at the button, not three scrolls
 * apart. The copy prints the countdown under BOTH lockups in this pass, and
 * the Deepti rule (Atul, 2026-09-12) is that every lockup carries it.
 *
 * Badge labels are the client's words verbatim; the emoji become glyphs.
 */
const BADGES = [
  { label: '100% Money-Back Guarantee', Icon: StarIcon, tone: 'sdp-risk-icon-gold' },
  { label: '2000+ Fertility Journeys Guided', Icon: FlameIcon, tone: 'sdp-risk-icon-gold' },
  { label: '100% Personalised Fertility Approach', Icon: PercentBadgeIcon, tone: 'sdp-risk-icon-blue' },
] as const;

export function CtaButton() {
  return (
    <a className="sdp-cta" href={site.checkoutUrl} data-cta>
      <span className="cta-label">{CTA_LABEL}</span>
      <span className="arrow" aria-hidden>
        <ArrowRightIcon />
      </span>
    </a>
  );
}

export function RiskBadges() {
  return (
    <div className="sdp-risk-strip">
      {BADGES.map(({ label, Icon, tone }) => (
        <span className="sdp-risk-badge" key={label}>
          <span className={`sdp-risk-icon ${tone}`} aria-hidden>
            <Icon />
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}

export function CtaLockup({ timer = true }: { timer?: boolean } = {}) {
  return (
    <div className="sdp-lockup">
      <CtaButton />
      <RiskBadges />
      {timer && <OfferTimer />}
    </div>
  );
}
