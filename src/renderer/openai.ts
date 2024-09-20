import OpenAI from "openai";
import { useMemo } from "react";

export function useOpenAI(key: string) {
    const client = useMemo(() => {
        if (!key) {
            return null;
        }

        return new OpenAI({
            apiKey: key,
            dangerouslyAllowBrowser: true,
        });
    }, [key]);

    return client;
}
