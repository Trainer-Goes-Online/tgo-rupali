import type { Metadata } from 'next';

/* Scoped `.rn-book`, token-only apart from the documented WhatsApp green.
   Never indexed: a crawler that finds this indexes a page telling strangers
   their payment went through. */
import '../bookacall.css';

export const metadata: Metadata = {
  title: 'Pick your time',
  description: 'Payment received. One step left.',
  robots: { index: false, follow: false },
};

export default function BookACallLayout({ children }: { children: React.ReactNode }) {
  return children;
}
