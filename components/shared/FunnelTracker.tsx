'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { trackViewItem } from '@/lib/track';

/**
 * Landing-page tracking. Renders nothing.
 *
 * It mounts in the ROOT layout and gates on the pathname, because app/page.tsx
 * is SHAPE's half. The gate keeps ViewContent meaning "saw the offer":
 * ungated it would also fire on /checkout, where AddToCart is the arrival.
 *
 * ONLY ViewContent lives here. AddToCart fires from the checkout's own mount,
 * because this page carries six CTA lockups plus a sticky bar and a reader who
 * clicks two would count twice, and because a click is not an arrival.
 */
export default function FunnelTracker() {
  const pathname = usePathname();
  const fired = useRef(false);

  useEffect(() => {
    if (pathname !== '/' || fired.current) return;
    fired.current = true;
    trackViewItem();
  }, [pathname]);

  return null;
}
