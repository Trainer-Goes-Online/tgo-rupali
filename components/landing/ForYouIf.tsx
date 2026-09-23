import { CtaLockup } from '@/components/shared/CtaLockup';
import { SectionMasthead } from '@/components/shared/SectionMasthead';
import { CheckIcon } from '@/components/shared/icons';

/**
 * BEAT 2 · THIS IS FOR YOU IF.
 *
 * Shape: SELF-RECOGNITION SET, five ways of being stuck (treatments that
 * did not work, "normal" reports, the lose-weight advice, stacked
 * conditions, the partner). §2, rendered with the VSL default: the
 * ONE-SIDED ✓ list. Not the two-column for-you / not-for-you fit-check: the
 * copy disqualifies nobody, and a ✗ column with nothing honest in it would
 * be invented structure.
 *
 * A single centred 820px column (locked build rule). Rows, not a grid: the
 * reader reads down until one of them is about her, and a two-up grid
 * breaks that scan.
 *
 * Each row's opening clause is set bold as the recognition, the rest as the
 * detail. That is weight only: every word is the client's, in the client's
 * order, split at the sentence's own seam.
 */
const ITEMS = [
  {
    head: 'You’ve been trying to conceive for months or years',
    body: 'and have already gone through IVF, IUI, medications or other fertility treatments, but you still haven’t got the outcome you were hoping for.',
  },
  {
    head: 'Your reports keep coming back “normal”',
    body: 'and you’ve been put in the unexplained infertility category, which is even more frustrating because you still don’t know what exactly needs to change.',
  },
  {
    head: 'Your gynaecologist keeps telling you to “just lose weight” before trying again,',
    body: 'but you know your fertility cannot be explained by one number on the weighing scale alone.',
  },
  {
    head: 'You’re also dealing with underlying concerns',
    body: 'like PCOS, thyroid, low AMH, irregular cycles, endometriosis, adenomyosis, fibroids or hormonal imbalance, and you’re unsure which of these needs to be worked on first.',
  },
  {
    head: 'You want an approach that looks beyond female fertility alone',
    body: 'and can involve your partner with male fertility guidance when needed.',
  },
] as const;

const DELAYS = ['.04s', '.10s', '.16s', '.22s', '.28s'] as const;

export function ForYouIf() {
  return (
    <section id="for-you" className="sdp-who sdp-light">
      <div className="sdp-wrap">
        <SectionMasthead
          eyebrow="For Women Who Want To Conceive Naturally, Even After Months or Years of Trying"
          title={
            <>
              This Is For You <em>if:</em>
            </>
          }
          delay=".06s"
        />

        <ul className="sdp-who-list">
          {ITEMS.map((it, i) => (
            <li key={it.head} data-sdp-reveal style={{ '--d': DELAYS[i] ?? '.28s' } as React.CSSProperties}>
              <span className="ck" aria-hidden>
                <CheckIcon />
              </span>
              <span>
                <strong>{it.head}</strong> {it.body}
              </span>
            </li>
          ))}
        </ul>

        <div className="sdp-who-cta" data-sdp-reveal style={{ '--d': '.34s' } as React.CSSProperties}>
          <CtaLockup />
        </div>
      </div>
    </section>
  );
}
