import { ButtonTabs } from "@/components/ButtonTabs";
import { ManageConnectionsDialog } from "@/components/ManageConnectionsDialog";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ConnectionModel } from "@/models/connection";
import { ConnectionBrowser } from "@/views/ConnectionView";
import { Button } from "@blueprintjs/core";
import { createLazyFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { useState } from "react";

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
                {activeConnection && <ConnectionBrowser connection={activeConnection} />}
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
