import { IS_DEV_MODE } from "@/global";
import { THEME_STORE, ThemeSelect } from "@/models/theme";
import {
    Card,
    CardList,
    Dialog,
    DialogBody,
    DialogFooter,
    FormGroup,
    H3,
    Icon,
    type IconName,
    Switch,
} from "@blueprintjs/core";
import clsx from "clsx";
import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";
import { useState } from "react";

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

class SettingsModel {
    values: {
        isDebug: boolean;
    };

    constructor() {
        this.values = {
            isDebug: IS_DEV_MODE,
        };

        makeAutoObservable(this);
    }

    setValue<K extends keyof typeof this.values>(key: K, value: (typeof this.values)[K]) {
        this.values[key] = value;
    }
}

export const SETTINGS_MODEL = new SettingsModel();

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
            <DialogBody className="grid left-pane-grid gap-2">Body</DialogBody>

            <DialogFooter />
        </Dialog>
    );
});

const GeneralSettings = observer(() => {
    return (
        <div className="flex flex-col gap-2">
            <H3>General Settings</H3>

            <ThemeSelect model={THEME_STORE} />

            <FormGroup helperText="Displays additional developerinformation and elements.">
                <Switch
                    large
                    label="Debug Mode"
                    checked={SETTINGS_MODEL.values.isDebug}
                    onChange={() => SETTINGS_MODEL.setValue("isDebug", !SETTINGS_MODEL.values.isDebug)}
                />
            </FormGroup>
        </div>
    );
});

const DatabaseSettings = observer(() => {
    return (
        <>
            <H3>Database Settings</H3>
        </>
    );
});
