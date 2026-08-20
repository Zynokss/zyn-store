// Simple in-memory fixed-window rate limiter. Good enough for a single-instance
// deployment; if this app ever runs multiple replicas, swap for a shared store
// (e.g. Redis) since counts here are per-process.
const attempts = new Map<string, { count: number; resetAt: number }>();

function prune(now: number) {
  if (attempts.size < 5000) return;
  for (const [key, entry] of attempts) {
    if (now > entry.resetAt) attempts.delete(key);
  }
}

export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);

  const entry = attempts.get(key);
  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count += 1;
  return true;
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
