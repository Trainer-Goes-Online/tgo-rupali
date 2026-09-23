'use client';

import Script from 'next/script';

/**
 * The GA4 base tag and Microsoft Clarity, from env rather than pasted in.
 *
 * This is part of the build because every GA4 call in lib/ga4.ts checks for
 * window.gtag and returns quietly when it is absent. Without a base tag the
 * whole browser funnel silently does nothing while the webhook keeps reporting
 * purchases through the Measurement Protocol, so GA4 shows revenue with no
 * funnel above it, which is harder to spot than an empty property.
 *
 * Both render nothing when their id is missing. The Clarity script id must
 * stay "ms-clarity": id="clarity" makes window.clarity a script element and
 * the dashboard stays silently empty.
 */
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID ?? '';
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? '';

export default function Analytics() {
  return (
    <>
      {GA4_ID && (
        <>
          <Script
            id="ga4-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
gtag('js', new Date());
gtag('config', '${GA4_ID}');`}
          </Script>
        </>
      )}

      {CLARITY_ID && (
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,'clarity','script','${CLARITY_ID}');`}
        </Script>
      )}
    </>
  );
}
