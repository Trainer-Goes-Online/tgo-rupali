import { CtaLockup } from '@/components/shared/CtaLockup';
import {
  CalendarCheckIcon,
  ChatSupportIcon,
  ClipboardPulseIcon,
  CoupleIcon,
  DropletIcon,
  LeafPlateIcon,
} from '@/components/shared/icons';
import { SectionMasthead } from '@/components/shared/SectionMasthead';

/**
 * BEAT 7 · WHAT'S INCLUDED IN YOUR 90-DAY FERTILITY PROGRAMME  (LIGHT)
 *
 * Shape: ACCUMULATION. "Six personalised components" that sum to one
 * programme (§3). Rendered as the SDP programme grid: numbered cards, 3 x 2.
 * The ordinal is an INVENTORY mark, not an order of operations, so there is
 * no connector line or timeline: the components run together, they are not
 * steps. No values per item and no total, because the copy prices nothing
 * and a typed-in value would be an invented figure.
 *
 * Band: LIGHT, where the skin's rhythm says light-alt. The mechanism beat
 * directly above is light-alt, and two tinted bands in a row merge into one.
 *
 * Each card carries one distinct glyph and no ordinal. The copy numbers the
 * six components, but they run together rather than in sequence, so the number
 * was never load-bearing. Every title and description is verbatim. Carries a
 * lockup (value beat).
 */
/* One per ITEM, same order. Sized here, coloured by CSS. */
const ICONS = [
  <ClipboardPulseIcon key="a" size={22} />,
  <DropletIcon key="b" size={22} />,
  <LeafPlateIcon key="c" size={22} />,
  <CalendarCheckIcon key="d" size={22} />,
  <ChatSupportIcon key="e" size={22} />,
  <CoupleIcon key="f" size={22} />,
];

const ITEMS = [
  {
    title: 'Complete Fertility & Health Assessment',
    desc: 'We begin by reviewing your fertility history, medical concerns, menstrual cycle, lifestyle, food habits, sleep, digestion, activity levels and current routine so the plan starts from your actual situation, not assumptions.',
  },
  {
    title: 'Bloodwork & Report Review',
    desc: 'Your blood reports, fertility markers and relevant scans/ultrasounds are reviewed before the plan is built, helping identify which health areas need attention first and what your baseline looks like.',
  },
  {
    title: 'Personalised Fertility Nutrition Plan',
    desc: 'Your nutrition plan is created around your health history, fertility concerns, food preferences, lifestyle and current markers, and is updated as your body and progress change throughout the programme.',
  },
  {
    title: '2-Weeks Progress Reviews & Plan Adjustments',
    desc: 'Every 2 weeks, Rupali reviews how things are progressing, checks your updates and meal pictures, gives feedback, and adjusts your nutrition plan based on how you are responding.',
  },
  {
    title: 'Direct Accountability & Ongoing Support',
    desc: 'You stay connected throughout the journey through a dedicated support group where you can share meal pictures, progress updates, questions and concerns and receive ongoing guidance instead of waiting weeks for the next interaction.',
  },
  {
    title: 'Male Fertility + Couple Support When Needed',
    desc: 'Because fertility is not always a female-only issue, the programme can also include male fertility guidance for your partner, especially in cases of unexplained infertility issues, along with couple-focused movement guidance and pelvic-floor exercises as part of the broader fertility journey.',
  },
] as const;

export function Included() {
  return (
    <section id="included" className="sdp-prog sdp-light">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              What’s Included In Your <em>90-Day</em> Fertility Programme
            </>
          }
          sub="Six personalised components designed to help you understand your fertility health, improve what needs attention first & prepare your body better for natural conception."
          delay=".06s"
        />

        <div className="sdp-prog-grid">
          {ITEMS.map((it, i) => (
            <article className="sdp-prog-card" key={it.title} data-sdp-reveal style={{ '--d': `${0.04 + (i % 3) * 0.07}s` } as React.CSSProperties}>
              <span className="sdp-prog-icon" aria-hidden>
                {ICONS[i]}
              </span>
              <h3 className="sdp-prog-title">{it.title}</h3>
              <p className="sdp-prog-desc">{it.desc}</p>
            </article>
          ))}
        </div>

        <div className="sdp-prog-cta" data-sdp-reveal>
          <CtaLockup />
        </div>
      </div>
    </section>
  );
}
