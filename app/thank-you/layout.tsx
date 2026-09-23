import type { Metadata } from 'next';

/* Scoped `.rn-ty`, token-only. Never indexed: a crawler that finds this
   indexes a page telling strangers their booking is confirmed. */
import '../thankyou.css';

export const metadata: Metadata = {
  title: 'Your booking is confirmed',
  description: 'Payment received and your slot is booked.',
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
