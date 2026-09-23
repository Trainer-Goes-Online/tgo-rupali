import { asset } from '@/components/shared/asset-version';
import { CtaLockup } from '@/components/shared/CtaLockup';
import { MediaPlaceholder } from '@/components/shared/MediaPlaceholder';
import { SectionMasthead } from '@/components/shared/SectionMasthead';

/**
 * BEAT 4b · PROOF B: "THOUSANDS OF CONVERSATIONS."
 *
 * Shape: PROOF VOLUME. The claim is the count ("thousands", "hundreds"),
 * not any one exhibit, so the form is the counter-scrolling wall (§6,
 * shipped as the Deepti wins wall): it reads as an unending stream rather
 * than a curated handful. The copy specifies it exactly: two rows of ten,
 * row 1 moves left to right, row 2 right to left.
 *
 * Mechanics:
 *  · each row renders its set TWICE and slides by -50%, so the loop has no
 *    seam. The second copy is aria-hidden: a screen reader hears ten, not
 *    twenty.
 *  · hover pauses the row, so someone can actually read a message they
 *    spotted.
 *  · reduced motion: the rows stop, the duplicate set is dropped, and each
 *    row becomes a plain horizontal scroller (landing.css section 92).
 *
 * TO FILL: put /public paths in ROW_1 / ROW_2 (e.g. '/proof/chat-01.webp').
 * The copy says "Pic" only; chat screenshots are assumed, at 4:5. If they
 * arrive at another ratio, change WALL_RATIO and `.sdp-wa-card > img` in
 * landing.css in the same pass. Encode to what is DRAWN (208px card, so
 * ~460px wide covers 2x) and bump ASSET_V.
 *
 * Carries the lockup that closes the proof run (see SESSION_STATE flags:
 * the copy does not print one here; the VSL blueprint repeats it after
 * proof).
 */
const WALL_RATIO = '4 / 5';

/* Supplied filenames carry a space, so the paths are percent-encoded here
   rather than relying on the browser to do it. */
const ROW_1: string[] = [
  '/journeys/Conceive%201.jpeg',
  '/journeys/Conceive%202.jpeg',
  '/journeys/Conceive%203.jpeg',
  '/journeys/Conceive%204.jpeg',
  '/journeys/Conceive%205.png',
  '/journeys/Conceive%206.jpeg',
  '/journeys/Conceive%207.jpeg',
  '/journeys/Conceive%208.jpeg',
  '/journeys/Conceive%209.jpeg',
  '/journeys/Conceive%2010.jpeg',
];
const ROW_2: string[] = [
  '/journeys/Aditi%20%26%20Mukesh%20Review%20weightloss%20and%20lifestyle%20Improved.png',
  '/journeys/Fertility%20%28Conceived%29.jpg',
  '/journeys/Pregnant%20.jpg',
  '/journeys/Reverse%20PCOS%20and%20skin%2C%20hair%20and%20hormone%20issue.jpg',
  '/journeys/Sheetal%20Cyst%20and%20endometriosis%20Improved.jpeg',
  '/journeys/Weightloss%20%282%29.jpg',
  '/journeys/Weightloss%20and%20Hormone%20balance.jpg',
  '/journeys/Weightloss%20and%20conceived%20.jpg',
  '/journeys/Weightloss%20and%20healthy%20lifestyle%20.jpg',
  '/journeys/WhatsApp%20Image%202026-09-02%20at%205.05.19%20PM.jpeg',
];

function Card({ src, n }: { src: string; n: number }) {
  const label = `Client conversation ${String(n).padStart(2, '0')}`;
  return (
    <div className="sdp-wa-card">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(src)} alt={label} loading="lazy" decoding="async" />
      ) : (
        <MediaPlaceholder ratio={WALL_RATIO} label={label} note="Screenshot · 4:5 assumed" />
      )}
    </div>
  );
}

function Row({ items, dir, offset }: { items: string[]; dir: 'ltr' | 'rtl'; offset: number }) {
  return (
    <div className={`sdp-wa-row ${dir}`}>
      <div className="sdp-wa-track">
        {items.map((src, i) => (
          <Card key={`a${i}`} src={src} n={offset + i + 1} />
        ))}
        <div className="sdp-wa-dup" aria-hidden>
          {items.map((src, i) => (
            <Card key={`b${i}`} src={src} n={offset + i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ConversationWall() {
  return (
    <section id="conversations" className="sdp-wa sdp-light">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              Thousands Of Conversations. <br className="sdp-br-desk" />
              Hundreds Of Fertility <em>Breakthroughs.</em>
            </>
          }
          sub="Here's a small glimpse into our clients' journeys."
          delay=".06s"
        />
      </div>

      {/* full-bleed on purpose: the rows run edge to edge, outside the wrap */}
      <div className="sdp-wa-rows" data-sdp-reveal style={{ '--d': '.12s' } as React.CSSProperties}>
        <Row items={ROW_1} dir="ltr" offset={0} />
        <Row items={ROW_2} dir="rtl" offset={10} />
      </div>

      <div className="sdp-wrap">
        <div className="sdp-proof-cta" data-sdp-reveal style={{ '--d': '.1s' } as React.CSSProperties}>
          <CtaLockup />
        </div>
      </div>
    </section>
  );
}
