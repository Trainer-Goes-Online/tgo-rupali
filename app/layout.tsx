import type { Metadata } from 'next';
import { Manrope, Schibsted_Grotesk } from 'next/font/google';
import './globals.css';
/* The shared footer's stylesheet. It loads from the ROOT layout because the
   footer renders on every surface (folded into the landing finale, and as a
   band on the checkout, booking, thank-you and policy pages), and a shared
   component whose CSS ships with one route renders unstyled on the others. */
import './footer.css';

import Analytics from '@/components/shared/Analytics';
import FunnelTracker from '@/components/shared/FunnelTracker';
import MetaPixel from '@/components/shared/MetaPixel';

/* DISPLAY = Instrument Sans, BODY = Manrope. Three faces were tried on
   23 Sep 2026: Bebas Neue is the SDP skin's, so the page read as that funnel;
   Syne was too wide; Unbounded's curves were too soft for a medical offer;
   Instrument Sans had the right shapes but its variable axis STOPS AT 700,
   so its heaviest weight still read as body text at headline size.

   The lesson is that this brand does not want a DISPLAY face, it wants a
   clean grotesque that goes HEAVY. Schibsted Grotesk runs 400-900, so the
   headline separates from the body by weight, case and tracking rather than
   by personality. Titles are set uppercase in CSS, and --fh-weight in
   globals.css is the one dial for how heavy.

   To change a face, swap it HERE and keep the variable names, so globals.css
   and landing.css need no edit.

   Both variables go on <html> (skin PART 3 law 2): the tokens that read
   them are declared on :root, and a var() is resolved on the element that
   declares it. On <body> every font-family would silently fall back. */
const display = Schibsted_Grotesk({
  /* Variable 400-900. No `weight` array: next/font loads the whole axis for a
     variable face, so --fh-weight can name any value in that range. */
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Manrope({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title:
    'Get Pregnant Naturally, Even If You Have PCOS, Thyroid, Low AMH or Unexplained Fertility Issues',
  description:
    'A personalised fertility programme designed to improve fertility readiness, strengthen underlying health & prepare your body for your next attempt at conception. 2,000+ fertility journeys guided.',
  /* Pre-launch: the figures and the health claims are not signed off yet.
     Comes off only after that sign-off, not before. */
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        {children}

        {/* ── TAGS, MOUNTED HERE AND NOWHERE ELSE ──────────────────────
            All three render nothing when their env ids are missing, so an
            unfilled variable leaves no broken script behind.

            They sit in the ROOT layout because each has work to do on more
            than the landing page. MetaPixel also captures first-touch
            attribution and the _fbc cookie, ABOVE its own pixel-id guard: a
            retargeting ad or an email can drop somebody straight onto
            /checkout, and that visit is the only one carrying the campaign.

            Analytics is the GA4 base tag, and it is part of this build rather
            than a snippet pasted in later, because every GA4 call checks for
            window.gtag and returns quietly when it is absent: without a base
            tag the whole browser funnel silently does nothing while the
            webhook keeps reporting purchases through the Measurement
            Protocol.

            FunnelTracker fires ViewContent and gates on the pathname itself,
            because app/page.tsx is SHAPE's half. ───────────────────────── */}
        <MetaPixel />
        <Analytics />
        <FunnelTracker />
      </body>
    </html>
  );
}
