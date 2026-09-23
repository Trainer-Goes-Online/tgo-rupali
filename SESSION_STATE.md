# tgo-rupali · session state

**What this is.** A VSL funnel for **Dt. Rupali Nayak** (clinical dietitian,
fertility), brand **FIT WITH RUPALI**. The folder is named for the client
contact, Mukul, until 23 Sep 2026; renamed to tgo-rupali to match the brand.
Next click is a ₹97 start into a 90-day personalised fertility programme.
Built by the SHAPE agent in VSL mode, three passes, all done 2026-09-19.
**The landing page is complete to the end of the copy.** Everything else
(checkout, thank-you / booking, legal pages, footer, payments, tracking) is
LAUNCH's half and is not built.

**Copy source of truth.** `funnel-copy/01-landing-vsl.md`, verbatim from Atul.
Every string on the page is copied from it. Emoji become line glyphs (labels
unchanged). The copy's "1." ordinals render as the skin's "01" / "Q.01".
The only other editorial acts: bold weight on each For-You-If row's opening
clause, "Name, age" on the case cards, and the hero H1 repeated as the
finale headline (the copy has no closing line).

**Stack.** Next.js 15 App Router + React 19, vanilla CSS, `@/*` alias to the
project root. Mirrors `tgo-deepti`. Nothing installed or run: `npm install`
and the first `npm run dev` are Atul's.

## Design

Locked **SDP VSL skin** (`~/.claude/system/design-system.skin.sdp-vsl.md`).
- **PART 1 (theme)** = `app/globals.css`, tokens on `:root` (law 1). Themed
  from the client logo: **forest** `#0B3A1A`/`#1E6B34` is the brand slot
  (headings, eyebrows, rules, checks, every dark band); **raspberry**
  `#C0084A` is action only (CTA fill, the ₹97 figure, the one lit word per
  headline, the logo's own "WITH" device); **lime** `#78B000`/`#9BD138` is
  the leaf: dots and icons on light bands, accent text on dark bands. The
  countdown chip is forest, deliberately not red. Case-study outcomes are lit
  in forest, not raspberry, to keep raspberry scarce.
- **PART 2 (components)** = `app/landing.css`, token-only, zero brand hexes,
  sections 00-16 then 90 responsive / 91 touch / 92 reduced motion. New work
  appends above 90 and adds breakpoints INTO the existing 90 blocks (law 6).
- Type: Bebas Neue (display) + Manrope (body) via `next/font`, variables on
  `<html>` (law 2).
- Logo: `public/brand/fit-with-rupali-logo.png`, shown through a crop window
  (landing.css 06a) with `mix-blend-mode: multiply` so its white ground
  vanishes into the hero stage. It sits OUTSIDE `.sdp-hero-inner` on purpose
  (a z-index ancestor would isolate the blend). See `BrandMark.tsx`.

## The page as built

| # | Beat | Shape → component | Band | File |
|---|---|---|---|---|
| 0a | announcement | chrome → forest bar, raspberry number chips | forest | `AnnounceStrip.tsx` |
| 0b | trust row | credential set → avatar rings + stars + guarantee | light-alt | `TrustRow.tsx` |
| 1 | hero / VSL | focal media → logo, pill gate, 3-tier H1, without-line, deck, 8 condition chips, watch cue, VSL frame, **lockup 1**, 4-stat table | stage | `Hero.tsx`, `BrandMark.tsx`, `VslFrame.tsx` |
| 2 | for you if | self-recognition → one-sided ✓ list, **lockup 2** | light | `ForYouIf.tsx` |
| 3 | testimonials 1-4 | proof → 9:16 tiles | light-alt | `Stories.tsx` |
| 4 | 5 case files | proof + §4 magnitude → case cards with a figure ledger, outcome cell lit | light-alt | `Stories.tsx` |
| 4b | conversations | proof volume → two counter-scrolling rows x 10, **lockup 3** | light | `ConversationWall.tsx` |
| 5a | certificates | credential set → R→L marquee | DARK | `Expert.tsx` |
| 5b | expert story | no shape → **TEXT**, drop-cap lede, photo beside | DARK | `Expert.tsx` |
| 6 | works differently | the N principles → §1 numbered LEDGER (not cards: the next beat is cards) | light-alt | `Mechanism.tsx` |
| 7 | what's included | accumulation → 3x2 programme grid, **lockup 4** | light | `Included.tsx` |
| 8 | guarantee | assurance + terms set → seal card, ✓ ask rows, **lockup 5** | DARK | `Guarantee.tsx` |
| 10 | FAQ | objection set → ruled ledger on native `<details>`, Q1 open | light | `Faq.tsx` |
| 11 | finale | the peak → hero H1 repeated, **lockup 6**, colophon, closing-stage depth | DARK | `Finale.tsx` |
| 12 | sticky CTA | chrome → shows past the hero, steps aside at `#finale` (no page reserve needed), carries the countdown | glass | `StickyCta.tsx` |

Beat 9 (Two Choices) is not built: optional in the blueprint, no copy for it.
Included sits on light, not the skin's light-alt, because the mechanism band
directly above is light-alt and two tinted bands in a row merge.

Shared: `components/shared/` CtaLockup (button → 3 badges → countdown),
OfferTimer (one localStorage deadline, 5h, every instance agrees),
ScrollReveal (fail-open, arms after hydration in one read-then-write pass),
SectionMasthead, MediaPlaceholder, icons, asset-version (`ASSET_V = '1'`).
Config: `lib/site.ts` (checkoutUrl `/checkout`, fee 97 as the single price
source, offerHours, CTA_LABEL, feeLabel, feePaise).

## Every asset slot (fill, then bump ASSET_V in the same pass)

| Slot | Where | Spec |
|---|---|---|
| VSL | `VIMEO_ID` in `VslFrame.tsx` | 16:9; else change `.sdp-vsl` ratio |
| 5 reviewer portraits | `AVATARS` in `TrustRow.tsx` | 128px square WebP, face-centred, real consenting clients |
| Testimonial 1-4 | `TESTIMONIALS` in `Stories.tsx` | Vimeo id or still; 9:16 assumed |
| 20 conversation screenshots | `ROW_1` / `ROW_2` in `ConversationWall.tsx` | 4:5 assumed, ~460px wide WebP |
| Rupali's solo picture | `PHOTO_SRC` in `Expert.tsx` | portrait 4:5 |
| Certificates 1-6 | `CERTS` in `Expert.tsx` | landscape scans, 7:5 assumed, shown `contain` |

Every placeholder is sized at its assumed ratio and labelled with what goes
there. Originals stay outside `/public` (`assets-source/` is gitignored).

## Open flags (complete list)

**Claims and honesty (block removing `noindex` in `app/layout.tsx`)**
1. "Get Pregnant Naturally", "95% Success Rate" (95% of what, measured
   how?) and "Without More IVF/IUI Attempts" need Rupali's sign-off.
2. **Guarantee mismatch.** "100% Money-Back Guarantee" appears in the trust
   row, every lockup and pillar 04, under a pregnancy headline. The terms
   (the guarantee beat) promise *agreed fertility health markers in 90 days*,
   not pregnancy. The likeliest refund dispute. NO-BRAINER pass on the badge
   wording recommended; LAUNCH's refund page must state the terms plainly.
3. Case stories are named health outcomes (three "conceived naturally",
   Swati's lab values). Written consent from each client to be named and
   quoted, and Rupali's sign-off on the figures. Garima's and Aditi's stories
   do not carry "alongside medical care" (copy as supplied).
4. The 5.0 review rating has no stated source.

**Offer facts LAUNCH needs**
5. What ₹97 buys is never stated ("₹97 To Start"; the CTA says "your
   personalised plan"; the programme is 90 days). Needs the product name and
   the full programme price for the checkout and the legal pages.
6. ~~No business details yet~~ **RECEIVED 2026-09-19**, verbatim in the
   `business` export of `lib/site.ts` (registered name FITWITHRUPALI, Bhilai
   address, 2 phones, 2 emails, jurisdiction Chhattisgarh). Nothing renders
   them yet: the finale's marked slot for LAUNCH's `<SiteFooter folded />`
   under the colophon is still empty.
7. Every CTA links to `/checkout`, which does not exist until LAUNCH builds it.

**Additions not printed in the copy (each one line to remove)**
8. Lockups 3-6 (after the proof run, after Included, after the Guarantee,
   in the finale) and the sticky bar are the VSL blueprint's repeating CTA;
   the copy prints lockups only after the hero and For-You-If.
9. The finale headline repeats the hero H1 because the copy ends at the FAQ
   with no closing line. A dedicated closing headline from NO-BRAINER would
   be stronger.
10. The logo is shown on the hero stage (copy line 1 asks for it). Not a nav
    bar, so within the locked "no logo bar" rule, but noted.

**Technical to check on the live page**
11. Logo crop offsets (landing.css 06a) were judged by eye: check the tree's
    top leaf and the tagline are not clipped. A trimmed, transparent export
    would let the crop block go.
12. Mobile type sizes are ESTIMATED from Bebas Neue's published metrics, not
    measured from the woff2 (landing.css section 90). Worth one measure pass.
13. Media ratios for testimonials (9:16), screenshots (4:5) and certificates
    (7:5) are assumptions; each is one constant plus one CSS ratio rule.
14. Number format varies in the copy ("2,000+" vs "2000+"); rendered verbatim.

## Not SHAPE's half
Checkout, thank-you / booking, legal pages, shared footer, Razorpay, Meta
CAPI, GA4, `.env.example`: the LAUNCH agent. The root layout has an empty
slot where it mounts MetaPixel + Analytics. `lib/site.ts` is shared; LAUNCH
extends it with the business facts object and reads `feePaise` / `feeLabel`
rather than typing the price again.

## Standing rules
- Bump `ASSET_V` in `components/shared/asset-version.ts` in the same pass as
  any artwork swap. Every `/public` path goes through `asset()`.
- No em dashes anywhere, including comments.
