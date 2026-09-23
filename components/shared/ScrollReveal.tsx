'use client';

import { useEffect } from 'react';

/**
 * The page's single reveal observer. Mount it ONCE inside `.sdp-root`;
 * every section just carries `data-sdp-reveal` (plus an optional `--d`
 * delay) and stays a server component.
 *
 * FAIL-OPEN (C7). The CSS hides a reveal target only under `html.sdp-armed`,
 * and only this effect adds that class. JS never loads, or a script throws:
 * nothing is armed and the page renders visible. Reduced motion: never armed.
 *
 * NO FLASH, NO PRE-HYDRATION WRITES (skin PART 3 law 4). Arming happens in
 * this effect, after hydration, and in ONE synchronous pass: every rect is
 * read first, then `sdp-armed` goes on and the nodes already on screen get
 * `vis` in the same task. The browser cannot paint between two writes in one
 * task, so above-the-fold content never blinks out.
 *
 * The scroll sweep is the second belt: an anchor jump or a fast flick can
 * land past an element before the observer fires, and an element stuck
 * invisible below the fold is the failure this pattern exists to prevent.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-sdp-reveal]'));
    if (!nodes.length) return;

    const inView = (el: HTMLElement) =>
      el.getBoundingClientRect().top < window.innerHeight * 0.92;

    // READ every rect first ...
    const onScreen = nodes.filter(inView);

    // ... then WRITE, in the same task.
    const root = document.documentElement;
    root.classList.add('sdp-armed');
    onScreen.forEach((n) => n.classList.add('vis'));

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('vis');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    nodes.filter((n) => !n.classList.contains('vis')).forEach((n) => io.observe(n));

    const sweep = () => {
      for (const n of nodes) {
        if (!n.classList.contains('vis') && inView(n)) {
          n.classList.add('vis');
          io.unobserve(n);
        }
      }
    };
    window.addEventListener('scroll', sweep, { passive: true });
    window.addEventListener('resize', sweep);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', sweep);
      window.removeEventListener('resize', sweep);
      root.classList.remove('sdp-armed');
    };
  }, []);

  return null;
}
