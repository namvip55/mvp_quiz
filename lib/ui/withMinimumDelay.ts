export async function withMinimumDelay<T>(task: Promise<T>, minimumMs = 1500): Promise<T> {
  const startedAt = Date.now();

  try {
    return await task;
  } finally {
    const elapsed = Date.now() - startedAt;
    const remaining = minimumMs - elapsed;
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
  }
}
