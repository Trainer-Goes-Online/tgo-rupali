import type { Metadata } from 'next';

/* Scoped `.rn-ty`, token-only. Never indexed: a crawler that finds this
   indexes a page addressed to people who have just booked. */
import '../thankyou.css';

/* Not "confirmed": the call is confirmed only after the WhatsApp step the
   hero asks for, and the tab title must not say otherwise. */
export const metadata: Metadata = {
  title: 'One more step to confirm your call',
  description: 'Your slot is booked. Connect on WhatsApp to confirm your strategy call.',
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
