import { THEME_STORE, ThemeSelect } from "@/models/theme";
import { Card, CardList, Dialog, DialogBody, DialogFooter, H3, Icon, type IconName } from "@blueprintjs/core";
import clsx from "clsx";
import { observer } from "mobx-react";
import { useState } from "react";
import { SidebarLayout } from "./SidebarLayout";

const SETTINGS_TABS = {
    general: { name: "General", icon: "cog" },
    database: { name: "Database", icon: "database" },
} satisfies Record<string, { name: string; icon: IconName }>;
type SettingsTabKey = keyof typeof SETTINGS_TABS;

interface SettingsDialogProps {
    onClose: () => void;
}

interface SidebarProps {
    selectedTabKey: SettingsTabKey;
    onSelectTab: (tabKey: SettingsTabKey) => void;
}

const Sidebar = observer(({ selectedTabKey, onSelectTab }: SidebarProps) => {
    const tabs = Object.entries(SETTINGS_TABS);
    return (
        <CardList>
            {tabs.map(([key, tab]) => (
                <Card
                    className={clsx("flex flex-row items-center gap-2", selectedTabKey === key && "bp5-intent-primary")}
                    onClick={() => onSelectTab(key as SettingsTabKey)}
                    interactive={true}
                    key={key}
                >
                    <Icon icon={tab.icon} />
                    <span>{tab.name}</span>
                </Card>
            ))}
        </CardList>
    );
});
export const SettingsDialog = observer(({ onClose }: SettingsDialogProps) => {
    const [selectedTabKey, setSelectedTabKey] = useState<SettingsTabKey>("general");

    return (
        <Dialog className="min-w-96" title="Settings" isOpen onClose={onClose}>
            <DialogBody className="grid left-pane-grid gap-2">
                <SidebarLayout sidebar={<Sidebar selectedTabKey={selectedTabKey} onSelectTab={setSelectedTabKey} />}>
                    <div>
                        {selectedTabKey === "general" && <GeneralSettings />}
                        {selectedTabKey === "database" && <DatabaseSettings />}
                    </div>
                </SidebarLayout>
            </DialogBody>

            <DialogFooter />
        </Dialog>
    );
});

const GeneralSettings = observer(() => {
    return (
        <>
            <H3>General Settings</H3>

            <ThemeSelect model={THEME_STORE} />
        </>
    );
});

const DatabaseSettings = observer(() => {
    return (
        <>
            <H3>Database Settings</H3>
        </>
    );
});
