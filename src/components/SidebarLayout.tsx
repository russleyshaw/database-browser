import { useHotkeys } from "@blueprintjs/core";
import { observer } from "mobx-react";
import { useMemo, useState } from "react";

export interface SidebarLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export const SidebarLayout = observer(({ sidebar, children }: SidebarLayoutProps) => {
    const [showSidebar, setShowSidebar] = useState(true);

    const hotkeys = useMemo(
        () => [
            {
                combo: "Ctrl + b",
                global: true,
                label: "Toggle sidebar",
                onKeyDown: () => setShowSidebar((p) => !p),
            },
        ],
        [],
    );
    const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);

    return (
        <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} className="flex flex-row grow overflow-hidden">
            {showSidebar && (
                <>
                    <div className="w-64 overflow-auto">{sidebar}</div>
                    <div className="w-1 bg-neutral-900" />
                </>
            )}
            <div className="flex-1 overflow-auto">{children}</div>
        </div>
    );
});
