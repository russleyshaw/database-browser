import type { ZodSchema, z } from "zod";
import { maybeJsonStringify, maybeParseJson } from "./utils";

export function zodLocalStorageGetItem<T extends ZodSchema>(key: string, schema: T): z.infer<T> | null {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const json = maybeParseJson(item);
    if (!json) return null;

    const parsed = schema.safeParse(json);
    if (!parsed.success) return null;

    return parsed.data;
}

export function zodLocalStorageSetItem<T extends ZodSchema>(key: string, schema: T, value: unknown) {
    const parsed = schema.safeParse(value);
    if (!parsed.success) return;

    const stringified = maybeJsonStringify(parsed.data);
    if (!stringified) return;

    localStorage.setItem(key, stringified);
}
