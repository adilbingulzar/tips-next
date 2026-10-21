/**
 * The visitor's IP address, as passed on by the web server in front of
 * Next.js (nginx on Forge appends the address it saw to X-Forwarded-For).
 *
 * Only the last entry can be trusted: everything before it is whatever the
 * visitor sent, so taking the first one would let anyone choose their own IP
 * and get around the API's rate limits. Separate module so proxy.ts can use it.
 */
export function visitorIpFrom(requestHeaders: Pick<Headers, "get">): string | undefined {
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",").map((part) => part.trim()).filter(Boolean).at(-1);
  return forwarded || requestHeaders.get("x-real-ip")?.trim() || undefined;
}
