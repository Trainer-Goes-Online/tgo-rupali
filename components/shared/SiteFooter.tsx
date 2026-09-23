import Link from 'next/link';

import {
  addressLine,
  business,
  emailPrimary,
  phonePrimary,
  phonePrimaryE164,
} from '@/lib/site';
import { ALONGSIDE_MEDICAL_CARE } from '@/lib/offer';

/**
 * THE SITE FOOTER. One component, every surface.
 *
 * It carries the four facts a payment gateway's merchant review looks for ON
 * THE SITE rather than buried inside one policy page: the registered entity,
 * the full postal address, a working phone number and a working email. All of
 * them come from `business` in lib/site.ts, so there is exactly one place they
 * can be corrected.
 *
 * ⚠️ THE DISCLAIMER IS NOT A DEDICATED ONE. funnel-copy/01-landing-vsl.md
 * contains no disclaimer line, so rather than writing a medical disclaimer
 * fresh (which would be inventing a legal statement for a fertility offer)
 * this prints the client's own sentence from FAQ 3, verbatim. Rupali should
 * either approve it as the site-wide disclaimer or supply a proper one.
 *
 * FOLDED VARIANT: the finale is the premium peak and nothing follows it, so on
 * the landing page this renders `folded`, which drops the band and sits inside
 * the finale's dark stage under a fading hairline. The gateway requirement and
 * the house rule both hold at once.
 *
 * Server component.
 */
const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refund', label: 'Refund & Cancellation' },
] as const;

export function SiteFooter({ folded = false }: { folded?: boolean }) {
  return (
    <footer className={folded ? 'rn-foot rn-foot-folded' : 'rn-foot'}>
      <div className="rn-foot-wrap">
        <p className="rn-foot-lines">
          <span className="rn-foot-entity">{business.registeredName}</span>
          <br />
          Trading as {business.tradingName}
          <br />
          {addressLine}
          <br />
          <a href={`tel:${phonePrimaryE164}`}>{phonePrimary}</a>
          <span className="rn-foot-sep" aria-hidden>
            ·
          </span>
          <a href={`mailto:${emailPrimary}`}>{emailPrimary}</a>
        </p>

        <nav className="rn-foot-links" aria-label="Legal">
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>

        <p className="rn-foot-note">{ALONGSIDE_MEDICAL_CARE}</p>

        <p className="rn-foot-copy">
          &copy; {new Date().getFullYear()} {business.registeredName}. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
