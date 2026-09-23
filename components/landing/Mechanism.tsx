import { SectionMasthead } from '@/components/shared/SectionMasthead';

/**
 * BEAT 6 · HOW THIS FERTILITY PROGRAMME WORKS DIFFERENTLY  (LIGHT-ALT)
 *
 * Shape: SEQUENCE of principles, "the N things we do differently", each a
 * numbered stance (01-04 in the copy). The blueprint's pick for this
 * reading is §1 NUMBERED PILLARS, not the old-vs-new compare: the copy
 * states only the new way, and building a "them" column would invent it.
 *
 * Rendered as a NUMBERED LEDGER (hairline rows, big ordinal in the margin),
 * not cards, on purpose: the very next beat (What's Included) is a card
 * grid of six numbered items, and two numbered card grids back to back read
 * as one long repeated section. The block is centred; the row TEXT is left
 * set, because two-paragraph rows stop reading centred well above phone
 * width (skin law 7).
 *
 * Titles and paragraphs verbatim, including the copy's paragraph breaks.
 */
const PILLARS = [
  {
    n: '01',
    title: 'We Don’t Treat “Fertility” As One Problem',
    body: [
      'PCOS, thyroid, low AMH, irregular cycles, fibroids, endometriosis and unexplained fertility do not need the same starting point.',
      'Your plan is built around what is actually showing up in your reports, history and current health, not simply around the fact that you want to conceive.',
    ],
  },
  {
    n: '02',
    title: 'We Don’t Give You One Plan For 90 Days',
    body: [
      'Rupali reviews your progress regularly, checks your updates and adjusts your nutrition plan approximately every 2 weeks based on how you are responding, instead of handing you one static diet chart to follow for three months.',
    ],
  },
  {
    n: '03',
    title: 'We Look At Both Sides When Needed',
    body: [
      'Especially in unexplained fertility cases, focusing only on the woman can leave half the picture untouched.',
      'When relevant, your partner can also receive male fertility guidance and couple-focused movement support.',
    ],
  },
  {
    n: '04',
    title: 'We Back Our Process With More Than Promises',
    body: [
      'The programme is backed by a 100% Money-Back Guarantee when you follow the agreed plan, complete your check-ins and stay consistent with the recommendations.',
    ],
  },
] as const;

export function Mechanism() {
  return (
    <section id="how-it-works" className="sdp-mech sdp-light-alt">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              How This Fertility Programme Works <em>Differently</em>
            </>
          }
          sub="The difference is not just personalisation. It is knowing what to work on first, when to involve your partner, and how to adjust the journey around you."
          delay=".06s"
        />

        <ol className="sdp-mech-list">
          {PILLARS.map((p, i) => (
            <li className="sdp-mech-row" key={p.n} data-sdp-reveal style={{ '--d': `${0.04 + i * 0.06}s` } as React.CSSProperties}>
              <span className="sdp-mech-num" aria-hidden>
                {p.n}
              </span>
              <div className="sdp-mech-text">
                <h3 className="sdp-mech-title">{p.title}</h3>
                {p.body.map((b) => (
                  <p key={b}>{b}</p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
