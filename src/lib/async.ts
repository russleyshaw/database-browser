export async function promiseAll<T extends Record<string, Promise<unknown>>>(
    promises: T,
): Promise<{ [K in keyof T]: Awaited<T[K]> }> {
    const entries = Object.entries(promises);
    const results = await Promise.all(entries.map(([key, promise]) => promise.then((value) => [key, value])));
    return Object.fromEntries(results) as { [K in keyof T]: Awaited<T[K]> };
}
