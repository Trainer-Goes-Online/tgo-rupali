import type { Metadata } from 'next';

import '../legal.css';
import { LegalPage, type Clause } from '@/components/legal/LegalPage';
import { business, emailPrimary, feeLabel, phonePrimary, phonePrimaryE164 } from '@/lib/site';
import { PROGRAMME_COMPONENTS, PROGRAMME_TITLE } from '@/lib/offer';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: `The terms on which ${business.registeredName} provides the ${PROGRAMME_TITLE}.`,
  robots: { index: false, follow: false },
};

const UPDATED = '23 September 2026';

/* THE HEALTH DISCLAIMER IS CLAUSE 02, not an afterthought at the end. This
   funnel sells a nutrition and lifestyle programme to women trying to conceive,
   many of them managing PCOS, thyroid conditions, endometriosis, fibroids or
   low AMH, and several of them mid-treatment with a gynaecologist. The single
   most important thing these terms do is state that this is nutrition and
   lifestyle guidance, that it works alongside medical care rather than
   replacing it, and that nobody should stop a prescribed treatment because of
   anything here. That protects the reader first and the business second.

   Clauses are referred to by NAME in the prose, never by number, so inserting
   or reordering one cannot silently break a cross-reference. */
const CLAUSES: Clause[] = [
  {
    id: 'these-terms',
    heading: 'These terms',
    body: (
      <p>
        These terms apply when you use this website, pay the {feeLabel} to start
        or join the {PROGRAMME_TITLE} provided by {business.registeredName},
        trading as {business.tradingName}. By paying you accept these terms. If
        you do not accept them, please do not pay.
      </p>
    ),
  },
  {
    id: 'health-disclaimer',
    heading: 'Health disclaimer, and what this programme is not',
    nav: 'Health disclaimer',
    body: (
      <>
        <p>
          This is a nutrition and lifestyle programme. It is not medical
          treatment, it is not fertility treatment, and nothing on this website
          or in your plan is a medical diagnosis or a prescription.
        </p>
        <ul>
          <li>
            The programme is meant to work alongside your existing medical care,
            not replace it. We do not replace your doctor, your gynaecologist,
            your fertility specialist or any other treating clinician.
          </li>
          <li>
            <b>
              Do not start, stop or change any prescribed medication, treatment
              cycle or procedure because of anything we tell you.
            </b>{' '}
            Those decisions are for your treating doctor alone.
          </li>
          <li>
            Tell us about your medical conditions, your medication and any
            fertility treatment you are undergoing before you begin, and keep us
            updated if they change, so your plan can be built around them
            safely.
          </li>
          <li>
            If you are already pregnant, or you have an eating disorder, kidney
            disease, liver disease or any condition requiring a medically
            supervised diet, speak to your doctor before starting and tell us
            what they advise.
          </li>
          <li>
            If you feel unwell at any point, stop and seek medical attention.
            This programme is never a substitute for urgent care.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'results',
    heading: 'Results are not guaranteed to be identical',
    nav: 'Results are not identical',
    body: (
      <>
        <p>
          The stories and figures shown on this website are outcomes reported by
          individual clients. They are examples, not a promise of what you will
          achieve. Fertility markers, cycles and conception respond differently
          from person to person depending on age, diagnosis, medication,
          treatment history, genetics, your partner&rsquo;s health, sleep,
          stress and how consistently a plan is followed.
        </p>
        <p>
          Our guarantee is set out on the Refund page. It is measured against
          the fertility health markers agreed with you at the start of your
          programme, and it is <b>not</b> a promise that you will conceive.
        </p>
      </>
    ),
  },
  {
    id: 'the-start-fee',
    heading: `The ${feeLabel} you pay to start`,
    nav: `The ${feeLabel} start fee`,
    body: (
      <>
        <p>
          The {feeLabel} paid on this website is a one-time booking fee for your
          initial 1:1 consultation. Because this amount secures your
          consultation slot, it is non-refundable.
        </p>
        <p>
          This booking fee is separate from the {PROGRAMME_TITLE}, which you may
          choose to enrol into after your consultation and which carries its own
          Money-Back Guarantee. Paying it does not enrol you in the programme
          and does not oblige you to join.
        </p>
      </>
    ),
  },
  {
    id: 'the-programme',
    heading: `The ${PROGRAMME_TITLE}`,
    nav: 'The programme',
    body: (
      <>
        <p>If you join, you receive the six components described on the landing page:</p>
        <ul>
          {PROGRAMME_COMPONENTS.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p>
          Male fertility guidance and couple-focused support are included only
          where Rupali considers them relevant, and are not a separate
          entitlement. Your place is personal to you: you may not share, resell
          or transfer your plan, your materials or your access to anyone else.
        </p>
        <p>
          The programme is not sold on this website and is not priced here. Its
          fee and payment terms are set out on your consultation, and you decide
          afterwards whether to enrol. The only amount this site charges is the
          booking fee described above.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-ask',
    heading: 'What we ask of you',
    body: (
      <>
        <p>
          The programme works only if it is followed, and our guarantee depends
          on it. We ask that you:
        </p>
        <ul>
          <li>follow your personalised nutrition plan consistently;</li>
          <li>
            complete the required check-ins and share your progress updates on
            time;
          </li>
          <li>
            give us accurate and complete health information, including your
            reports, your medication and any fertility treatment you are
            undergoing;
          </li>
          <li>
            tell us when work, travel, health or life gets in the way, so your
            plan can be adjusted rather than abandoned.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'payment',
    heading: 'Payment',
    body: (
      <p>
        Payments are taken through our payment gateway. Prices are shown in
        Indian Rupees and include any taxes that apply unless stated otherwise
        at checkout. We do not see or store your card details. Refunds and
        cancellations are covered on the Refund page, which forms part of these
        terms.
      </p>
    ),
  },
  {
    id: 'your-content',
    heading: 'Your content and your privacy',
    nav: 'Your content and privacy',
    body: (
      <p>
        You keep ownership of everything you send us, including your reports,
        scans and photographs. We will not publish your reports, photographs,
        results or messages anywhere without asking you first and getting your
        agreement in writing. How we handle your information is set out in full
        in our Privacy Policy.
      </p>
    ),
  },
  {
    id: 'our-materials',
    heading: 'Our materials',
    body: (
      <p>
        The plans, guides and other materials we give you are ours and are
        licensed to you for your personal use during and after your programme.
        Please do not copy, publish or distribute them.
      </p>
    ),
  },
  {
    id: 'liability',
    heading: 'Limitation of liability',
    body: (
      <p>
        We will provide the programme with reasonable care and skill. To the
        extent permitted by law, our total liability to you in connection with
        it is limited to the amount you have paid us. Nothing in these terms
        limits liability that cannot be limited by law, including for death or
        personal injury caused by negligence, or for fraud.
      </p>
    ),
  },
  {
    id: 'ending-the-programme',
    heading: 'Ending the programme',
    body: (
      <p>
        We may end your programme if you are abusive to our team, if you share
        or resell your materials, or if you give us health information that is
        knowingly false in a way that makes it unsafe for us to advise you.
        Where we end a programme for any other reason, we will refund the unused
        portion of your fee.
      </p>
    ),
  },
  {
    id: 'governing-law',
    heading: 'Governing law',
    body: (
      <p>
        These terms are governed by the laws of India. The courts of{' '}
        {business.jurisdictionState} have exclusive jurisdiction over any
        dispute arising from them.
      </p>
    ),
    pending: (
      <>
        The client supplied the state ({business.jurisdictionState}) but not the
        forum. The registered address is in District Durg, so the district court
        at Durg is the likely seat, but a client may prefer a specific forum and
        this is worth confirming rather than inferring.
      </>
    ),
  },
  {
    id: 'contact',
    heading: 'Contact',
    body: (
      <p>
        Questions about these terms go to{' '}
        <a href={`mailto:${emailPrimary}`}>{emailPrimary}</a> or{' '}
        <a href={`tel:${phonePrimaryE164}`}>{phonePrimary}</a>. Our full business
        details are below.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms & Conditions"
      title={
        <>
          The <em>terms</em> we work with you on
        </>
      }
      updated={UPDATED}
      lede={
        <p>
          These terms cover what you pay for, the programme itself, what we ask
          of you while you are on it, and the limits of what a nutrition and
          lifestyle programme can do. The health disclaimer is the most
          important part of this page, so please read that one properly.
        </p>
      }
      clauses={CLAUSES}
      close={{
        heading: (
          <>
            Ask before you <em>pay</em>
          </>
        ),
        body: 'If anything on this page is unclear, or you are not sure whether the programme is safe alongside a treatment you are already on, put the question to us first.',
      }}
    />
  );
}
