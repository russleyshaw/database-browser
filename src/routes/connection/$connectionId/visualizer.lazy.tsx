import { APP_MODEL } from "@/models/app";
import { TableNodeView } from "@/views/TableNodeView";
import { createLazyFileRoute, notFound } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createLazyFileRoute("/connection/$connectionId/visualizer")({
    component: observer(Component),
    notFoundComponent: () => <div>Not Found</div>,
});

function Component() {
    const { connectionId } = Route.useParams();
    const connection = APP_MODEL.getConnection(connectionId);
    if (!connection) {
        throw notFound();
    }
    return <TableNodeView connection={connection} />;
}
