import { SqlLogOutput } from "@/components/SqlLogOutput";
import { RootLayout } from "@/layouts/RootLayout";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export const Route = createRootRoute({
    component: observer(Component),
    notFoundComponent: () => <div>Root: Not Found</div>,
});

function Component() {
    return (
        <RootLayout>
            <PanelGroup direction="vertical">
                <Panel minSize={10}>
                    <Outlet />
                </Panel>
                <PanelResizeHandle className="h-2 w-full bg-black/20 hover:bg-black/40" />
                <Panel defaultSize={25} minSize={10} className="overflow-hidden flex flex-col">
                    <div className="grow overflow-auto">
                        <SqlLogOutput />
                    </div>
                </Panel>
            </PanelGroup>
        </RootLayout>
    );
}
