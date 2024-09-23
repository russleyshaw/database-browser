import { invoke } from "@tauri-apps/api/tauri";

import type { ConnectionArgs } from "@/lib/database";
import { z } from "zod";
import { UnknownError } from "./error";
import { toMap } from "./utils";

const PgTimestampSchema = z.object({
    nanos_since_epoch: z.number(),
    secs_since_epoch: z.number(),
});

interface InvokeExecuteQueryResult {
    columns: Array<{
        name: string;
        col_type: string;
        order_idx: number;
    }>;
    rows: Array<Record<string, unknown>>;
}

export interface ExecuteQueryResult extends InvokeExecuteQueryResult {
    sql: string;
    values: unknown[];
}

export async function executeSql(args: {
    connection: ConnectionArgs;
    sql: string;
    params?: unknown[];
}): Promise<ExecuteQueryResult> {
    const result = (await invoke("pg_execute_query", {
        host: args.connection.host,
        port: args.connection.port,
        username: args.connection.user,
        password: args.connection.password,
        database: args.connection.database,
        query: args.sql,
        params: args.params ?? [],
    }).catch((err) => {
        console.error("Execute SQL error", err);
        if (err instanceof Error) throw err;
        throw new UnknownError("Unknown error", err);
    })) as ExecuteQueryResult;
    console.log("Execute SQL result", args.sql, result);

    const colMap = toMap(
        result.columns,
        (col) => col.name,
        (col) => col,
    );

    for (const row of result.rows) {
        for (const colKey of Object.keys(row)) {
            const colInfo = colMap.get(colKey);
            const colValue = row[colKey];
            if (colValue == null) continue;

            const parsedCol = PgTimestampSchema.safeParse(colValue);
            if (parsedCol.success) {
                row[colKey] = new Date(parsedCol.data.secs_since_epoch * 1000);
                continue;
            }

            if (colInfo?.col_type === "timestamp" || colInfo?.col_type === "timestamptz") {
                row[colKey] = new Date(colValue as string);
                continue;
            }
        }
    }

    return {
        ...result,
        sql: args.sql,
        values: args.params ?? [],
    };
}

export async function checkConnection(args: { connection: ConnectionArgs }) {
    const result = await executeSql({
        connection: { ...args.connection },
        sql: "SELECT 1 AS sanity",
    });

    return result.rows.length > 0;
}

export interface TableInfo {
    schema: string;
    name: string;
}

export async function getTables(args: { connection: ConnectionArgs }): Promise<TableInfo[]> {
    const result = await executeSql({
        connection: args.connection,
        sql: `
            SELECT
                t.table_schema,
                t.table_name
            FROM 
                information_schema.tables t
            WHERE 
                t.table_type = 'BASE TABLE' 
                AND t.table_schema NOT IN ('pg_catalog', 'information_schema')
        `,
    });

    return result.rows.map((row) => ({
        schema: row.table_schema as string,
        name: row.table_name as string,
    }));
}

export interface ColumnInfo {
    schema: string;
    table: string;
    name: string;
    type: string;
    nullable: boolean;
}

export interface PrimaryKeyInfo {
    schema: string;
    table: string;
    name: string;
    column: string;
    type: string;
}

export async function getPrimaryKeys(args: { connection: ConnectionArgs }): Promise<PrimaryKeyInfo[]> {
    const result = await executeSql({
        connection: args.connection,
        sql: `
            SELECT
                tc.table_schema, tc.table_name, c.column_name, c.data_type, tc.constraint_name

            FROM
                information_schema.table_constraints tc

            JOIN
                information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
            JOIN
                information_schema.columns AS c ON c.table_schema = tc.constraint_schema
                    AND tc.table_name = c.table_name
                    AND ccu.column_name = c.column_name

            WHERE constraint_type = 'PRIMARY KEY'
                AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
        `,
    });

    return result.rows.map((row) => ({
        schema: row.table_schema as string,
        table: row.table_name as string,
        name: row.constraint_name as string,
        column: row.column_name as string,
        type: row.data_type as string,
    }));
}

export interface UniqueKeyInfo {
    schema: string;
    table: string;
    name: string;
    columns: string[];
}

export async function getUniqueKeys(args: { connection: ConnectionArgs }): Promise<UniqueKeyInfo[]> {
    const result = await executeSql({
        connection: args.connection,
        sql: `
            SELECT
                tc.table_schema, tc.table_name, c.column_name, c.data_type, tc.constraint_name

            FROM
                information_schema.table_constraints tc

            JOIN
                information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name) 
            JOIN
                information_schema.columns AS c ON c.table_schema = tc.constraint_schema
                    AND tc.table_name = c.table_name
                    AND ccu.column_name = c.column_name

            WHERE constraint_type = 'UNIQUE'
                AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
        `,
    });

    const results: UniqueKeyInfo[] = [];

    for (const row of result.rows) {
        const existing = results.find(
            (r) => r.schema === row.table_schema && r.table === row.table_name && r.name === row.constraint_name,
        );

        if (existing) {
            existing.columns.push(row.column_name as string);
        } else {
            results.push({
                schema: row.table_schema as string,
                table: row.table_name as string,
                name: row.constraint_name as string,
                columns: [row.column_name as string],
            });
        }
    }

    return results;
}

export async function getColumns(args: { connection: ConnectionArgs }): Promise<ColumnInfo[]> {
    const result = await executeSql({
        connection: args.connection,
        sql: `
            SELECT
                c.table_schema,
                c.table_name,
                c.column_name,
                c.data_type,
                c.is_nullable
            FROM
                information_schema.columns c
            WHERE
                table_schema NOT IN ('pg_catalog', 'information_schema')
        `,
    });

    return result.rows.map((row) => ({
        schema: row.table_schema as string,
        table: row.table_name as string,
        name: row.column_name as string,
        type: row.data_type as string,
        nullable: row.is_nullable === "YES",
    }));
}

export interface ForeignKeyInfo {
    name: string;
    schema: string;
    table: string;
    column: string;
    referencedSchema: string;
    referencedTable: string;
    referencedColumn: string;
}

export async function getForeignKeys(args: { connection: ConnectionArgs }): Promise<ForeignKeyInfo[]> {
    const result = await executeSql({
        connection: args.connection,
        sql: `
            SELECT
                tc.table_schema, 
                tc.constraint_name, 
                tc.table_name, 
                kcu.column_name, 
                ccu.table_schema AS foreign_table_schema,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name 
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'  
            AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
        `,
    });

    return result.rows.map((row) => ({
        name: row.constraint_name as string,

        schema: row.table_schema as string,
        table: row.table_name as string,
        column: row.column_name as string,

        referencedSchema: row.foreign_table_schema as string,
        referencedTable: row.foreign_table_name as string,
        referencedColumn: row.foreign_column_name as string,
    }));
}
