import { asset } from '@/components/shared/asset-version';

/**
 * THE CLIENT LOGO: "FIT WITH RUPALI" (supplied 2026-09-19).
 *
 * The copy's first line is "CLIENT LOGO". The locked SDP rule is no logo /
 * nav BAR on a VSL landing page, and this is not one: a single centred mark
 * at the top of the hero stage, no links, no chrome, above the audience
 * gate. The one place a first-time visitor learns whose page this is.
 *
 * THE FILE HAS WIDE WHITE MARGINS. The artwork sits in roughly the middle
 * half of a near-square canvas, so shown whole at logo height the tree and
 * wordmark would render at half size. `.sdp-brand-crop` is a window cut to
 * the lockup's content box (about 490 x 240 of the 500 x 466 canvas,
 * judged by eye). The crop numbers are percentages, so they hold at any
 * export resolution with the same framing.
 *   · If a TRIMMED or TRANSPARENT export replaces this file, delete the
 *     crop rules in landing.css (06a) and bump ASSET_V in the same pass.
 *
 * THE WHITE GROUND. The PNG is opaque, and the hero stage carries a
 * blueprint grid, so an opaque white box would cut a hole in the grid. The
 * <img> is `mix-blend-mode: multiply`, which drops white to nothing. That
 * only works if no ancestor between it and the stage forms an isolated
 * group, which is why this renders OUTSIDE `.sdp-hero-inner` (z-index
 * there makes a stacking context) and why it carries no data-sdp-reveal
 * (opacity + transform would do the same). Keep it that way.
 */
const LOGO_SRC = '/brand/fit-with-rupali-logo.png';

export function BrandMark() {
  return (
    <div className="sdp-brand">
      <div className="sdp-brand-crop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(LOGO_SRC)} alt="Fit With Rupali" width={500} height={466} decoding="async" />
      </div>
    </div>
  );
}
