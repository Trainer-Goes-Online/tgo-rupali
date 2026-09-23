'use client';

import { useEffect, useState } from 'react';
import { site, CTA_LABEL } from '@/lib/site';
import { ArrowRightIcon, CoupleIcon, ShieldCheckIcon } from '@/components/shared/icons';

/**
 * BEAT 12 · STICKY CTA  (page chrome, a weld: not gated)
 *
 * The conditional version from the library: hidden while the hero is on
 * screen (its own CTA is right there), shown once the reader is past it,
 * and hidden again when the finale arrives, so the peak and the footer
 * LAUNCH folds into it are never covered. Because it steps aside at the
 * end, it needs no reserved height on the page.
 *
 * Structure matched to resetbyshrutisolanki.in (23 Sep 2026): a COLUMN, not
 * a row. Lit beam across the top edge, the full CTA beneath it, then a
 * two-item trust row. The price tag and the countdown that used to flank the
 * button are gone: the reference carries neither, and three competing
 * elements on one line left the button too narrow to hold its own label.
 *
 * Fail-safe: server-renders hidden. If JS never runs, the bar never shows,
 * and every section already has its own CTA. Hidden means inert: aria-hidden
 * and out of the tab order, so a keyboard user never lands on an
 * off-screen link.
 */
export function StickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [atFinale, setAtFinale] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('top');
    const finale = document.getElementById('finale');
    const obs: IntersectionObserver[] = [];

    if (hero) {
      const io = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting && e.boundingClientRect.top < 0), {
        threshold: 0,
      });
      io.observe(hero);
      obs.push(io);
    }
    if (finale) {
      const io = new IntersectionObserver(([e]) => setAtFinale(e.isIntersecting), { threshold: 0 });
      io.observe(finale);
      obs.push(io);
    }
    return () => obs.forEach((o) => o.disconnect());
  }, []);

  const on = pastHero && !atFinale;

  return (
    <div className={`sdp-stuck${on ? ' on' : ''}`} aria-hidden={!on}>
      <span className="sdp-stuck-beam" aria-hidden />
      <div className="sdp-stuck-inner">
        <a className="sdp-stuck-go" href={site.checkoutUrl} tabIndex={on ? 0 : -1} data-cta>
          <span>{CTA_LABEL}</span>
          <span className="arrow" aria-hidden>
            <ArrowRightIcon />
          </span>
        </a>
        <ul className="sdp-stuck-trust">
          <li>
            <span className="trust-ic" aria-hidden>
              <ShieldCheckIcon size={14} />
            </span>
            <b>100%</b> Money-Back Guarantee
          </li>
          <li>
            <span className="trust-ic" aria-hidden>
              <CoupleIcon size={14} />
            </span>
            <b>2,000+</b> Fertility Journeys Guided
          </li>
        </ul>
      </div>
    </div>
  );
}
