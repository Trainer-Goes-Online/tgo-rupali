'use client';

import { useEffect, useState } from 'react';
import { site } from '@/lib/site';

/**
 * "OFFER ENDS IN" : the copy's 5-hour countdown, part 3 of the CTA lockup.
 *
 * The deadline is stamped ONCE per visitor into localStorage, so a refresh
 * or a second tab continues the same countdown instead of restarting it. A
 * timer that resets on every load is what makes urgency read as fake, and
 * it takes one refresh to catch. Every instance reads the same deadline, so
 * all the lockups on the page agree.
 *
 * While the page is open it never rolls over: it counts to zero and stops
 * rendering. A visit that STARTS after the stored deadline has passed gets a
 * fresh window (Atul, 2026-09-12 on Deepti: a stale deadline otherwise kills
 * the countdown for that browser forever, which is a dead widget, not honesty).
 *
 * Renders nothing until mounted: localStorage is client-only, and a
 * server-rendered digit would hydrate-mismatch.
 */
const KEY = 'tgo-rupali.offer.deadline';

function pad(n: number) {
  return String(Math.max(0, n)).padStart(2, '0');
}

export function OfferTimer() {
  const hours = Number(site.offerHours) || 0;
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (hours <= 0) return;
    const windowMs = hours * 3600_000;

    let deadline = Number(window.localStorage.getItem(KEY) || 0);
    // re-stamp when missing, already spent, or absurd (clock change / tampering)
    if (!deadline || deadline <= Date.now() || deadline - Date.now() > windowMs) {
      deadline = Date.now() + windowMs;
      try {
        window.localStorage.setItem(KEY, String(deadline));
      } catch {
        /* private mode: the countdown simply restarts next visit */
      }
    }

    const tick = () => setLeft(Math.max(0, deadline - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [hours]);

  if (hours <= 0 || left === null || left <= 0) return null;

  const s = Math.floor(left / 1000);
  /* Three cells. The window is 5 hours, so a DAYS cell would read 00 for
     the life of the offer, and a dead digit next to live ones reads broken. */
  const cells = [
    { v: pad(Math.floor(s / 3600)), k: 'Hrs' },
    { v: pad(Math.floor((s % 3600) / 60)), k: 'Min' },
    { v: pad(s % 60), k: 'Sec' },
  ];

  return (
    <div className="sdp-urgency" role="timer" aria-live="off">
      <span className="sdp-urgency-label">Offer ends in</span>
      <span className="sdp-urgency-timer">
        {cells.map((c, i) => (
          <span key={c.k} className="sdp-urgency-group">
            <span className="sdp-urgency-cell">
              <b>{c.v}</b>
              <i>{c.k}</i>
            </span>
            {i < cells.length - 1 && <span className="sdp-urgency-sep" aria-hidden />}
          </span>
        ))}
      </span>
    </div>
  );
}
