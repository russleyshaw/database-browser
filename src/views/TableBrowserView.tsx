import { SqlRowTable } from "@/components/SqlRowTable";
import TrButton from "@/components/TrButton";
import { assertExists } from "@/lib/utils";
import type { ConnectionModel } from "@/models/connection";
import { Button, H3, HTMLTable, Icon, Tooltip } from "@blueprintjs/core";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useState } from "react";

interface TableBrowserViewProps {
    connection: ConnectionModel;
    schema: string;
    table: string;
}

export const TableBrowserView = observer(({ connection, table, schema }: TableBrowserViewProps) => {
    const [useFks, setUseFks] = useState(true);
    const dataQuery = useQuery({
        queryKey: ["data", connection.id, table, connection.tables, useFks],
        queryFn: async () => {
            assertExists(connection.tables);
            return connection.getTableData(table, schema, useFks);
        },
    });

    const columns = connection.columns.filter((c) => c.table === table && c.schema === schema);

    return (
        <div className="flex flex-col gap-2 p-2">
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
                            (t) => t.name === foreignKey?.referencedTable && t.schema === foreignKey?.referencedSchema,
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

            <H3>SQL</H3>
            <SqlRowTable title={`${schema}.${table}`} loading={dataQuery.isLoading} tableData={dataQuery.data}>
                <Button icon="refresh" onClick={() => setUseFks(!useFks)}>
                    {useFks ? "Hide FKs" : "Show FKs"}
                </Button>
            </SqlRowTable>
        </div>
    );
});
