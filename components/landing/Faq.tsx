import { SectionMasthead } from '@/components/shared/SectionMasthead';
import { PlusIcon } from '@/components/shared/icons';

/**
 * BEAT 10 · COMMON QUESTIONS  (§5 Objection, LIGHT)
 *
 * The SDP ruled FAQ: bg-alt rows; open = white + forest border + the plus
 * rotates 45deg into an x and fills. The first question is open on load, so
 * the reader sees an answer without having to learn the control.
 *
 * Built on native <details>/<summary>, not React state: it opens and closes
 * with no JavaScript, keyboard and screen-reader behaviour come for free,
 * and it cannot hydrate-mismatch. Fail-open by construction.
 *
 * No "Most asked" pill on Q1: nobody has measured which question is asked
 * most, and that label would be a claim.
 *
 * The copy's "1." to "5." become the skin's ordinal; question and answer
 * text verbatim, answers split at the copy's own paragraph breaks.
 */
const QA = [
  {
    q: 'Will I actually be working directly with Dt. Rupali?',
    a: [
      'Yes. Your journey is personally overseen by Dt. Rupali.',
      'She personally reviews your fertility history, health reports, menstrual patterns, current nutrition and lifestyle, builds your plan around your individual starting point, and continues to review and adjust it as you progress through the programme.',
      'So you are not joining a generic coaching system or being passed off after enrolment. The strategy and key decisions around your fertility plan come directly from Rupali.',
    ],
  },
  {
    q: 'Will I have to follow a very strict “fertility diet” or cook separately from my family?',
    a: [
      'No. Your plan is built around your existing food preferences, routine, work timings and lifestyle. The goal is not to make you eat unusual foods or follow something you cannot sustain for 90 days. Rupali works with foods that can realistically fit into your day-to-day life.',
    ],
  },
  {
    q: 'I’m already taking medicines or seeing a gynaecologist. Will this interfere with that?',
    a: [
      'No. The programme is meant to work alongside your existing medical care, not replace it.',
      'You should continue prescribed medicines and medical treatment under your doctor’s guidance. Rupali focuses on the nutrition, lifestyle and health factors within her scope while taking your existing reports and medical history into account.',
    ],
  },
  {
    q: 'What if my husband isn’t ready to follow a full fertility programme with me?',
    a: [
      'He does not need to enrol in a complete programme from Day 1. If Rupali feels the male side also needs attention, especially in unexplained fertility cases, she can provide male fertility guidance and simple couple-focused support without making the entire journey dependent on his participation.',
    ],
  },
  {
    q: 'What if I have a busy job, travel often or cannot follow the plan perfectly every single day?',
    a: [
      'The programme is personalised around your real life, not an ideal routine. Your work schedule, eating habits, food preferences and lifestyle are considered from the beginning, and your plan is reviewed regularly so it can be adjusted when needed.',
      'You’ll also receive an Eating Out Guide to help you make better choices at restaurants, social events or while travelling without feeling like one meal will throw your entire plan off track.',
    ],
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="sdp-faq sdp-light">
      <div className="sdp-wrap">
        <SectionMasthead
          title={
            <>
              Common Questions From Women Trying To Conceive <em>Naturally</em>
            </>
          }
          delay=".06s"
        />

        <div className="sdp-faq-list">
          {QA.map((item, i) => (
            <details className="sdp-q" key={item.q} open={i === 0}>
              <summary className="sdp-q-head">
                <span className="sdp-q-text">
                  <span className="qn">Q.{String(i + 1).padStart(2, '0')}</span>
                  {item.q}
                </span>
                <span className="ic" aria-hidden>
                  <PlusIcon />
                </span>
              </summary>
              <div className="sdp-q-inner">
                {item.a.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
