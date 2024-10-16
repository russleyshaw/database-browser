import { type ButtonTabEntry, ButtonTabs } from "@/components/ButtonTabs";
import { ManageConnectionsDialog } from "@/components/ManageConnectionsDialog";
import { SETTINGS_MODEL, SettingsDialog } from "@/components/SettingsDialog";
import { APP_MODEL } from "@/models/app";
import { THEME_STORE, useTheme } from "@/models/theme";
import { Button } from "@blueprintjs/core";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useLocation, useMatch, useNavigate } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { observer } from "mobx-react";
import { useState } from "react";

interface RootLayoutProps {
    children: React.ReactNode;
}

export const RootLayout = observer(({ children }: RootLayoutProps) => {
    useTheme(THEME_STORE);

    const [isManagingConnections, setIsManagingConnections] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const navigate = useNavigate();
    const match = useMatch({ from: "/connection/$connectionId/", shouldThrow: false });

    const activeConnectionId = match?.params.connectionId;

    function setActiveConnectionId(id: string) {
        navigate({ to: `/connection/${id}` });
    }

    const location = useLocation();
    const tabs: ButtonTabEntry<string>[] = APP_MODEL.connections.map((conn) => ({
        name: conn.config.name,
        value: conn.id,
    }));

    return (
        <div className="flex flex-col grow h-full overflow-hidden items-stretch">
            <div className="flex flex-row items-center justify-between">
                <ButtonTabs tabs={tabs} selectedTab={activeConnectionId ?? null} onSelectTab={setActiveConnectionId} />
                <div className="flex flex-row gap-2 items-center">
                    <span className="text-xs text-gray-500">{location.pathname}</span>

                    <Button icon="database" onClick={() => setIsManagingConnections(true)} />
                    <Button icon="cog" onClick={() => setIsSettingsOpen(true)} />
                </div>
            </div>

            <div className="grow overflow-hidden">{children}</div>

            {isManagingConnections && (
                <ManageConnectionsDialog
                    onClose={() => setIsManagingConnections(false)}
                    onSelectConnection={(connection) => {
                        // Find existing connection
                        const foundConn = APP_MODEL.connections.find((c) => c.id === connection.id);

                        if (foundConn) {
                            setActiveConnectionId(foundConn.id);
                        } else {
                            setActiveConnectionId(connection.id);
                        }

                        setIsManagingConnections(false);
                    }}
                />
            )}
            {isSettingsOpen && <SettingsDialog onClose={() => setIsSettingsOpen(false)} />}

            {SETTINGS_MODEL.values.isDebug && (
                <>
                    <ReactQueryDevtools />
                    <TanStackRouterDevtools />
                </>
            )}
        </div>
    );
});
