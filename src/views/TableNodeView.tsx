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
import { TableNode } from "@/components/xyflow/TableNode";
import type { ConnectionModel } from "@/models/connection";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";

type TableNodeViewProps = {
    connection: ConnectionModel;
};

const TABLE_DISTANCE = 300;

export const TableNodeView = observer((props: TableNodeViewProps) => {
    const { connection } = props;

    const nodeTypes = useMemo(() => ({ Table: TableNode }), []);

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

        const newNodes: TableNode[] = [];
        const newEdges: Edge[] = [];

        for (const [tableIdx, table] of tablesQuery.data.tables.entries()) {
            const tableX = tableIdx * TABLE_DISTANCE;
            const tableId = `${table.schema}.${table.name}`;
            const newNode: TableNode = {
                id: tableId,
                type: "Table",
                data: { table: table.name, schema: table.schema, connection: connection },
                position: { x: tableX, y: 0 },
            };
            newNodes.push(newNode);
            console.log(newNode);
        }

        // Connect FKs
        for (const foreignKey of tablesQuery.data.foreignKeys) {
            // Skip self-referential FKs
            if (foreignKey.table === foreignKey.referencedTable) continue;
            const newEdge: Edge = {
                id: `${foreignKey.schema}.${foreignKey.table}.${foreignKey.name}`,
                source: `${foreignKey.schema}.${foreignKey.table}`,
                target: `${foreignKey.referencedSchema}.${foreignKey.referencedTable}`,
                sourceHandle: `${foreignKey.schema}.${foreignKey.table}.${foreignKey.column}`,
                targetHandle: `${foreignKey.referencedSchema}.${foreignKey.referencedTable}.${foreignKey.referencedColumn}`,
            };

            newEdges.push(newEdge);
            console.log("Edge", newEdge);
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
    );
});
