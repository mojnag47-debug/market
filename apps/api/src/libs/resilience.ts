import { RetryPolicy, ConsecutiveBreaker, handleAll } from 'cockatiel';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

// Exponential backoff retry policy
export const retryPolicy = new RetryPolicy({
  maxAttempts: 5,
  backoff: (attempt: number) => 100 * 2 ** attempt,
  handleError: handleAll,
});

// Simple circuit breaker for external services
export const circuitBreaker = new ConsecutiveBreaker(5, { // open after 5 consecutive failures
  durationOfBreak: 30_000, // 30s
});

export async function executeWithPolicies<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await circuitBreaker.execute(() => retryPolicy.execute(fn));
  } catch (err: unknown) {
    logger.error({ err }, 'resilience:operation_failed');
    throw err;
  }
}

export * from '@nextgen-marketplace/shared-utils';
