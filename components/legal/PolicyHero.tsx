import type { ReactNode } from 'react';

/**
 * THE POLICY MASTHEAD (VSL blueprint, policy surface, beat 1).
 *
 * Pill eyebrow, display title carrying ONE accent word, deck, meta chips.
 *
 * Two meta chips, not the blueprint's one: a merchant reviewer scanning this
 * page should meet the operating entity without scrolling, so "Operated by"
 * sits beside "Last updated". Flagged as a deviation rather than made
 * silently.
 *
 * Server component.
 */
export function PolicyHero({
  eyebrow,
  title,
  lede,
  updated,
  operator,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  updated: string;
  operator: string;
}) {
  return (
    <section className="hero">
      <div className="wrap">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <div className="hero-sub">{lede}</div>
        <div className="hero-meta">
          <span className="hero-chip">
            <span className="pip" aria-hidden />
            Last updated <b>{updated}</b>
          </span>
          <span className="hero-chip">
            <span className="pip" aria-hidden />
            Operated by <b>{operator}</b>
          </span>
        </div>
      </div>
    </section>
  );
}
