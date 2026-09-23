/**
 * BEAT 0a · ANNOUNCEMENT STRIP.
 *
 * Shape: standing proof / why-trust-now. §11, rendered as the page-chrome
 * announcement bar. Chrome, so not gated by THE GATE.
 *
 * Copy (verbatim):
 *   "10+ YEARS OF COACHING EXPERIENCE | 2,000+ FERTILITY JOURNEYS GUIDED"
 *
 * Each figure is a lit number chip + a white label rather than one bolded
 * run: a bright accent figure on the accent bar has almost no contrast and
 * reads as blended. Static, not a marquee: two short claims standing still
 * read faster than two short claims scrolling past.
 *
 * Server component. The only motion is the CSS dot pulse.
 */
const ITEMS = [
  { num: '10+', label: 'Years Of Coaching Experience' },
  { num: '2,000+', label: 'Fertility Journeys Guided' },
] as const;

function Run() {
  return (
    <span className="sdp-announce-copy">
      {ITEMS.map((it, i) => (
        <span className="sdp-announce-item" key={it.label}>
          {i > 0 && (
            <span className="sdp-announce-sep" aria-hidden>
              |
            </span>
          )}
          <b className="sdp-announce-num">{it.num}</b>
          <span className="sdp-announce-label">{it.label}</span>
        </span>
      ))}
    </span>
  );
}

export function AnnounceStrip() {
  return (
    <div className="sdp-announce" role="note">
      <span className="sdp-announce-dot" aria-hidden />
      {/* The run is rendered TWICE so the mobile marquee loops without a seam.
          The copy is 67 characters, which cannot fit one line on a phone at a
          legible size, and it is the client's wording so it is not shortened
          to fit. The duplicate is hidden from assistive tech and from desktop,
          where the single run fits standing still. */}
      <span className="sdp-announce-track">
        <Run />
        <span className="sdp-announce-dup" aria-hidden>
          <Run />
        </span>
      </span>
    </div>
  );
}
