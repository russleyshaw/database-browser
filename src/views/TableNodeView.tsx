import { observer } from "mobx-react";

import {
    Background,
    Controls,
    type Edge,
    type EdgeChange,
    type Node,
    type NodeChange,
    ReactFlow,
    applyEdgeChanges,
    applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ColumnNode } from "@/components/xyflow/ColumnNode";
import { TableNode } from "@/components/xyflow/TableNode";
import type { ConnectionModel } from "@/models/connection";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";

type TableNodeViewProps = {
    connection: ConnectionModel;
};

const TABLE_DISTANCE = 500;
const COLUMN_DISTANCE = 50;

export const TableNodeView = observer((props: TableNodeViewProps) => {
    const { connection } = props;

    const nodeTypes = useMemo(() => ({ table: TableNode, column: ColumnNode }), []);

    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const tablesQuery = useQuery({
        queryKey: ["updateMeta", connection.id],
        queryFn: async () => {
            return connection.updateMeta();
        },
    });

    useEffect(() => {
        if (!tablesQuery.data) return;

        console.log("Updating nodes and edges");

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        for (const [tableIdx, table] of tablesQuery.data.tables.entries()) {
            const tableX = tableIdx * TABLE_DISTANCE;
            newNodes.push({
                id: `${table.schema}.${table.name}`,
                type: "table",
                data: { label: `${table.schema}.${table.name}` },
                position: { x: tableX, y: 0 },
            });

            const columns = tablesQuery.data.columns.filter((column) => column.table === table.name);

            for (const [columnIdx, column] of columns.entries()) {
                const foundPrimaryKey = tablesQuery.data.primaryKeys.find(
                    (primaryKey) =>
                        primaryKey.schema === table.schema &&
                        primaryKey.table === table.name &&
                        primaryKey.column === column.name,
                );

                const foundUniqueKey = tablesQuery.data.uniqueKeys.find(
                    (uniqueKey) =>
                        uniqueKey.schema === table.schema &&
                        uniqueKey.table === table.name &&
                        uniqueKey.columns.includes(column.name),
                );

                newNodes.push({
                    id: `${table.schema}.${table.name}.${column.name}`,
                    type: "column",
                    data: {
                        label: `${column.name}`,
                        isPrimaryKey: !!foundPrimaryKey,
                        isUniqueKey: !!foundUniqueKey,
                        type: column.type,
                    },
                    position: {
                        y: columnIdx * COLUMN_DISTANCE - (columns.length * COLUMN_DISTANCE) / 2,
                        x: tableX + 200,
                    },
                } as ColumnNode);

                newEdges.push({
                    id: `${table.schema}.${table.name}.${column.name}`,
                    source: `${table.schema}.${table.name}`,
                    target: `${column.schema}.${column.table}.${column.name}`,
                });
            }

            for (const foreignKey of tablesQuery.data.foreignKeys) {
                if (foreignKey.table !== table.name) continue;
                newEdges.push({
                    id: `${table.schema}.${table.name}.${foreignKey.name}`,
                    source: `${foreignKey.schema}.${foreignKey.table}.${foreignKey.column}`,
                    target: `${foreignKey.referencedSchema}.${foreignKey.referencedTable}.${foreignKey.referencedColumn}`,
                    animated: true,
                });
            }
        }

        setNodes(newNodes);
        setEdges(newEdges);
    }, [tablesQuery.data]);

    const onNodesChange = useCallback(
        (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [],
    );

    return (
        <div className="grow">
            <AutoSizer>
                {({ width, height }) => (
                    <div style={{ width, height }}>
                        <ReactFlow
                            colorMode="dark"
                            nodes={nodes}
                            nodeTypes={nodeTypes}
                            edges={edges}
                            fitView
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                        >
                            <Background />
                            <Controls />
                        </ReactFlow>
                    </div>
                )}
            </AutoSizer>
        </div>
    );
});
