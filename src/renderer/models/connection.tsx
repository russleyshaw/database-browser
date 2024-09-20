import type { DatabaseConnection } from "@common/database";
import { trimIdSuffix } from "@common/utils";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { makeAutoObservable, runInAction, toJS } from "mobx";
import { checkConnection, executeSql, getColumns, getForeignKeys, getTables } from "../pgsql";

export interface DatabaseConnectionConfig {
    id: string;
    name: string;
    connection: DatabaseConnection;
}

export interface DatabaseTableInfo {
    schema: string;
    name: string;
    columns: DatabaseColumnInfo[];

    foreignKeys: DatabaseForeignKeyInfo[];
}

export interface DatabaseForeignKeyInfo {
    column: string;
    referencedTable: string;
    referencedColumn: string;
}

export interface DatabaseColumnInfo {
    name: string;
    type: string;
}

export enum DatabaseConnectionStatus {
    Connected = "Connected",
    Disconnected = "Disconnected",
    Connecting = "Connecting",
    Disconnecting = "Disconnecting",
}

export class DatabaseConnectionModel {
    id: string;
    name: string;

    tables: DatabaseTableInfo[] = [];

    connection: DatabaseConnection;

    status: DatabaseConnectionStatus = DatabaseConnectionStatus.Disconnected;

    constructor(config: DatabaseConnectionConfig) {
        this.id = config.id;
        this.name = config.name;
        this.connection = config.connection;
        makeAutoObservable(this);
    }

    async connect() {
        this.status = DatabaseConnectionStatus.Connecting;
        await checkConnection({ connection: toJS(this.connection) });
        this.status = DatabaseConnectionStatus.Connected;
    }

    async updateMeta() {
        // get tables
        const tables: DatabaseTableInfo[] = await getTables({ connection: { ...this.connection } }).then((t) =>
            t.map((t) => ({ schema: t.schema, name: t.name, columns: [], foreignKeys: [] })),
        );

        // get columns
        for (const table of tables) {
            const columns = await getColumns({
                connection: { ...this.connection },
                schema: table.schema,
                table: table.name,
            });
            table.columns = columns.map((c) => ({ name: c.name, type: c.type }));
        }

        // get foreign keys
        for (const table of tables) {
            const foreignKeys = await getForeignKeys({
                connection: this.connection,
                schema: table.schema,
                table: table.name,
            });
            table.foreignKeys = foreignKeys.map((f) => ({
                column: f.column,
                referencedTable: f.referencedTable,
                referencedColumn: f.referencedColumn,
            }));
        }

        runInAction(() => {
            this.tables = tables;
        });

        return this.tables;
    }

    async executeSql(sql: string, params?: unknown[]) {
        return executeSql({ connection: this.connection, sql, params });
    }

    async getTableData(table: string, schema: string) {
        // Get data from tables but map FK references to their table if they have a column with "name",

        const sql = `
            SELECT * FROM ${schema}.${table}
        `;

        const data = await executeSql({ connection: this.connection, sql });
        return data;
    }
}

export class DatabaseConnectionModelStore {
    connections: DatabaseConnectionModel[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    removeConnection(id: string) {
        this.connections = this.connections.filter((connection) => connection.id !== id);
    }
}

export const databaseConnectionModelStore = new DatabaseConnectionModelStore();

databaseConnectionModelStore.connections.push(
    new DatabaseConnectionModel({
        id: "1",
        name: "Local",
        connection: {
            host: "localhost",
            port: 5432,
            database: "postgres",
            user: "postgres",
            password: "postgres",
        },
    }),
);
