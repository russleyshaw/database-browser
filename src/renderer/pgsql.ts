import type { DatabaseConnection } from "@common/database";

export async function executeSql(args: { connection: DatabaseConnection; sql: string; params?: unknown[] }) {
    return window.electronAPI.db.pg.executeSql(args);
}

export async function checkConnection(args: { connection: DatabaseConnection }) {
    const result = await window.electronAPI.db.pg.executeSql({
        connection: { ...args.connection },
        sql: "SELECT 1",
    });

    return "ok";
}

export async function getTables(args: { connection: DatabaseConnection }) {
    const result = await window.electronAPI.db.pg.executeSql({
        connection: args.connection,
        sql: `
            SELECT
                table_schema,
                table_name
            FROM 
                information_schema.tables 
            WHERE 
                table_type = 'BASE TABLE' 
                AND table_schema NOT IN ('pg_catalog', 'information_schema')
        `,
    });

    return result.map((row) => ({
        schema: row.table_schema as string,
        name: row.table_name as string,
    }));
}
export async function getColumns(args: { connection: DatabaseConnection; schema: string; table: string }) {
    const result = await window.electronAPI.db.pg.executeSql({
        connection: args.connection,
        sql: `
            SELECT
                column_name,
                data_type
            FROM
                information_schema.columns
            WHERE
                table_schema = $1
                AND table_name = $2
        `,
        params: [args.schema, args.table],
    });

    return result.map((row) => ({
        name: row.column_name as string,
        type: row.data_type as string,
    }));
}

export async function getForeignKeys(args: { connection: DatabaseConnection; schema: string; table: string }) {
    const result = await window.electronAPI.db.pg.executeSql({
        connection: args.connection,
        sql: `
            SELECT
                column_name,
                referenced_table_schema,
                referenced_table_name,
                referenced_column_name
            FROM
                information_schema.key_column_usage
            WHERE
                table_schema = $1
                AND table_name = $2
        `,
        params: [args.schema, args.table],
    });

    return result.map((row) => ({
        column: row.column_name as string,
        referencedTable: row.referenced_table_name as string,
        referencedColumn: row.referenced_column_name as string,
    }));
}
