import { BaseDirectory, readFile, writeFile } from "@tauri-apps/plugin-fs";
import { z } from "zod";

const ConnectionIdSchema = z.string();
const TableIdSchema = z.string();
const TagIdSchema = z.string();

export const QueryParamSchema = z.object({
    name: z.string(),
    value: z.string(),
    type: z.string(),
});

export const QuerySchema = z.object({
    id: z.string(),

    name: z.string(),
    description: z.string(),
    order: z.number(),

    tagIds: z
        .array(TagIdSchema)
        .optional()
        .transform((tags) => tags ?? []),

    query: z.string(),
    params: z
        .array(QueryParamSchema)
        .optional()
        .transform((params) => params ?? []),
});

export type Query = z.infer<typeof QuerySchema>;
export type NewQuery = Omit<Query, "id">;

export const ConnectionConfigSchema = z.object({
    host: z.string(),
    port: z.number(),
    user: z.string(),
    password: z.string(),
    database: z.string(),
});

export type ConnectionConfig = z.infer<typeof ConnectionConfigSchema>;

export const TagInfoSchema = z.object({
    id: TagIdSchema,
    name: z.string(),
    description: z.string(),
    order: z.number(),
});

export type TagInfo = z.infer<typeof TagInfoSchema>;

export const ConnectionConfigFileSchema = z.object({
    id: ConnectionIdSchema,
    name: z.string(),
    order: z.number(),

    connection: ConnectionConfigSchema,

    queries: z
        .array(QuerySchema)
        .optional()
        .transform((queries) => queries ?? []),

    tags: z
        .array(TagInfoSchema)
        .optional()
        .transform((tags) => tags ?? []),
});

export type ConnectionConfigFile = z.infer<typeof ConnectionConfigFileSchema>;

export const AppConfigSchema = z.object({
    connections: z.array(ConnectionConfigFileSchema),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

export async function readConfigFile() {
    try {
        const configFileData = await readFile("config.json", {
            baseDir: BaseDirectory.AppConfig,
        });
        const decoder = new TextDecoder();
        const configFile = JSON.parse(decoder.decode(configFileData));
        const config = AppConfigSchema.parse(configFile);
        return config;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function writeConfigFile(config: AppConfig) {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(config, null, 2));
        await writeFile("config.json", data, {
            baseDir: BaseDirectory.AppConfig,
        });
    } catch (error) {
        console.error(error);
    }
}
