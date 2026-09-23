import { asset } from '@/components/shared/asset-version';
import { MediaPlaceholder } from '@/components/shared/MediaPlaceholder';
import { SectionMasthead } from '@/components/shared/SectionMasthead';
import { StarIcon } from '@/components/shared/icons';

/**
 * BEATS 3 / 4 · PROOF A: "SEE THEIR STORIES".
 *
 * Shape: PROOF-SET, in two forms the copy itself separates:
 *   group A · Testimonial 1-4       → media tiles (§6)
 *   group B · five named case files → case cards (§6), each carrying a
 *     FIGURE STRIP that is its own structure: Swati's strip is before→after
 *     markers, the others run history → outcome. That is §4 magnitude, so
 *     each strip renders as a small ledger inside the card, with the
 *     OUTCOME cell lit, rather than as a line of prose under it.
 *
 * Vary-adjacent-proof holds three ways: tiles, then case cards here, then
 * the counter-scrolling conversation wall in the next section.
 *
 * Every word is the copy's. "Swati, 30" joins the copy's name and age lines
 * with a comma; no label is added. The copy's "→" renders as a glyph.
 *
 * Server component. Lazy iframes only, no client JS.
 */

/* ---------- group A: Testimonial 1-4 ----------
   The copy names four slots and says nothing about what they are. Assumed
   9:16 video (the house pattern on Deepti and Sandesh). Set a Vimeo id to
   mount the player, or a /public path to show a still. If the real media is
   another shape, change TESTIMONIAL_RATIO here AND `.sdp-tst` in
   landing.css (section 08) in the same pass. */
const TESTIMONIAL_RATIO = '9 / 16';
/* Supplied 2026-09-21 (Atul), in this order. The first three ids are
   consecutive but were NOT given in numeric order, so they are kept in the
   order they arrived rather than sorted: on a proof rail the sequence is a
   decision, and re-sorting would silently reorder whose story leads. */
const TESTIMONIALS: { label: string; vimeoId?: string; src?: string }[] = [
  { label: 'Testimonial 1', vimeoId: '1225187798' },
  { label: 'Testimonial 2', vimeoId: '1225187796' },
  { label: 'Testimonial 3', vimeoId: '1225187797' },
  { label: 'Testimonial 4', vimeoId: '1226865611' },
];

/* ---------- group B: the five case files, verbatim ----------
   A cell is either a before→after pair (`from`/`to`) or a single value.
   `outcome` lights the cell: the result the story is about. */
type Cell = { k: string; v?: string; from?: string; to?: string; outcome?: boolean };
type Case = { name: string; age: string; story: string; cells: Cell[] };

const CASES: Case[] = [
  {
    name: 'Swati',
    age: '30',
    story:
      'In just around 3 months, Swati saw meaningful improvement across key fertility-related markers. Her AMH increased from 0.62 to 1.69, TSH improved from 3.68 to 2.5, and Prolactin reduced from 88 to 44 while following her personalised plan alongside medical care.',
    cells: [
      { from: '0.62', to: '1.69', k: 'AMH' },
      { from: '3.68', to: '2.5', k: 'TSH' },
      { from: '88', to: '44', k: 'Prolactin' },
      { v: '3 Months', k: 'Duration' },
    ],
  },
  {
    name: 'Shivi',
    age: '35',
    story:
      'Shivi came in after two miscarriages, thyroid imbalance, one blocked fallopian tube and two failed ovulation-induction attempts. Within 3 months of following her personalised fertility plan alongside medical care, she conceived naturally.',
    cells: [
      { v: '2', k: 'Miscarriages' },
      { v: '2', k: 'Failed Ovulation-Induction Rounds' },
      { v: '1', k: 'Blocked Fallopian Tube' },
      { v: '3 Months', k: 'To Natural Conception', outcome: true },
    ],
  },
  {
    name: 'Garima',
    age: '35',
    story:
      'Garima had gone almost 1.5 years without a period, with severe menstrual irregularity and growing concern around her hormonal and reproductive health. After following her personalised nutrition and lifestyle plan, her period returned and then came again the following month around the same time.',
    cells: [
      { v: '1.5 Years', k: 'Without A Period' },
      { v: '1st Cycle', k: 'Period Returned', outcome: true },
      { v: '2nd Month', k: 'Period Returned Again', outcome: true },
    ],
  },
  {
    name: 'Aditi',
    age: '36',
    story:
      'After 3 failed IVF cycles, 2 unsuccessful IUI attempts, PCOS, irregular cycles and hormonal imbalance, Aditi spent 6 months following a personalised fertility nutrition and lifestyle plan. She then conceived naturally.',
    cells: [
      { v: '3', k: 'Failed IVF Cycles' },
      { v: '2', k: 'Failed IUI Attempts' },
      { v: '6 Months', k: 'Duration' },
      { v: 'Natural Conception', k: 'Outcome', outcome: true },
    ],
  },
  {
    name: 'Neetu',
    age: '34',
    story:
      'After 4 years of trying to conceive, Neetu was also dealing with elevated thyroid levels, low body weight, weakness and high stress. After around 4 months of personalised nutrition and lifestyle support alongside medical care, she conceived naturally.',
    cells: [
      { v: '4 Years', k: 'Trying To Conceive' },
      { v: 'Elevated Thyroid', k: 'Key Concern' },
      { v: '4 Months', k: 'Duration' },
      { v: 'Natural Conception', k: 'Outcome', outcome: true },
    ],
  },
];

function Arrow() {
  return (
    <svg className="sdp-case-arrow" viewBox="0 0 24 24" aria-hidden width="14" height="14"
      fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

function TestimonialTile({ t, i }: { t: (typeof TESTIMONIALS)[number]; i: number }) {
  return (
    <div className="sdp-tst" data-sdp-reveal style={{ '--d': `${0.04 + i * 0.06}s` } as React.CSSProperties}>
      {t.vimeoId ? (
        <div className="sdp-tst-media" style={{ aspectRatio: TESTIMONIAL_RATIO }}>
          <iframe
            src={`https://player.vimeo.com/video/${t.vimeoId}?title=0&byline=0&portrait=0&dnt=1`}
            title={t.label}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : t.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(t.src)} alt={t.label} loading="lazy" decoding="async" />
      ) : (
        <MediaPlaceholder ratio={TESTIMONIAL_RATIO} kind="film" label={t.label} note="Video or photo · 9:16 assumed" />
      )}
    </div>
  );
}

function CaseCard({ c, i }: { c: Case; i: number }) {
  return (
    <article className="sdp-case" data-sdp-reveal style={{ '--d': `${0.04 + (i % 3) * 0.08}s` } as React.CSSProperties}>
      <header className="sdp-case-head">
        <h3 className="sdp-case-name">
          {c.name}
          <span className="sdp-case-age">, {c.age}</span>
        </h3>
        <span className="sdp-case-stars" aria-label="5 out of 5 stars">
          {[0, 1, 2, 3, 4].map((s) => (
            <StarIcon key={s} size={14} />
          ))}
        </span>
      </header>

      <p className="sdp-case-story">{c.story}</p>

      <dl className="sdp-case-ledger" data-n={c.cells.length}>
        {c.cells.map((cell) => (
          /* dt before dd is what a <dl> requires; the CSS column-reverses
             the cell so the VALUE still reads first. */
          <div className={`sdp-case-cell${cell.outcome ? ' is-outcome' : ''}`} key={cell.k}>
            <dt className="sdp-case-k">{cell.k}</dt>
            <dd className="sdp-case-v">
              {cell.from ? (
                <>
                  <span className="from">{cell.from}</span>
                  <Arrow />
                  <span className="to">{cell.to}</span>
                </>
              ) : (
                cell.v
              )}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function Stories() {
  return (
    <section id="stories" className="sdp-proof sdp-light-alt">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              Before You Assume IVF Is Your <br className="sdp-br-desk" />
              Only Way Forward, See Their <em>Stories.</em>
            </>
          }
          sub="From improved AMH and regular cycles to natural conception after years of trying."
          delay=".06s"
        />

        <div className="sdp-tst-grid">
          {TESTIMONIALS.map((t, i) => (
            <TestimonialTile t={t} i={i} key={t.label} />
          ))}
        </div>

        <div className="sdp-cases">
          {CASES.map((c, i) => (
            <CaseCard c={c} i={i} key={c.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
