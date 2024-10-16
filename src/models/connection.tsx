import { promiseAll } from "@/lib/async";
import type { ConnectionConfigFile, NewQuery, Query } from "@/lib/connection-config-file";
import { makeAutoObservable, runInAction } from "mobx";
import {
    type ColumnInfo,
    type ExecuteQueryResult,
    type ForeignKeyInfo,
    type PrimaryKeyInfo,
    type TableInfo,
    type UniqueKeyInfo,
    checkConnection,
    executeSql,
    getColumns,
    getForeignKeys,
    getPrimaryKeys,
    getTables,
    getUniqueKeys,
} from "../lib/sql/pgsql";

export enum DatabaseConnectionStatus {
    IDLE = "IDLE",
    CONNECTED = "CONNECTED",
    CONNECTING = "CONNECTING",
    FAILED = "FAILED",
}

export interface TableDataColInfo {
    type: string;

    isForeign: boolean;
}

export interface TableData {
    data: Array<Record<string, unknown>>;
    sql: string;
    colInfo: Record<string, TableDataColInfo>;
    query: ExecuteQueryResult;
}

export class ConnectionModel {
    config: ConnectionConfigFile;

    tables: TableInfo[] = [];
    columns: ColumnInfo[] = [];
    foreignKeys: ForeignKeyInfo[] = [];
    primaryKeys: PrimaryKeyInfo[] = [];
    uniqueKeys: UniqueKeyInfo[] = [];

    status = DatabaseConnectionStatus.IDLE;

    constructor(config: ConnectionConfigFile) {
        this.config = config;

        makeAutoObservable(this);
    }

    get id() {
        return this.config.id;
    }

    get name() {
        return this.config.name;
    }

    getTag(id: string) {
        return this.config.tags.find((t) => t.id === id);
    }

    getQuery(id: string) {
        return this.config.queries.find((q) => q.id === id);
    }

    async connect() {
        this.status = DatabaseConnectionStatus.CONNECTING;
        try {
            this.status = DatabaseConnectionStatus.CONNECTED;
            await checkConnection({ connection: this.config.connection });
        } catch (e) {
            console.error(e);
            this.status = DatabaseConnectionStatus.FAILED;
            throw e;
        }
    }

    updateQuery(query: NewQuery | Query) {
        if ("id" in query && query.id != null) {
            // Found existing query, update it.
            this.config.queries = this.config.queries.map((q) => (q.id === query.id ? query : q));
            return query;
        }

        // New query, create it.
        const newQuery: Query = {
            ...query,
            id: crypto.randomUUID(),
        };
        this.config.queries.push(newQuery);

        return newQuery;
    }

    removeQuery(id: string) {
        this.config.queries = this.config.queries.filter((q) => q.id !== id);
    }

    async updateMeta() {
        try {
            const result = await promiseAll({
                tableInfo: getTables({ connection: { ...this.config.connection } }),
                columnInfo: getColumns({ connection: { ...this.config.connection } }),
                foreignKeys: getForeignKeys({ connection: { ...this.config.connection } }),
                primaryKeys: getPrimaryKeys({ connection: { ...this.config.connection } }),
                uniqueKeys: getUniqueKeys({ connection: { ...this.config.connection } }),
            });

            runInAction(() => {
                this.tables = result.tableInfo;
                this.columns = result.columnInfo;
                this.foreignKeys = result.foreignKeys;
                this.primaryKeys = result.primaryKeys;
                this.uniqueKeys = result.uniqueKeys;
            });
        } catch (e) {
            console.error(e);
            throw e;
        }

        return this;
    }

    async executeSql(sql: string, params?: unknown[]) {
        return executeSql({ connection: this.config.connection, sql, params });
    }

    async getTableData(table: string, schema: string, mapFks = true): Promise<TableData> {
        const tableAlias = table;
        // Get data from tables but map FK references to their table if they have a column with "name",

        // get my normal columns
        const columns = this.columns.filter((column) => column.schema === schema && column.table === table);

        const selects: string[] = [];
        const joins: string[] = [];

        const colInfo: Record<string, TableDataColInfo> = {};
        for (const column of columns) {
            let myTableAlias = table;
            let myColumn = column.name;
            let myAlias = column.name;
            let myType = column.type;
            let isForeign = false;

            // if the column is a FK, add the referenced table's columns to the select
            const fkEntry = this.foreignKeys.find(
                (fk) => fk.schema === schema && fk.table === table && fk.column === column.name,
            );

            if (fkEntry && mapFks) {
                // if referenced table has a "name" column, use that instead of the FK column
                const referencedColumns = this.columns.filter(
                    (c) => c.schema === fkEntry.referencedSchema && c.table === fkEntry.referencedTable,
                );
                const nameColumn = referencedColumns.find((c) => {
                    const lower = c.name.toLowerCase().trim();
                    return lower.includes("name") || lower.includes("text") || lower.includes("type");
                });
                if (nameColumn) {
                    const refTableAlias = `${fkEntry.referencedTable}_${table}`;
                    const nameColumnAlias = `${column.name}_${refTableAlias}_name`;

                    joins.push(
                        `LEFT JOIN "${fkEntry.referencedSchema}"."${fkEntry.referencedTable}" "${refTableAlias}" ON "${tableAlias}"."${column.name}" = "${refTableAlias}"."${fkEntry.referencedColumn}"`,
                    );

                    myTableAlias = refTableAlias;
                    myColumn = nameColumn.name;
                    myAlias = nameColumnAlias;
                    myType = nameColumn.type;
                    isForeign = true;
                }
            }

            selects.push(`"${myTableAlias}"."${myColumn}" AS "${myAlias}"`);

            colInfo[column.name] = {
                type: myType,
                isForeign,
            };
        }

        if (selects.length === 0) {
            selects.push("*");
        }
        const sql = `
            SELECT ${selects.join(", ")}
            FROM "${table}"
            ${joins.join("\n")}
            LIMIT 100
        `;
        console.log("sql", sql);

        const data = await executeSql({ connection: { ...this.config.connection }, sql });

        return { data: data.rows, sql, colInfo, query: data };
    }
}
