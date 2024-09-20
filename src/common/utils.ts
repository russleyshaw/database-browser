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
