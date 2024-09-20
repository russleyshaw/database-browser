import { Button, Callout, Card, H3, HTMLTable, Spinner } from "@blueprintjs/core";
import { assertExists } from "@common/utils";
import { Editor } from "@monaco-editor/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { useState } from "react";
import ManageConnectionsDialog from "../components/ManageConnectionsDialog";
import { SettingsDialog } from "../components/SettingsDialog";
import { SidebarLayout } from "../components/SidebarLayout";
import { SqlRowTable } from "../components/SqlRowTable";
import TrButton from "../components/TrButton";
import { type DatabaseConnectionModel, databaseConnectionModelStore } from "../models/connection";

const Index = observer(() => {
    const [isManagingConnections, setIsManagingConnections] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedConnectionId, setSelectedConnectionId] = useState("");

    const selectedConnection = databaseConnectionModelStore.connections.find(
        (connection) => connection.id === selectedConnectionId,
    );

    return (
        <>
            <div className="h-full flex flex-col gap-2">
                <div>
                    <Button icon="database" onClick={() => setIsManagingConnections(true)} />
                    <Button icon="cog" onClick={() => setIsSettingsOpen(true)} />
                </div>
                {selectedConnection && <ConnectionBrowser connection={selectedConnection} />}
            </div>

            {isManagingConnections && (
                <ManageConnectionsDialog
                    onClose={() => setIsManagingConnections(false)}
                    onSelectConnection={(connection) => setSelectedConnectionId(connection.id)}
                />
            )}
            {isSettingsOpen && <SettingsDialog onClose={() => setIsSettingsOpen(false)} />}
        </>
    );
});

interface ConnectionBrowserProps {
    connection: DatabaseConnectionModel;
}

const ConnectionBrowser = observer(({ connection }: ConnectionBrowserProps) => {
    const [selectedTable, setSelectedTable] = useState<{ schema: string; table: string } | null>(null);
    const tablesQuery = useQuery({
        queryKey: ["tables", connection.id, selectedTable?.schema, selectedTable?.table, selectedTable],
        enabled: !!selectedTable,
        queryFn: async () => {
            assertExists(selectedTable);
            return connection.getTableData(selectedTable.table, selectedTable.schema);
        },
    });

    return (
        <SidebarLayout
            sidebar={
                <HTMLTable interactive striped>
                    <thead>
                        <tr>
                            <th>Schema</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {connection.tables.map((table) => (
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
                <TableBrowser connection={connection} schema={selectedTable.schema} table={selectedTable.table} />
            )}
        </SidebarLayout>
    );
});

interface TableBrowserProps {
    connection: DatabaseConnectionModel;
    schema: string;
    table: string;
}

const TableBrowser = observer(({ connection, table, schema }: TableBrowserProps) => {
    const dataQuery = useQuery({
        queryKey: ["data", connection.id, table, connection.tables],
        queryFn: async () => {
            assertExists(connection.tables);
            return connection.getTableData(table, schema);
        },
    });

    const [sql, setSql] = useState("");

    const executeSqlMutation = useMutation({
        mutationFn: async () => {
            const data = await connection.executeSql(sql);
            return { data, sql };
        },
    });

    const tableInfo = connection.tables.find((t) => t.name === table && t.schema === schema);

    return (
        <>
            <Card elevation={1}>
                <H3>Columns</H3>
                <HTMLTable interactive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableInfo?.columns.map((column) => (
                            <TrButton key={column.name}>
                                <td>{column.name}</td>
                                <td>{column.type}</td>
                            </TrButton>
                        ))}
                    </tbody>
                </HTMLTable>
            </Card>

            <SqlRowTable title={`${schema}.${table}`} loading={dataQuery.isLoading} rows={dataQuery.data ?? []} />

            {executeSqlMutation.error && <Callout intent="danger">{executeSqlMutation.error.message}</Callout>}
            <Card elevation={1}>
                <H3>SQL</H3>
                <Editor height="40vh" defaultLanguage="sql" value={sql} onChange={(value) => setSql(value ?? "")} />
                <Button icon="play" onClick={() => executeSqlMutation.mutate()} />
                <Button icon="cross" onClick={() => setSql("")} />
            </Card>

            {executeSqlMutation.isPending ? (
                <Spinner />
            ) : (
                <SqlRowTable
                    title="Results"
                    rows={executeSqlMutation.data?.data ?? []}
                    sql={executeSqlMutation.data?.sql}
                />
            )}
        </>
    );
});

export const Route = createLazyFileRoute("/")({
    component: Index,
});
