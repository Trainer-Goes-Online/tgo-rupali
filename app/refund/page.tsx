import type { Metadata } from 'next';

import '../legal.css';
import { LegalPage, type Clause } from '@/components/legal/LegalPage';
import { business, emailSecondary } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: `Refunds and the money-back guarantee for ${business.registeredName}.`,
  robots: { index: false, follow: false },
};

const UPDATED = '13 September 2026';

/* Client-supplied 23 Sep 2026, reproduced verbatim. Do not re-voice, reorder
   or summarise: this is the document a payment gateway and a card network read
   in a dispute. */
const SUPPORT_EMAIL = emailSecondary;

const CLAUSES: Clause[] = [
  {
    id: 'booking-fee',
    heading: 'The ₹97 Booking Fee',
    nav: 'The ₹97 booking fee',
    body: (
      <>
        <p>
          The ₹97 paid on this website is a one-time booking fee for your
          initial 1:1 consultation.
        </p>
        <p>
          Because this amount secures your consultation slot, it is
          non-refundable.
        </p>
        <p>
          This booking fee is separate from the 90-day programme, which you may
          choose to enrol into after your consultation and which carries its own
          Money-Back Guarantee as explained below.
        </p>
      </>
    ),
  },
  {
    id: 'money-back-guarantee',
    heading: '90-Day Money-Back Guarantee',
    nav: '90-day guarantee',
    body: (
      <>
        <p>
          At the beginning of your programme, your starting point is assessed
          across areas such as your:
        </p>
        <ul>
          <li>Fertility history</li>
          <li>Blood reports</li>
          <li>Hormones</li>
          <li>Menstrual cycle</li>
          <li>Current health concerns</li>
          <li>Lifestyle</li>
          <li>Other relevant fertility health markers</li>
        </ul>
        <p>
          Based on this assessment, the specific fertility health markers we
          will work towards improving during your 90-day programme will be
          agreed upon with you.
        </p>
        <p>If you:</p>
        <ul>
          <li>Complete the full 90-day programme,</li>
          <li>Follow your personalised nutrition and lifestyle plan,</li>
          <li>Complete the required check-ins,</li>
          <li>Submit the requested progress updates and information,</li>
          <li>Follow the recommendations provided throughout the programme,</li>
        </ul>
        <p>
          and do not achieve the agreed improvement in your fertility health
          markers, you may qualify for a 100% refund of your programme
          investment.
        </p>
        <p>
          <b>
            This guarantee applies to the agreed fertility health markers, not
            to pregnancy or conception within 90 days.
          </b>
        </p>
      </>
    ),
  },
  {
    id: 'eligibility',
    heading: 'Eligibility Requirements',
    nav: 'Eligibility',
    body: (
      <>
        <p>To qualify for the Money-Back Guarantee, you must:</p>
        <ul>
          <li>
            Follow your personalised nutrition and lifestyle plan consistently.
          </li>
          <li>Attend all scheduled check-ins.</li>
          <li>
            Submit meal pictures, progress updates and requested information on
            time.
          </li>
          <li>
            Provide requested reports, measurements or progress photographs
            where applicable.
          </li>
          <li>
            Follow the recommendations provided by Rupali throughout the
            programme.
          </li>
          <li>
            Complete the full 90-day programme from your official start date.
          </li>
          <li>Remain actively engaged throughout the entire programme.</li>
        </ul>
        <p>
          The guarantee is available only when the agreed programme has been
          followed consistently.
        </p>
      </>
    ),
  },
  {
    id: 'agreed-markers',
    heading: 'Your Agreed Fertility Health Markers',
    nav: 'Your agreed markers',
    body: (
      <>
        <p>
          The same fertility markers are not relevant or appropriate for every
          woman.
        </p>
        <p>
          For one client, the focus may include thyroid markers or
          menstrual-cycle regularity. For another, it may include AMH,
          prolactin, hormonal markers or other fertility-related health
          indicators identified from her reports and starting point.
        </p>
        <p>
          Your relevant markers and realistic improvement criteria will
          therefore be established based on your individual baseline at the
          beginning of the programme.
        </p>
        <p>
          These agreed fertility health markers will form the basis of your
          Money-Back Guarantee.
        </p>
      </>
    ),
  },
  {
    id: 'refund-request-process',
    heading: 'Refund Request Process',
    nav: 'How to request',
    body: (
      <>
        <p>
          If you believe you qualify for a refund, you must contact us within 3
          days of completing your 90-day programme at:
        </p>
        <p>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
        <p>Your programme records will be reviewed to confirm that:</p>
        <ul>
          <li>The full 90-day programme was completed.</li>
          <li>All participation requirements were met.</li>
          <li>The agreed plan was followed consistently.</li>
          <li>
            The agreed improvement in your fertility health markers was not
            achieved.
          </li>
        </ul>
        <p>
          Once approved, refunds will be processed within 7 to 14 business days
          using the original payment method wherever possible.
        </p>
      </>
    ),
  },
  {
    id: 'guarantee-exclusions',
    heading: 'Situations Where the Guarantee Does Not Apply',
    nav: 'When it does not apply',
    body: (
      <>
        <p>The Money-Back Guarantee does not apply if:</p>
        <ul>
          <li>Scheduled check-ins were missed.</li>
          <li>
            Meal pictures, progress updates, reports or requested photographs
            were not submitted consistently.
          </li>
          <li>The personalised plan was not followed.</li>
          <li>
            Recommendations provided during the programme were repeatedly not
            implemented.
          </li>
          <li>The programme was discontinued before completion.</li>
          <li>
            Required information needed to assess your progress was not
            provided.
          </li>
          <li>
            The refund request is submitted outside the 3-day refund request
            window.
          </li>
          <li>
            You voluntarily pause, suspend or interrupt the programme for any
            reason, including travel, holidays, work commitments or personal
            circumstances.
          </li>
        </ul>
        <p>
          Any voluntary pause or interruption makes the Money-Back Guarantee
          void because the agreed 90-day process has not been followed
          continuously.
        </p>
      </>
    ),
  },
  {
    id: 'fertility-outcomes',
    heading: 'Fertility Outcomes & Medical Care',
    nav: 'Outcomes and medical care',
    body: (
      <>
        <p>
          The programme is designed to support the fertility health markers and
          underlying health factors identified as relevant to your individual
          case.
        </p>
        <p>
          It is not a replacement for medical diagnosis, prescribed medication
          or treatment from your gynaecologist or other qualified healthcare
          professional.
        </p>
        <p>
          Because fertility depends on multiple factors, pregnancy or conception
          within a specific timeline cannot be guaranteed.
        </p>
        <p>
          The Money-Back Guarantee applies only to the agreed fertility health
          markers established at the beginning of your programme.
        </p>
      </>
    ),
  },
  {
    id: 'our-commitment',
    heading: 'Our Commitment',
    nav: 'Our commitment',
    body: (
      <>
        <p>
          We believe the guarantee should reflect commitment from both sides.
        </p>
        <p>
          From our side, we commit to providing a personalised 90-day plan,
          regular reviews, ongoing guidance and adjustments based on your
          progress.
        </p>
        <p>
          From your side, we ask that you follow the agreed programme
          consistently and complete all required participation steps.
        </p>
        <p>
          If you do that and the agreed fertility health markers do not improve,
          the programme is backed by our 100% Money-Back Guarantee.
        </p>
      </>
    ),
  },
];

export default function RefundPage() {
  return (
    <LegalPage
      eyebrow="Refund Policy"
      title={
        <>
          Refunds and the <em>guarantee</em>
        </>
      }
      updated={UPDATED}
      lede={
        <>
          <p>
            Our goal is to help you improve the fertility health markers
            identified as relevant to your individual starting point through a
            personalised 90-day nutrition and lifestyle programme.
          </p>
          <p>
            Because every woman begins from a different fertility and health
            baseline, we do not promise the same outcome to every client.
          </p>
          <p>
            Instead, your starting point is assessed, the relevant fertility
            health markers are identified, and your 90-day programme is built
            around improving those agreed markers.
          </p>
          <p>
            That is why we back the programme with a 100% Money-Back Guarantee
            when the complete process is followed consistently.
          </p>
        </>
      }
      clauses={CLAUSES}
      close={{
        heading: (
          <>
            Asking for a <em>refund</em>
          </>
        ),
        body: `Write to ${SUPPORT_EMAIL} within 3 days of completing your 90-day programme. Tell us your name and the date you started, and your programme records will be reviewed against the agreed markers.`,
      }}
    />
  );
}
