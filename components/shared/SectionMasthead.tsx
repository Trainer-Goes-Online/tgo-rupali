/**
 * The section masthead, identical at every beat:
 *   uppercase dash-eyebrow → display H2 (one word lit via <em>) → deck.
 *
 * Eyebrows are ALWAYS uppercase (house rule). The CSS sets it at the base
 * class, so no caller can drift.
 */
export function SectionMasthead({
  eyebrow,
  title,
  sub,
  delay = '0s',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  delay?: string;
}) {
  return (
    <>
      {eyebrow && (
        <div className="sdp-eyebrow center" data-sdp-reveal>
          {eyebrow}
        </div>
      )}
      <h2 className="sdp-h2" data-sdp-reveal style={{ '--d': delay } as React.CSSProperties}>
        {title}
      </h2>
      {sub && (
        <p className="sdp-sub" data-sdp-reveal style={{ '--d': delay } as React.CSSProperties}>
          {sub}
        </p>
      )}
    </>
  );
}
