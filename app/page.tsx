import './landing.css';

import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { AnnounceStrip } from '@/components/landing/AnnounceStrip';
import { TrustRow } from '@/components/landing/TrustRow';
import { Hero } from '@/components/landing/Hero';
import { ForYouIf } from '@/components/landing/ForYouIf';
import { Stories } from '@/components/landing/Stories';
import { ConversationWall } from '@/components/landing/ConversationWall';
import { Expert } from '@/components/landing/Expert';
import { Mechanism } from '@/components/landing/Mechanism';
import { Included } from '@/components/landing/Included';
import { Guarantee } from '@/components/landing/Guarantee';
import { Faq } from '@/components/landing/Faq';
import { Finale } from '@/components/landing/Finale';
import { StickyCta } from '@/components/landing/StickyCta';

/**
 * The landing page. VSL blueprint, SDP component system, themed from the
 * Fit With Rupali logo (forest + raspberry + lime leaf on white).
 *
 * Everything sits under one `.sdp-root` wrapper so the landing styles cannot
 * leak into the checkout / thank-you / legal routes LAUNCH owns. Tokens are
 * on :root (globals.css) so those routes can still read the palette.
 *
 * THE WHOLE PAGE, beat by beat, with its band:
 *
 *   0a announcement strip   §11 Urgency (chrome)    forest bar
 *   0b trust row            §12 Authority           light-alt strip
 *   1  hero / VSL           §8  Focal media         stage      lockup 1
 *   2  this is for you if   §2  one-sided ✓ list    LIGHT      lockup 2
 *   3  testimonials 1-4     §6  Proof (tiles)       LIGHT-ALT
 *   4  case cards x5        §6  Proof + §4 ledgers  LIGHT-ALT
 *   4b conversation wall    §6  Proof (volume)      LIGHT      lockup 3
 *   5a certificates         §12 marquee             DARK
 *   5b expert story         TEXT (no shape)         DARK
 *   6  works differently    §1  numbered ledger     LIGHT-ALT
 *   7  what's included      §3  programme grid      LIGHT      lockup 4
 *   8  guarantee            seal card + terms       DARK       lockup 5
 *   10 faq                  §5  ruled ledger        LIGHT
 *   11 finale               the peak                DARK       lockup 6
 *   12 sticky cta           chrome (steps aside at the finale)
 *
 * Beat 9 (Two Choices) is absent: optional in the blueprint, and the copy
 * has no decision beat. Dark lands on authority, risk and the peak only.
 */
export default function LandingPage() {
  return (
    <main className="sdp-root">
      <ScrollReveal />
      <AnnounceStrip />
      <TrustRow />
      <Hero />
      <ForYouIf />
      <Stories />
      <ConversationWall />
      <Expert />
      <Mechanism />
      <Included />
      <Guarantee />
      <Faq />
      <Finale />
      <StickyCta />
    </main>
  );
}
