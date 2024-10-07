import type { ConnectionModel } from "@/models/connection";
import { ContextMenu, Menu, MenuItem, Tag, Tree, type TreeNodeInfo } from "@blueprintjs/core";
import { useMatchRoute, useNavigate } from "@tanstack/react-router";
import { observer, useLocalObservable } from "mobx-react";

interface TreeData {
    onClick?: () => void;
}

interface SidebarProps {
    connection: ConnectionModel;
}

export const Sidebar = observer(({ connection }: SidebarProps) => {
    const expanded = useLocalObservable(() => new Map<string, boolean>());

    const matchRoute = useMatchRoute();

    const isDashboardSelected = matchRoute({ to: "/connection/$connectionId" });
    const isGraphSelected = matchRoute({ to: "/connection/$connectionId/visualizer" });
    const isCreateQuerySelected = matchRoute({ to: "/connection/$connectionId/query" });
    const isEditQuerySelected = matchRoute({ to: "/connection/$connectionId/query/$queryId" });
    const navigate = useNavigate();

    const root: TreeNodeInfo<TreeData>[] = [
        {
            id: "connection",
            label: connection.name,
            icon: "database",
            isExpanded: expanded.get("connection") ?? true,
            isSelected: !!isDashboardSelected,
            nodeData: {
                onClick: () => navigate({ to: "/connection/$connectionId", params: { connectionId: connection.id } }),
            },

            childNodes: [
                {
                    id: "visualize",
                    label: "Visualize",
                    icon: "graph",
                    isExpanded: expanded.get("visualize") ?? true,
                    isSelected: !!isGraphSelected,
                    nodeData: {
                        onClick: () =>
                            navigate({
                                to: "/connection/$connectionId/visualizer",
                                params: { connectionId: connection.id },
                            }),
                    },
                },

                {
                    id: "savedQueries",
                    label: (
                        <span>
                            Queries{" "}
                            <Tag round minimal>
                                {connection.config.queries?.length ?? 0}
                            </Tag>
                        </span>
                    ),
                    icon: "antenna",
                    isExpanded: expanded.get("savedQueries") ?? true,
                    isSelected: !!isCreateQuerySelected,
                    nodeData: {
                        onClick: () =>
                            navigate({
                                to: "/connection/$connectionId/query",
                                params: { connectionId: connection.id },
                            }),
                    },

                    childNodes: (connection.config.queries ?? []).map(
                        (query): TreeNodeInfo => ({
                            id: query.id,
                            label: (
                                <ContextMenu
                                    content={
                                        <Menu>
                                            <MenuItem
                                                onClick={() => connection.removeQuery(query.id)}
                                                text="Delete..."
                                                intent="danger"
                                            />
                                        </Menu>
                                    }
                                >
                                    <span>{query.name}</span>
                                </ContextMenu>
                            ),
                            isSelected: !!matchRoute({
                                to: "/connection/$connectionId/query/$queryId",
                                params: {
                                    queryId: query.id,
                                },
                            }),
                            nodeData: {
                                onClick: () =>
                                    navigate({
                                        to: "/connection/$connectionId/query/$queryId",
                                        params: { connectionId: connection.id, queryId: query.id },
                                    }),
                            },
                        }),
                    ),
                },
                {
                    id: "tables",
                    label: (
                        <span>
                            Tables{" "}
                            <Tag round minimal>
                                {connection.tables.length}
                            </Tag>
                        </span>
                    ),
                    icon: "panel-table",
                    isExpanded: expanded.get("tables") ?? true,
                    nodeData: {
                        onClick: () =>
                            navigate({
                                to: "/connection/$connectionId/table/",
                                params: { connectionId: connection.id },
                            }),
                    },

                    childNodes: connection.tables.map(
                        (table): TreeNodeInfo => ({
                            id: `${table.name}.${table.name}`,
                            label: table.name,
                            nodeData: {
                                onClick: () =>
                                    navigate({
                                        to: "/connection/$connectionId/table/$tableName",
                                        params: { connectionId: connection.id, tableName: table.name },
                                    }),
                            },
                        }),
                    ),
                },
            ],
        },
    ];

    return (
        <Tree<TreeData>
            onNodeClick={(node) => {
                node.nodeData?.onClick?.();
            }}
            onNodeCollapse={(node) => {
                expanded.set(node.id as string, false);
            }}
            onNodeExpand={(node) => {
                expanded.set(node.id as string, true);
            }}
            compact
            contents={root}
        />
    );
});
