import { type DependencyList, useState } from "react";
import { useDebounce } from "react-use";

export function useDebouncedValue<T>(value: T, ms: number) {
    const [debouncedValue, setDebouncedValue] = useState<T | undefined>(undefined);

    useDebounce(() => setDebouncedValue(value), ms, [value]);

    return debouncedValue;
}
