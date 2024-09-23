import { assertExists } from "@/lib/utils";
import type { ConnectionModel } from "@/models/connection";
import { Button, Callout, Card, H3, HTMLTable, Icon, Tooltip } from "@blueprintjs/core";
import { Editor } from "@monaco-editor/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useState } from "react";
import { SidebarLayout } from "../components/SidebarLayout";
import { SqlRowTable } from "../components/SqlRowTable";
import TrButton from "../components/TrButton";

interface ConnectionBrowserProps {
    connection: ConnectionModel;
}

export const ConnectionBrowser = observer(({ connection }: ConnectionBrowserProps) => {
    const [selectedTable, setSelectedTable] = useState<{ schema: string; table: string } | null>(null);
    const tablesQuery = useQuery({
        queryKey: ["updateMeta", connection.id],
        queryFn: async () => {
            return connection.updateMeta();
        },
    });

    return (
        <SidebarLayout
            sidebar={
                <HTMLTable compact interactive striped>
                    <thead>
                        <tr>
                            <th>Schema</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tablesQuery.data?.tables?.map((table) => (
                            <TrButton
                                key={table.name}
                                onClick={() => setSelectedTable({ schema: table.schema, table: table.name })}
                            >
                                <td>{table.schema}</td>
                                <td>{table.name}</td>
                            </TrButton>
                        ))}
                    </tbody>
                </HTMLTable>
            }
        >
            {selectedTable && (
                <TableBrowser
                    key={`${selectedTable.schema}.${selectedTable.table}`}
                    connection={connection}
                    schema={selectedTable.schema}
                    table={selectedTable.table}
                />
            )}
        </SidebarLayout>
    );
});

interface TableBrowserProps {
    connection: ConnectionModel;
    schema: string;
    table: string;
}

const TableBrowser = observer(({ connection, table, schema }: TableBrowserProps) => {
    const [useFks, setUseFks] = useState(true);
    const dataQuery = useQuery({
        queryKey: ["data", connection.id, table, connection.tables, useFks],
        queryFn: async () => {
            assertExists(connection.tables);
            return connection.getTableData(table, schema, useFks);
        },
    });

    const [sql, setSql] = useState("");

    const executeSqlMutation = useMutation({
        mutationFn: async () => {
            const data = await connection.executeSql(sql);
            return { data, sql };
        },
    });

    const columns = connection.columns.filter((c) => c.table === table && c.schema === schema);

    return (
        <>
            <Card elevation={1}>
                <H3>Columns</H3>
                <HTMLTable interactive compact striped>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Nullable</th>
                            <th>Foreign Key</th>
                        </tr>
                    </thead>
                    <tbody>
                        {columns.map((column) => {
                            const foreignKey = connection.foreignKeys.find((fk) => fk.column === column.name);
                            const referencedTable = connection.tables.find(
                                (t) =>
                                    t.name === foreignKey?.referencedTable && t.schema === foreignKey?.referencedSchema,
                            );

                            return (
                                <TrButton key={column.name}>
                                    <td>{column.name}</td>
                                    <td>{column.type}</td>
                                    <td>{column.nullable && <Icon icon="tick" />}</td>
                                    <td>
                                        {foreignKey && referencedTable && (
                                            <Tooltip
                                                content={`${foreignKey.referencedSchema}.${foreignKey.referencedTable}.${foreignKey.referencedColumn}`}
                                            >
                                                <Icon icon="tick" />
                                            </Tooltip>
                                        )}
                                    </td>
                                </TrButton>
                            );
                        })}
                    </tbody>
                </HTMLTable>
            </Card>

            <H3>SQL</H3>
            <SqlRowTable title={`${schema}.${table}`} loading={dataQuery.isLoading} tableData={dataQuery.data}>
                <Button icon="refresh" onClick={() => setUseFks(!useFks)}>
                    {useFks ? "Hide FKs" : "Show FKs"}
                </Button>
            </SqlRowTable>

            {executeSqlMutation.error && <Callout intent="danger">{executeSqlMutation.error.message}</Callout>}
            <Card elevation={1}>
                <Editor height="40vh" defaultLanguage="sql" value={sql} onChange={(value) => setSql(value ?? "")} />
                <Button icon="play" onClick={() => executeSqlMutation.mutate()} />
                <Button icon="cross" onClick={() => setSql("")} />
            </Card>
        </>
    );
});
