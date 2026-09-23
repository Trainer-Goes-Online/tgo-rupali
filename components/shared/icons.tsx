/**
 * Line glyphs for the page chrome.
 *
 * The copy prints the badges, trust row and watch cue with emoji
 * (⭐ 🔥 💯 🛡️ ⬇️ ☑️). Emoji render as a different typeface at a different
 * weight on every OS, which is what makes a premium page look assembled.
 * So the LABELS stay verbatim and only the emoji become one-colour glyphs
 * matched to what each emoji meant. Same call Kunal and Deepti shipped.
 * No icon package: next, react and react-dom are the whole dependency list.
 */

type IconProps = { size?: number };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true as const,
});

/** ⭐ the money-back guarantee badge, and the trust-row stars */
export function StarIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor">
      <path d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z" />
    </svg>
  );
}

/** 🔥 the fertility-journeys badge */
export function FlameIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5s5 4.2 5 8.7a5 5 0 0 1-10 0c0-1.6.6-2.9 1.4-4 .3 1 .9 1.8 1.8 2.2.5-3 1.8-5.4 1.8-6.9z" />
      <path d="M12 21.5a3 3 0 0 0 3-3c0-1.9-3-4.2-3-4.2s-3 2.3-3 4.2a3 3 0 0 0 3 3z" />
    </svg>
  );
}

/** 💯 the "100% personalised" badge */
export function PercentBadgeIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M15.5 8.5l-7 7" />
      <circle cx="9.4" cy="9.4" r="1.5" />
      <circle cx="14.6" cy="14.6" r="1.5" />
    </svg>
  );
}

/** 🛡️ the trust-row guarantee */
export function ShieldCheckIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.5l8 3v6.7c0 4.9-3.4 9.2-8 10-4.6-.8-8-5.1-8-10V5.5l8-3z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

/** ☑️ the self-recognition rows */
export function CheckIcon({ size = 13 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** The CTA's circular chip. */
export function ArrowRightIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

/** ⬇️ the watch-the-video cue */
export function ArrowDownIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function PlayIcon({ size = 26 }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

/** The FAQ toggle: a plus that rotates 45deg into an x when open. */
export function PlusIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/** Placeholder marks: what kind of asset is missing. */
export function ImageGlyph({ size = 30 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="M4 17l4.8-4.6a2 2 0 0 1 2.7-.1L20 19" />
    </svg>
  );
}

export function FilmGlyph({ size = 30 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9h19M2.5 15h19M7.5 5v14M16.5 5v14" />
    </svg>
  );
}

/* ── The commerce surfaces (checkout, booking, thank-you) ─────────────── */

export function CaretDownIcon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function LockIcon({ size = 13 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10.5" width="16" height="10.5" rx="2.2" />
      <path d="M8 10.5V7.6a4 4 0 0 1 8 0v2.9" />
    </svg>
  );
}

export function CardIcon({ size = 19 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.8h19" />
      <path d="M6.4 14.6h3.4" />
    </svg>
  );
}

export function SealCheckIcon({ size = 38 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.6l2.4 2 3.1-.3 1 3 2.6 1.8-1.2 2.9 1.2 2.9-2.6 1.8-1 3-3.1-.3-2.4 2-2.4-2-3.1.3-1-3-2.6-1.8L4.1 12 2.9 9.1l2.6-1.8 1-3 3.1.3z" />
      <polyline points="8.6 12 11 14.4 15.6 9.8" />
    </svg>
  );
}

export function AlertIcon({ size = 14 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9.2" />
      <path d="M12 7.6v5.2" />
      <circle cx="12" cy="16.4" r="1.05" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} fill="currentColor">
      <path d="M12.04 2C6.6 2 2.18 6.42 2.18 11.86c0 1.74.46 3.44 1.32 4.94L2.1 22l5.34-1.38a9.84 9.84 0 0 0 4.6 1.16h.01c5.44 0 9.86-4.42 9.86-9.86A9.8 9.8 0 0 0 19 4.87 9.8 9.8 0 0 0 12.04 2zm0 1.8c2.15 0 4.17.84 5.69 2.36a7.99 7.99 0 0 1 2.36 5.7c0 4.45-3.6 8.06-8.06 8.06a8.07 8.07 0 0 1-4.1-1.13l-.3-.17-3.05.8.81-2.97-.19-.31a7.98 7.98 0 0 1-1.22-4.28c0-4.45 3.62-8.06 8.06-8.06zm-2.5 4.2c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.35.99 2.51c.12.16 1.7 2.6 4.13 3.55 2.02.8 2.43.64 2.87.6.44-.04 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.19-1.42-1.33-1.66-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.3-.73-1.78-.19-.46-.39-.4-.53-.4z" />
    </svg>
  );
}

/* One distinct glyph per component of the 90-day programme, in the order the
   copy lists them. Same 1.8 stroke and 24-box as the rest of this file. */

/** 1 · Complete Fertility & Health Assessment */
export function ClipboardPulseIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 4.5h6M8.5 3.2h7a1.3 1.3 0 0 1 1.3 1.3v.9h1.4A1.8 1.8 0 0 1 20 7.2v12a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 19.2v-12a1.8 1.8 0 0 1 1.8-1.8h1.4v-.9A1.3 1.3 0 0 1 8.5 3.2z" />
      <path d="M7.6 14h2.2l1.3-2.6 1.8 5 1.3-2.4h2.2" />
    </svg>
  );
}

/** 2 · Bloodwork & Report Review */
export function DropletIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2c3 3.4 5.2 6.1 5.2 8.8a5.2 5.2 0 0 1-10.4 0c0-2.7 2.2-5.4 5.2-8.8z" />
      <path d="M9.6 12.4a2.6 2.6 0 0 0 2.6 2.6" />
    </svg>
  );
}

/** 3 · Personalised Fertility Nutrition Plan */
export function LeafPlateIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.6" />
      <path d="M15.4 8.8c0 3-2 5.2-4.8 5.4-.6-2.9 1.3-5.2 4.8-5.4z" />
      <path d="M10.6 14.2c-.5-1.6-1.4-2.6-2.6-3.2" />
    </svg>
  );
}

/** 4 · 2-Weeks Progress Reviews & Plan Adjustments */
export function CalendarCheckIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.6" y="5" width="16.8" height="15.4" rx="1.8" />
      <path d="M3.6 9.6h16.8M8.2 3.4v3.2M15.8 3.4v3.2" />
      <path d="M9 14.8l2.2 2.2 4-4.2" />
    </svg>
  );
}

/** 5 · Direct Accountability & Ongoing Support */
export function ChatSupportIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.4 12.6c0 3.8-3.8 6.9-8.4 6.9a10 10 0 0 1-2.6-.34L4.6 20.7l1.3-3.4A6.4 6.4 0 0 1 3.6 12.6c0-3.8 3.8-6.9 8.4-6.9s8.4 3.1 8.4 6.9z" />
      <path d="M8.8 12.4h.01M12 12.4h.01M15.2 12.4h.01" />
    </svg>
  );
}

/** 6 · Male Fertility + Couple Support When Needed */
export function CoupleIcon({ size = 20 }: IconProps) {
  return (
    <svg {...base(size)} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.4" cy="7.6" r="2.9" />
      <circle cx="15.8" cy="7.6" r="2.9" />
      <path d="M3.4 20.2c0-2.8 2.2-4.8 5-4.8s5 2 5 4.8" />
      <path d="M13.6 15.9a4.9 4.9 0 0 1 2.2-.5c2.8 0 5 2 5 4.8" />
    </svg>
  );
}
