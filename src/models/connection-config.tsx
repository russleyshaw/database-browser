import { type ConnectionArgs, ConnectionArgsSchema } from "@/lib/database";
import { zodLocalStorageGetItem, zodLocalStorageSetItem } from "@/lib/zod";
import { autorun, makeAutoObservable } from "mobx";
import { z } from "zod";

const ConnectionConfigSchema = z.object({
    id: z.string(),
    name: z.string(),
    connection: ConnectionArgsSchema,
});

export type ConnectionConfig = z.infer<typeof ConnectionConfigSchema>;

export const ConnectionConfigStoreSchema = z.object({
    configs: z.array(ConnectionConfigSchema),
});
export type ConnectionConfigStore = z.infer<typeof ConnectionConfigStoreSchema>;

export class ConnectionConfigModel {
    id: string;
    name: string;
    connection: ConnectionArgs;

    constructor(id: string, name: string, connection: ConnectionArgs) {
        this.id = id;
        this.name = name;
        this.connection = connection;
    }
}

export enum DatabaseConnectionStatus {
    IDLE = "IDLE",
    CONNECTED = "CONNECTED",
    CONNECTING = "CONNECTING",
    FAILED = "FAILED",
}

export class ConnectionConfigModelStore {
    configs: ConnectionConfigModel[] = [];

    constructor() {
        const data = zodLocalStorageGetItem("connection-configs", ConnectionConfigStoreSchema);
        this.configs = data?.configs ?? [
            new ConnectionConfigModel("default", "Default", {
                host: "localhost",
                port: 5432,
                user: "postgres",
                password: "postgres",
                database: "postgres",
            }),
            new ConnectionConfigModel("test", "Test", {
                host: "localhost",
                port: 5432,
                user: "postgres",
                password: "postgres",
                database: "postgres",
            }),
        ];

        makeAutoObservable(this);

        autorun(
            () => {
                zodLocalStorageSetItem("connection-configs", ConnectionConfigStoreSchema, {
                    configs: this.configs,
                });
            },
            {
                delay: 1000,
            },
        );
    }

    add(config: ConnectionConfigModel) {
        this.configs.push(config);
    }

    remove(id: string) {
        this.configs = this.configs.filter((config) => config.id !== id);
    }
}

export const CONNECTION_CONFIG_STORE = new ConnectionConfigModelStore();
