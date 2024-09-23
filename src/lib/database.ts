import { z } from "zod";

export const ConnectionArgsSchema = z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
});

export type ConnectionArgs = z.infer<typeof ConnectionArgsSchema>;
