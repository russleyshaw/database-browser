import { Sidebar } from "@/components/Sidebar";
import { SidebarLayout } from "@/components/SidebarLayout";
import { APP_MODEL } from "@/models/app";
import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import { observer } from "mobx-react";
import { ErrorBoundary } from "react-error-boundary";

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
        <SidebarLayout sidebar={<Sidebar connection={connection} />}>
            <ErrorBoundary fallbackRender={(props) => <div>Error: {JSON.stringify(props.error)}</div>}>
                <Outlet />
            </ErrorBoundary>
        </SidebarLayout>
    );
}
