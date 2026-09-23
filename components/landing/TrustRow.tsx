import { asset } from '@/components/shared/asset-version';
import { ShieldCheckIcon, StarIcon } from '@/components/shared/icons';

/**
 * BEAT 0b · TRUST ROW.
 *
 * Shape: credential set. §12 Authority, lightest option: a hairline
 * trust-chip row directly under the announcement strip.
 *
 * Copy (verbatim):
 *   "[Photos] ★★★★★ 5.0 Review | 🛡️ 100% Money-Back Guarantee"
 *
 * "[Photos]" asks for client reviewer portraits. These are the four women who
 * gave the video testimonials further down the page, cropped from their own
 * recordings, so every face beside the 5.0 belongs to someone who actually
 * left one. Four, not five: there are four testimonials.
 *
 * Any replacement must be a real client who has agreed to be shown. Never a
 * stock face on a fertility page.
 */
const AVATARS: string[] = [
  '/faces/aditi-seth.webp',
  '/faces/sania-khatwani.webp',
  '/faces/shivi-vijan.webp',
  '/faces/kavisha-soni.webp',
];

export function TrustRow() {
  return (
    <div className="sdp-trust-strip">
      <div className="sdp-trust-avatars" aria-hidden>
        {AVATARS.map((src, i) => (
          <span
            key={i}
            className={`sdp-trust-avatar${src ? '' : ' is-empty'}`}
            style={src ? { backgroundImage: `url("${asset(src)}")` } : undefined}
          />
        ))}
      </div>

      <div className="sdp-trust-item">
        <span className="sdp-trust-stars" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} size={13} />
          ))}
        </span>
        <span>
          <b>5.0</b> Review
        </span>
      </div>

      <div className="sdp-trust-item">
        <span className="sdp-trust-check" aria-hidden>
          <ShieldCheckIcon />
        </span>
        <span>
          <b>100%</b> Money-Back Guarantee
        </span>
      </div>
    </div>
  );
}
