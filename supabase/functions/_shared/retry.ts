// Retry helper genérico — PRD §20.1 exige retry 2x em chamadas externas.
// Default: 1 tentativa inicial + 2 retries = 3 chamadas no pior caso.

export interface RetryOptions {
  retries?: number
  baseDelayMs?: number
  onRetry?: (err: unknown, attempt: number) => void
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const retries = opts.retries ?? 2
  const baseDelay = opts.baseDelayMs ?? 500

  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === retries) break
      opts.onRetry?.(err, attempt + 1)
      // backoff exponencial leve: 500ms, 1000ms, 2000ms...
      await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)))
    }
  }
  throw lastError
}
