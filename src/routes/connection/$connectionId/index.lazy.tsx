import { APP_MODEL } from "@/models/app";
import { ConnectionInfoView } from "@/views/ConnectionInfoView";
import { createLazyFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createLazyFileRoute("/connection/$connectionId/")({
    component: observer(Component),
});

function Component() {
    const { connectionId } = Route.useParams();
    const connection = APP_MODEL.getConnection(connectionId);
    if (!connection) return <div>Connection Not Found: {connectionId}</div>;

    return <ConnectionInfoView connection={connection} />;
}
