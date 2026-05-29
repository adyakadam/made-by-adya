/**
 * Simple in-memory rate limiter.
 * Works per-serverless-instance — good enough to block basic bots and spam.
 * For stricter limits across all instances, use Upstash Redis.
 */

interface Entry { count: number; reset: number }
const store = new Map<string, Entry>()

/**
 * @param key    Unique identifier (e.g. IP address or email)
 * @param limit  Max requests allowed in the window
 * @param windowMs  Window size in milliseconds
 * @returns true if the request is allowed, false if rate limited
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

/** Get client IP from Next.js request headers */
export function getIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}
