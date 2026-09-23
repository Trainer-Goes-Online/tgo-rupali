import { MediaPlaceholder } from '@/components/shared/MediaPlaceholder';
import { PlayIcon } from '@/components/shared/icons';

/**
 * BEAT 1 (focal) · THE VSL FRAME.
 *
 * §8 Focal media, the page's one lit focal object. No video was supplied,
 * so the frame holds a 16:9 placeholder with an INERT, unlit disc: a play
 * affordance that plays nothing is a lie, so the pending disc does not ping
 * and does not glow.
 *
 * TO GO LIVE: put the Vimeo id in VIMEO_ID. The player then mounts directly
 * and draws its own thumbnail and play control, so the only play button on
 * the page is the real one. Not lazy-loaded on purpose: it is above the
 * fold and it is the beat the whole page hands off to. If the film is not
 * 16:9, change the frame's aspect-ratio in landing.css (`.sdp-vsl`) in the
 * same pass, or it letterboxes.
 *
 * Server component, no state.
 */
const VIMEO_ID = '';

export function VslFrame() {
  return (
    <div className="sdp-vsl-frame" id="vsl" data-sdp-reveal style={{ '--d': '.22s' } as React.CSSProperties}>
      {VIMEO_ID ? (
        <div className="sdp-vsl playing">
          <iframe
            src={`https://player.vimeo.com/video/${VIMEO_ID}?title=0&byline=0&portrait=0&dnt=1`}
            title="Watch the short video"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="sdp-vsl">
          <MediaPlaceholder
            ratio="16 / 9"
            kind="film"
            label="VSL video · Dt. Rupali Nayak"
            note="16:9 · Vimeo link"
          />
          <span className="sdp-vsl-disc pending" aria-hidden>
            <PlayIcon />
          </span>
        </div>
      )}
    </div>
  );
}
