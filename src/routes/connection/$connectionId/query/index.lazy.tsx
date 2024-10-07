import { APP_MODEL } from "@/models/app";
import { SavedQueryEditorView } from "@/views/SavedQueryView";
import { createLazyFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createLazyFileRoute("/connection/$connectionId/query/")({
    component: observer(Component),
});

function Component() {
    const { connectionId } = Route.useParams();

    const connection = APP_MODEL.getConnection(connectionId);
    if (!connection) return <div>Connection Not Found: {connectionId}</div>;

    return (
        <SavedQueryEditorView
            connection={connection}
            onSave={(q) => {
                return connection.updateQuery(q);
            }}
        />
    );
}
