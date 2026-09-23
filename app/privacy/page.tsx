import type { Metadata } from 'next';

import '../legal.css';
import { LegalPage, type Clause } from '@/components/legal/LegalPage';
import { business, emailPrimary } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${business.registeredName} collects, uses and protects your personal and health information.`,
  robots: { index: false, follow: false },
};

const UPDATED = '23 September 2026';

/* Health data is the whole reason this policy is not boilerplate. The
   programme asks for blood reports, fertility markers, scans, menstrual
   history, medication and treatment history, which under India's DPDP Act 2023
   is personal data a reader will reasonably expect to be handled far more
   carefully than a name and an email. Reproductive health is also the category
   a reader is most likely to want kept from her own family, so the
   sensitive-data clause comes early and says so. */
const CLAUSES: Clause[] = [
  {
    id: 'who-we-are',
    heading: 'Who we are',
    body: (
      <p>
        This website is operated by {business.registeredName}, trading as{' '}
        {business.tradingName}, from Bhilai, {business.jurisdictionState}. Where
        this policy says &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;,
        it means that business. Our full contact details are at the foot of this
        page, and you can reach us about anything in this policy at{' '}
        <a href={`mailto:${emailPrimary}`}>{emailPrimary}</a>.
      </p>
    ),
  },
  {
    id: 'what-we-collect',
    heading: 'What we collect',
    body: (
      <>
        <p>We collect only what we need to build and run your plan.</p>
        <ul>
          <li>
            <b>Contact details</b> you give us: your name, email address, phone
            or WhatsApp number, and your city or country.
          </li>
          <li>
            <b>Health information</b> you choose to share: blood reports,
            fertility markers, scans and ultrasounds, your menstrual cycle,
            medical history and diagnoses, fertility treatments already
            attempted, current medication and supplements, eating habits, sleep,
            digestion, activity levels and your current routine.
          </li>
          <li>
            <b>Your partner&rsquo;s information</b>, where male fertility
            guidance is part of your plan and he chooses to share it. The same
            protections in this policy apply to it.
          </li>
          <li>
            <b>Payment information</b> processed by our payment gateway. Card
            and banking details are handled by the gateway and are never stored
            on our servers.
          </li>
          <li>
            <b>Usage information</b> collected automatically when you visit:
            pages viewed, referring source, approximate location from your IP
            address, and device and browser type.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'health-information',
    heading: 'Your health information',
    body: (
      <>
        <p>
          Fertility information is the most sensitive thing you will share with
          us, and we treat it that way. We use it for one purpose: to understand
          your current health picture, build your personalised plan and review
          your progress.
        </p>
        <ul>
          <li>
            It is seen only by Dt. Rupali Nayak and the people working directly
            on your plan.
          </li>
          <li>
            We do not sell it, rent it, or share it with advertisers, and we do
            not use it to target advertising to you.
          </li>
          <li>
            We do not publish your reports, photographs, results or messages
            anywhere, including on this website and on social media, without
            asking you first and getting your agreement in writing.
          </li>
          <li>
            We will not discuss your plan with your family or anybody else
            without your permission.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    heading: 'How we use your information',
    nav: 'How we use it',
    body: (
      <>
        <p>We use what we collect to:</p>
        <ul>
          <li>review your reports and build your personalised plan;</li>
          <li>
            contact you about your plan, your check-ins and your progress
            reviews, including over email, phone and WhatsApp;
          </li>
          <li>take payment and issue receipts;</li>
          <li>
            understand how this website is used, so we can improve it and
            measure which of our advertisements are working;
          </li>
          <li>meet our legal and tax obligations.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    heading: 'Cookies, analytics and advertising',
    nav: 'Cookies and advertising',
    body: (
      <>
        <p>
          This website uses cookies and similar technologies. Some are necessary
          for the site and the checkout to work. Others help us measure traffic
          and advertising performance, and these are the ones that share limited
          information with third parties.
        </p>
        <ul>
          <li>
            <b>Google Analytics</b>, to understand how people find and use the
            site.
          </li>
          <li>
            <b>Meta (Facebook and Instagram)</b>, to measure the results of our
            advertising. This may include a hashed version of your email address
            or phone number so Meta can match a purchase to an advertisement. We
            do not send Meta anything describing your health.
          </li>
          <li>
            <b>Our video host</b>, which serves the video on this page and may
            set its own cookies when the page loads, not only when you press
            play.
          </li>
          <li>
            <b>Our payment gateway</b>, which sets cookies needed to process a
            payment securely.
          </li>
        </ul>
        <p>
          You can block or delete cookies in your browser settings. If you block
          the necessary ones, the checkout may stop working.
        </p>
      </>
    ),
  },
  {
    id: 'who-we-share-with',
    heading: 'Who we share information with',
    nav: 'Who we share with',
    body: (
      <>
        <p>
          We share your information only with the service providers we need to
          run the business, and only with what they need to do their job. These
          are our payment gateway, our email and messaging providers, our
          website and file hosting, and the analytics and advertising platforms
          named above. We may also disclose information where the law requires
          it.
        </p>
        <p>We do not sell your personal information to anyone.</p>
      </>
    ),
  },
  {
    id: 'how-long-we-keep-it',
    heading: 'How long we keep it',
    body: (
      <p>
        We keep your health information for as long as you are a client and for
        a reasonable period afterwards, so that we can answer questions about
        your plan and honour our guarantee. We keep billing records for as long
        as tax law requires. When information is no longer needed for either
        reason, we delete it.
      </p>
    ),
  },
  {
    id: 'your-rights',
    heading: 'Your rights',
    body: (
      <>
        <p>
          You can ask us to show you the personal information we hold about you,
          correct anything that is wrong, or delete it. You can withdraw your
          consent to our using it at any time, and you can ask us to stop
          contacting you about anything other than an active programme.
        </p>
        <p>
          Email <a href={`mailto:${emailPrimary}`}>{emailPrimary}</a> and we will
          respond. Deleting your health information while a programme is running
          will usually mean we can no longer deliver it, and we will tell you if
          that is the case before acting.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    heading: 'Security',
    body: (
      <p>
        We take reasonable steps to protect your information, including
        restricting who can see health records and using reputable providers for
        payment and hosting. No method of transmission or storage is completely
        secure, and we cannot guarantee absolute security.
      </p>
    ),
  },
  {
    id: 'children',
    heading: 'Children',
    body: (
      <p>
        This programme is intended for adults. We do not knowingly collect
        information from anyone under 18. If you believe a child has given us
        information, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: 'changes',
    heading: 'Changes to this policy',
    nav: 'Changes',
    body: (
      <p>
        We may update this policy from time to time. The date at the top of this
        page shows when it was last changed. Continuing to use the website after
        a change means you accept the updated policy.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title={
        <>
          How we handle your <em>information</em>
        </>
      }
      updated={UPDATED}
      lede={
        <p>
          This programme asks you for blood reports, fertility markers, scans,
          your cycle and your medical history. That is sensitive information,
          and this page sets out plainly what we collect, what we do with it,
          who else sees it and how you can get it back or have it deleted.
        </p>
      }
      clauses={CLAUSES}
      close={{
        heading: (
          <>
            Ask us about <em>your information</em>
          </>
        ),
        body: 'You can ask to see what we hold, correct anything that is wrong, or have it deleted. Write to us either way and we will respond.',
      }}
    />
  );
}
