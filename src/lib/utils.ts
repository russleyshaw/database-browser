export function assertKeyOfObject<T extends Record<string, unknown>, K extends keyof T>(
    obj: T,
    key: PropertyKey,
): asserts key is K {
    if (!(key in obj)) {
        throw new Error(`Key ${String(key)} not found in object`);
    }
}

export function maybeGet<T extends object, K extends PropertyKey>(
    obj: T,
    key: K,
): K extends keyof T ? T[K] : T[keyof T] | undefined {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    return key in obj ? (obj as any)[key] : undefined;
}

export async function delayMs(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function assertExists<T>(value: T): asserts value is NonNullable<T> {
    if (value == null) {
        throw new Error("Value does not exist");
    }
}

export function uniq<T>(arr: T[]) {
    return Array.from(new Set(arr));
}

export function trimIdSuffix(key: string) {
    return key.replace(/_?id$/i, "");
}

export function maybeParseJson<T = unknown>(value: string): T | null {
    try {
        return JSON.parse(value);
    } catch (e) {
        console.warn("Failed to parse JSON", e);
        return null;
    }
}
export function maybeJsonStringify<T = unknown>(value: T): string | null {
    try {
        return JSON.stringify(value);
    } catch (e) {
        console.warn("Failed to stringify JSON", e);
        return null;
    }
}

export function toMap<K, V, T>(
    items: T[],
    keyFn: (item: T, itemIdx: number) => K,
    valueFn: (item: T, itemIdx: number) => V,
) {
    const map = new Map<K, V>();
    for (const [itemIdx, item] of items.entries()) {
        map.set(keyFn(item, itemIdx), valueFn(item, itemIdx));
    }
    return map;
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export interface BaseDiscUnion {
    type: string;
}

export function matchUnions<
    T extends BaseDiscUnion,
    U extends { [K in T["type"]]: (value: Extract<T, { type: K }>) => unknown },
>(value: T, cases: U): ReturnType<T["type"] extends keyof U ? U[T["type"]] : never> {
    assertKeyOfObject(cases, value.type);
    return cases[value.type as keyof U](value as any);
}
