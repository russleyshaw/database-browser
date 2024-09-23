import { type ButtonTabEntry, ButtonTabs } from "@/components/ButtonTabs";
import { ManageConnectionsDialog } from "@/components/ManageConnectionsDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ConnectionModel } from "@/models/connection";
import { ConnectionBrowser } from "@/views/ConnectionBrowser";
import { TableNodeView } from "@/views/TableNodeView";
import { Button } from "@blueprintjs/core";
import { createLazyFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { useState } from "react";

enum ViewMode {
    Browser = "browser",
    Nodes = "nodes",
}

export const Route = createLazyFileRoute("/")({
    component: observer(() => {
        const [isManagingConnections, setIsManagingConnections] = useState(false);
        const [isSettingsOpen, setIsSettingsOpen] = useState(false);

        const [activeConnections, setActiveConnections] = useState<ConnectionModel[]>([]);
        const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

        const tabs = activeConnections.map((connection) => ({
            name: connection.name,
            value: connection.id,
        }));

        const viewTabs: ButtonTabEntry<ViewMode>[] = [
            {
                name: "Browser",
                value: ViewMode.Browser,
            },
            {
                name: "Nodes",
                value: ViewMode.Nodes,
            },
        ];

        const [selectedView, setSelectedView] = useState<ViewMode>(ViewMode.Browser);

        const activeConnection = activeConnections.find((c) => c.id === activeConnectionId);

        return (
            <>
                <div className="flex flex-row items-center justify-between">
                    <ButtonTabs
                        tabs={tabs}
                        selectedTab={activeConnectionId}
                        onSelectTab={(newTabId) => {
                            const connection = activeConnections.find((c) => c.id === newTabId);
                            if (!connection) return;

                            setActiveConnectionId(connection.id);
                        }}
                        onCloseTab={(tabId) => {
                            setActiveConnections(activeConnections.filter((c) => c.id !== tabId));
                        }}
                    />
                    <div className="flex flex-row gap-2">
                        <Button icon="database" onClick={() => setIsManagingConnections(true)} />
                        <Button icon="cog" onClick={() => setIsSettingsOpen(true)} />
                    </div>
                </div>

                <ButtonTabs
                    tabs={viewTabs}
                    selectedTab={selectedView}
                    onSelectTab={(newView) => {
                        setSelectedView(newView);
                    }}
                />

                {activeConnection && selectedView === ViewMode.Browser && (
                    <ConnectionBrowser connection={activeConnection} />
                )}
                {activeConnection && selectedView === ViewMode.Nodes && <TableNodeView connection={activeConnection} />}
                {isManagingConnections && (
                    <ManageConnectionsDialog
                        onClose={() => setIsManagingConnections(false)}
                        onSelectConnection={(connection) => {
                            // Find existing connection
                            const foundConn = activeConnections.find((c) => c.config.id === connection.id);

                            if (foundConn) {
                                setActiveConnectionId(foundConn.id);
                            } else {
                                setActiveConnections([...activeConnections, new ConnectionModel(connection)]);
                                setActiveConnectionId(connection.id);
                            }

                            setIsManagingConnections(false);
                        }}
                    />
                )}
                {isSettingsOpen && <SettingsDialog onClose={() => setIsSettingsOpen(false)} />}
            </>
        );
    }),
});
