// ============================================================
// Wristloom — In-Memory Sliding Window Rate Limiter
// Prevents spam and abuse on public Next.js API endpoints
// ============================================================

interface RateLimitConfig {
  interval: number; // in milliseconds, e.g. 60_000 for 1 minute
  uniqueTokenPerInterval?: number;
}

export function rateLimiter(config: RateLimitConfig) {
  const tokenCache = new Map<string, number[]>();
  const interval = config.interval;
  const maxTokens = config.uniqueTokenPerInterval || 1000;

  return {
    check: async (limit: number, token: string): Promise<{ success: boolean; remaining: number }> => {
      const now = Date.now();
      const windowStart = now - interval;

      const timestamps = (tokenCache.get(token) || []).filter((time) => time > windowStart);

      if (timestamps.length >= limit) {
        return { success: false, remaining: 0 };
      }

      timestamps.push(now);
      tokenCache.set(token, timestamps);

      // Cleanup stale keys
      if (tokenCache.size > maxTokens) {
        for (const [key, times] of tokenCache.entries()) {
          const valid = times.filter((t) => t > windowStart);
          if (valid.length === 0) tokenCache.delete(key);
          else tokenCache.set(key, valid);
        }
      }

      return { success: true, remaining: limit - timestamps.length };
    },
  };
}

// Pre-configured rate limiters
export const registerLimiter = rateLimiter({ interval: 60_000 }); // 5 regs / min
export const bookingLimiter = rateLimiter({ interval: 60_000 });  // 10 bookings / min
