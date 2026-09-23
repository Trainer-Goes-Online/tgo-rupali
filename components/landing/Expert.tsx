import { asset } from '@/components/shared/asset-version';
import { MediaPlaceholder } from '@/components/shared/MediaPlaceholder';
import { SectionMasthead } from '@/components/shared/SectionMasthead';

/**
 * BEATS 5a / 5b · MEET YOUR FERTILITY EXPERT  (DARK band: authority)
 *
 * 5b, the three paragraphs, is the blueprint's one reliably-TEXT beat: a
 * practitioner's path told in prose has no structure, and boxing it into a
 * graphic would be decoration. So it is set as prose: measure, rhythm, a
 * drop cap on the lede, nothing else.
 *
 * 5a, Certificate 1-6, IS a set, and the copy asks for it to move right to
 * left: a certificate marquee under a hairline (§12 authority). It loops
 * like the conversation wall (set rendered twice, -50%, margin spacing,
 * duplicate aria-hidden) and stops for reduced motion.
 *
 * No lockup here: the copy prints none, and the next CTA sits after the
 * value beat (What's Included), where the blueprint wants it.
 *
 * TO FILL: PHOTO_SRC (portrait, 4:5), CERTS[].src (landscape scans, 7:5
 * assumed). Bump ASSET_V in the same pass.
 */
const PHOTO_SRC = '/rupali.jpeg';
/* Supplied 2026-09-21 (Atul), six documents for six slots. Converted to WebP
   at 600px wide, which is past 2x for the 220px tile.
 *
 * THE LABELS ARE READ OFF THE DOCUMENTS, not written for the page. They are
 * alt text on a §12 authority beat, so they have to say what each scan
 * actually is; none of them claims anything the certificate does not.
 *
 * ORDER IS AUTHORITY FIRST, THEN RELEVANCE. The degree leads, then the two
 * that speak directly to what this funnel sells, then the CPD course, then
 * the academic paper and the speaking credit. The marquee loops, so nothing
 * is truly last, but the first tile is the one a reader sees at rest.
 *
 * ONE OF THE SIX WAS A 10-PAGE PDF ("Paper .pdf"), a published paper rather
 * than a certificate. It is rendered here as an IMAGE of its first page
 * (Atul's call), because an embedded PDF in a marquee is a viewer inside a
 * loop. See the note in the tile about how it sits. */
const CERTS: { label: string; src: string }[] = [
  {
    label: 'MSc Nutritional Sciences and Dietetics, Symbiosis Skills and Professional University, Pune',
    src: '/certifications/cert-msc.webp',
  },
  {
    label: 'Certificate of completion: Pregnancy Nutrition and Lifestyle',
    src: '/certifications/cert-pregnancy.webp',
  },
  {
    label: 'Certificate of completion: Hormonal Health',
    src: '/certifications/cert-hormonal.webp',
  },
  {
    label: 'Intermittent Fasting Coach, CPD accredited',
    src: '/certifications/cert-fasting.webp',
  },
  {
    label: 'Published paper: Ayurvedic Remedies of Urinary Tract Infections',
    src: '/certifications/cert-paper.webp',
  },
  {
    label: '3rd Global Organic Expo, New Delhi',
    src: '/certifications/cert-expo.webp',
  },
];

function CertTile({ c }: { c: (typeof CERTS)[number] }) {
  return (
    <div className="sdp-cert-tile">
      {c.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(c.src)} alt={c.label} loading="lazy" decoding="async" />
      ) : (
        <MediaPlaceholder ratio="7 / 5" label={c.label} note="Scan · 7:5 assumed" />
      )}
    </div>
  );
}

export function Expert() {
  return (
    <section id="expert" className="sdp-coach sdp-dark">
      <div className="sdp-wrap">
        <SectionMasthead
          eyebrow="Meet Your Fertility Expert"
          title={
            <>
              The Clinical Dietitian Behind <br className="sdp-br-desk" />
              <em>2,000+ Fertility Journeys</em>
            </>
          }
          delay=".06s"
        />

        <div className="sdp-coach-grid">
          <div className="sdp-coach-photo" data-sdp-reveal>
            {PHOTO_SRC ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset(PHOTO_SRC)} alt="Dt. Rupali Nayak" loading="lazy" decoding="async" />
            ) : (
              <MediaPlaceholder ratio="3 / 4" label="Rupali’s solo picture" note="Portrait · 3:4" />
            )}
          </div>

          <div className="sdp-coach-body" data-sdp-reveal style={{ '--d': '.1s' } as React.CSSProperties}>
            <p className="lede">
              With advanced training in Nutrition, Dietetics and Clinical Nutrition,{' '}
              <strong>Dt. Rupali Nayak</strong> has spent years working at the intersection of
              women’s health, hormones, metabolic health and fertility.
            </p>
            <p>
              Her experience with women dealing with PCOS, irregular cycles, thyroid concerns, low
              AMH and complex fertility histories shaped the personalised fertility approach she
              uses today.
            </p>
            <p>
              She has now guided <strong>2,000+ fertility journeys</strong> across India, USA,
              Canada, UK, Australia &amp; the Middle East, creating plans around each woman’s
              medical history, fertility markers, lifestyle and current health needs instead of
              treating fertility like a one-size-fits-all problem.
            </p>
          </div>
        </div>

        <div className="sdp-certs" aria-label="Certificates" data-sdp-reveal>
          <div className="sdp-certs-track">
            {CERTS.map((c) => (
              <CertTile c={c} key={c.label} />
            ))}
            <div className="sdp-certs-dup" aria-hidden>
              {CERTS.map((c) => (
                <CertTile c={c} key={`d-${c.label}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
