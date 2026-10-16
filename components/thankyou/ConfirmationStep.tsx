import { asset } from '@/components/shared/asset-version';
import { WhatsappIcon } from '@/components/shared/icons';
import { WHATSAPP_CONFIRM_URL } from '@/lib/site';

import './ConfirmationStep.css';

/**
 * THE BRIDGE · the /thank-you hero
 *
 * Booking the slot is step one; the call is only confirmed once the buyer
 * messages on WhatsApp. So the hero stops short of "confirmed" and gives one
 * action: the WhatsApp handoff. Scoped `.ty-confirm` inside `.rn-ty`,
 * token-only apart from the documented WhatsApp green.
 *
 * On phones the same action is also pinned to the bottom of the screen.
 * Unlike the landing's StickyCta it is NOT conditional: it is server-rendered
 * visible, with no scroll trigger and no slide-in, because this page has one
 * job and the button should never be out of reach.
 */

type ConfirmationStepProps = {
  /** a /public path; defaults to the same portrait the Expert section uses */
  photoSrc?: string;
  photoAlt?: string;
  whatsappUrl?: string;
};

export function ConfirmationStep({
  photoSrc = '/rupali.jpeg',
  photoAlt = 'Dt. Rupali Nayak',
  whatsappUrl = WHATSAPP_CONFIRM_URL,
}: ConfirmationStepProps) {
  return (
    <>
      <section className="ty-sec ty-confirm">
        <div className="ty-wrap">
          <h1 className="ty-h1 tc-h1">
            <span className="tc-alert">WAIT!</span> Your Strategy Call Has Not
            Been Confirmed Yet&hellip;
          </h1>

          <div className="tc-avatar">
            <span className="tc-avatar-clip">
              <img src={asset(photoSrc)} alt={photoAlt} decoding="async" />
            </span>
          </div>

          <p className="tc-copy">
            You&rsquo;ve just <strong>completed the first step</strong>.
          </p>
          <p className="tc-copy">
            Connect on WhatsApp to{' '}
            <strong>get the next steps to confirm your strategy call</strong>.
          </p>

          <WhatsappCta href={whatsappUrl} className="tc-cta" />
        </div>
      </section>

      {/* phones only (CSS): pinned from first paint, no reveal */}
      <div className="tc-sticky">
        <WhatsappCta href={whatsappUrl} className="tc-cta tc-cta-sticky" />
      </div>
    </>
  );
}

function WhatsappCta({ href, className }: { href: string; className: string }) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Click here to connect on WhatsApp (opens in a new tab)"
    >
      <WhatsappIcon size={24} />
      Click Here
    </a>
  );
}
