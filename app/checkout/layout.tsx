import type { Metadata } from 'next';

/* Scoped `.rn-pay`, token-only. Loaded from the LAYOUT because the page is a
   client component, which also cannot export `metadata`. noindex is permanent
   here, not a pre-launch setting: a checkout in a search result is a page
   somebody lands on with no idea what they are being asked to pay for. */
import '../checkout.css';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your booking with Dt. Rupali Nayak.',
  robots: { index: false, follow: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
