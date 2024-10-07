import { type AppConfig, AppConfigSchema, readConfigFile, writeConfigFile } from "@/lib/connection-config-file";
import { autorun, makeAutoObservable } from "mobx";
import { ConnectionModel } from "./connection";

export class AppModel {
    connections: ConnectionModel[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    async readConfig() {
        const config = await readConfigFile();
        if (!config) return null;
        const result = AppConfigSchema.safeParse(config);
        if (!result.success) return null;
        return result.data;
    }

    async loadConfig() {
        console.log("Loading config");
        const config = await this.readConfig();
        if (!config) return;
        this.connections = config.connections.map((c) => new ConnectionModel(c));
    }

    listenAndSave() {
        autorun(
            () => {
                console.log("saving config");
                this.saveConfig();
            },
            {
                delay: 1000,
            },
        );
    }

    async saveConfig() {
        console.log("saving config");
        const config: AppConfig = {
            connections: this.connections.map((c) => c.config),
        };
        await writeConfigFile(config);
    }

    getConnection(id: string) {
        return this.connections.find((c) => c.id === id);
    }

    async addConnection(connection: ConnectionModel) {
        this.connections.push(connection);
    }

    async removeConnection(id: string) {
        this.connections = this.connections.filter((c) => c.id !== id);
    }
}

export const APP_MODEL = new AppModel();
await APP_MODEL.loadConfig().catch(console.error);
APP_MODEL.listenAndSave();
