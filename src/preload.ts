// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import type { DatabaseConnection } from "@common/database";
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    db: {
        pg: {
            executeSql: (args: {
                connection: DatabaseConnection;
                sql: string;
                params?: unknown[];
            }) => ipcRenderer.invoke("db:pg:execute_sql", args),
        },
    },
});

declare global {
    interface Window {
        electronAPI: {
            db: {
                pg: {
                    executeSql: (args: {
                        connection: DatabaseConnection;
                        sql: string;
                        params?: unknown[];
                    }) => Promise<Record<string, unknown>[]>;
                };
            };
        };
    }
}
