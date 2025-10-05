declare module 'cockatiel' {
  export function handleAll(error: unknown): boolean;
  export class RetryPolicy {
    constructor(opts: { maxAttempts: number; backoff?: (n: number) => number; handleError?: (e: unknown) => boolean });
    execute<T>(fn: () => Promise<T>): Promise<T>;
  }
  export class ConsecutiveBreaker {
    constructor(failures: number, opts?: { durationOfBreak?: number });
    execute<T>(fn: () => Promise<T>): Promise<T>;
  }
}
