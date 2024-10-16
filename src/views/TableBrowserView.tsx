import { SqlRowTable } from "@/components/SqlRowTable";
import TrButton from "@/components/TrButton";
import type { SqlRequestResult } from "@/lib/sql/core";
import { assertExists } from "@/lib/utils";
import type { ConnectionModel } from "@/models/connection";
import { H3, H4, HTMLTable, Icon, Tooltip } from "@blueprintjs/core";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useMemo, useState } from "react";

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

    const result = useMemo(() => {
        if (!dataQuery.data) return null;
        return {
            request: {
                sql: dataQuery.data.sql,
                values: dataQuery.data.query.values,
            },
            response: {
                columns: dataQuery.data.query.columns.map((col) => ({
                    name: col.name,
                    type: col.col_type,
                    orderIdx: col.order_idx,
                })),
                rows: dataQuery.data.data,
            },
        } satisfies SqlRequestResult;
    }, [dataQuery.data]);

    return (
        <div className="flex flex-col gap-2 p-2">
            <H3>Table: {table}</H3>

            <H4 className="text-center">Columns</H4>
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

            <H4 className="text-center">Data</H4>

            <SqlRowTable loading={dataQuery.isLoading} result={result ?? undefined} />
        </div>
    );
});
