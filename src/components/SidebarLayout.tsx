import { observer } from "mobx-react";

export interface SidebarLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export const SidebarLayout = observer(({ sidebar, children }: SidebarLayoutProps) => {
    return (
        <div className="flex flex-row grow gap-4 overflow-hidden">
            <div className="max-w-64 overflow-y-auto overflow-x-hidden">{sidebar}</div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
        </div>
    );
});
