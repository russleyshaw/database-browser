import { Sidebar } from "@/components/Sidebar";
import { APP_MODEL } from "@/models/app";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export const Route = createFileRoute("/connection/$connectionId")({
    loader: (ctx) => {
        const connection = APP_MODEL.getConnection(ctx.params.connectionId);
        if (!connection) {
            throw notFound();
        }

        return {
            connection: connection,
        };
    },
    notFoundComponent: () => <div>Connection: Not Found</div>,
    component: observer(Component),
});

function Component() {
    const { connection } = Route.useLoaderData();

    const metaQuery = useQuery({
        queryKey: ["meta", connection.id],
        queryFn: () => connection.updateMeta(),
        refetchInterval: 1000 * 10,
    });

    return (
        <PanelGroup direction="horizontal">
            <Panel defaultSize={25} className="overflow-hidden flex flex-col">
                <div className="grow overflow-auto">
                    <Sidebar connection={connection} />
                </div>
            </Panel>
            <PanelResizeHandle className="w-2 h-full bg-black/20 hover:bg-black/40" />
            <Panel minSize={50} className="overflow-hidden flex flex-col">
                <div className="grow overflow-auto">
                    <Outlet />
                </div>
            </Panel>
        </PanelGroup>
    );
}
