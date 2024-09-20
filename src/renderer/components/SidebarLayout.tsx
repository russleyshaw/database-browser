export interface SidebarLayoutProps {
    sidebar: React.ReactNode;
    children: React.ReactNode;
}

export function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
    return (
        <div className="flex flex-row overflow-hidden">
            <div className="w-64 overflow-y-scroll">{sidebar}</div>
            <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
    );
}
