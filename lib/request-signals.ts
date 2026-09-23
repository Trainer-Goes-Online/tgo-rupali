/**
 * The two signals only the SERVER can read honestly: the caller's IP and user
 * agent. Meta counts both as match keys.
 *
 * WHERE THEY ARE READ IS THE WHOLE TRICK. The Razorpay webhook is a request
 * from Razorpay, so its headers carry Razorpay's IP and agent, and a
 * confidently wrong value is worse than a missing one. They are captured at
 * create-order, the last request the buyer's own browser makes.
 */

const IP_HEADERS = [
  'cf-connecting-ip',
  'x-vercel-forwarded-for',
  'x-real-ip',
] as const;

/** IPv4 dotted quad, or an IPv6 form (possibly with a zone or brackets). */
function looksLikeIp(v: string): boolean {
  if (!v) return false;
  const s = v.replace(/^\[|\]$/g, '');
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s) || /^[0-9a-f:]+$/i.test(s);
}

export function readClientIp(req: Request): string {
  for (const h of IP_HEADERS) {
    const v = (req.headers.get(h) ?? '').trim();
    if (looksLikeIp(v)) return v;
  }
  /* First entry, not last: x-forwarded-for reads client, then proxy, then
     proxy, so the last entry is the CDN's own address. */
  const first = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim();
  return looksLikeIp(first ?? '') ? (first as string) : '';
}

export function readClientUserAgent(req: Request): string {
  return (req.headers.get('user-agent') ?? '').trim();
}

/**
 * create-order is SAME-ORIGIN, so `_fbc`, `_fbp` and the edge attribution
 * cookie are already on the request. Trusting only the JSON body throws away
 * the copy that survives when the pixel is blocked or still loading.
 *
 * Deliberately tolerant: a malformed escape must yield the raw value rather
 * than throw inside a payment route.
 */
export function readRequestCookie(req: Request, name: string): string {
  const header = req.headers.get('cookie') ?? '';
  if (!header) return '';
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() !== name) continue;
    const raw = part.slice(eq + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return '';
}
