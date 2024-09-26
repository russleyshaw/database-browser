import { type BaseDiscUnion, matchUnions } from "@/lib/utils";
import type { ConnectionModel } from "@/models/connection";
import { Tree, type TreeNodeInfo } from "@blueprintjs/core";
import { useQuery } from "@tanstack/react-query";
import { observer, useLocalObservable } from "mobx-react";
import { useState } from "react";
import { SidebarLayout } from "../components/SidebarLayout";
import { NewSavedQueryView } from "./NewSavedQueryView";
import { TableBrowserView } from "./TableBrowserView";
import { TableNodeView } from "./TableNodeView";

interface BaseView extends BaseDiscUnion {}

interface DashboardView extends BaseView {
    type: "dashboard";
}

interface TableView extends BaseView {
    type: "table";
    schema: string;
    table: string;
}

interface GraphView extends BaseView {
    type: "graph";
}

interface SavedQueryView extends BaseView {
    type: "savedQuery";
}

type View = TableView | GraphView | DashboardView | SavedQueryView;

interface SidebarProps {
    connection: ConnectionModel;
    view: View;
    setView: (view: View) => void;
}

interface TreeData {
    onClick?: () => void;
}

const Sidebar = observer(({ connection, view, setView }: SidebarProps) => {
    const expanded = useLocalObservable(() => new Map<string, boolean>());

    const root: TreeNodeInfo<TreeData>[] = [
        {
            id: "connection",
            label: connection.name,
            icon: "database",
            isExpanded: expanded.get("connection") ?? true,
            isSelected: view.type === "dashboard",
            nodeData: {
                onClick: () => setView({ type: "dashboard" }),
            },

            childNodes: [
                {
                    id: "visualize",
                    label: "Visualize",
                    icon: "graph",
                    isExpanded: expanded.get("visualize") ?? true,
                    isSelected: view.type === "graph",
                    nodeData: {
                        onClick: () => setView({ type: "graph" }),
                    },
                },
                {
                    id: "savedQueries",
                    label: "Queries",
                    icon: "antenna",
                    isExpanded: expanded.get("savedQueries") ?? true,
                    nodeData: {
                        onClick: () => setView({ type: "savedQuery" }),
                    },
                },
                {
                    id: "tables",
                    label: "Tables",
                    icon: "panel-table",
                    isExpanded: expanded.get("tables") ?? true,

                    childNodes: connection.tables.map(
                        (table): TreeNodeInfo => ({
                            id: `${table.name}.${table.name}`,
                            label: table.name,
                            nodeData: {
                                onClick: () => setView({ type: "table", schema: table.schema, table: table.name }),
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

interface ConnectionBrowserProps {
    connection: ConnectionModel;
}

export const ConnectionBrowser = observer(({ connection }: ConnectionBrowserProps) => {
    const [selectedView, setSelectedView] = useState<View>({
        type: "dashboard",
    });
    useQuery({
        queryKey: ["updateMeta", connection.id],
        queryFn: async () => {
            return connection.updateMeta();
        },
    });

    const SelectedView = matchUnions(selectedView, {
        dashboard: () => <div>Dashboard</div>,
        graph: () => <TableNodeView connection={connection} />,
        table: (v) => (
            <TableBrowserView
                key={`${v.schema}.${v.table}`}
                connection={connection}
                schema={v.schema}
                table={v.table}
            />
        ),
        savedQuery: () => <NewSavedQueryView connection={connection} />,
    });

    return (
        <SidebarLayout sidebar={<Sidebar connection={connection} view={selectedView} setView={setSelectedView} />}>
            {SelectedView}
        </SidebarLayout>
    );
});
