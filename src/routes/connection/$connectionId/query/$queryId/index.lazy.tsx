import { APP_MODEL } from "@/models/app";
import { SavedQueryEditorView } from "@/views/SavedQueryView";
import { createLazyFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createLazyFileRoute("/connection/$connectionId/query/$queryId/")({
    component: observer(Component),
});

function Component() {
    const { connectionId, queryId } = Route.useParams();
    const connection = APP_MODEL.getConnection(connectionId);
    if (!connection) return <div>Connection Not Found: {connectionId}</div>;

    const query = connection.getQuery(queryId);
    if (!query) return <div>Query Not Found: {queryId}</div>;

    return (
        <SavedQueryEditorView
            connection={connection}
            queryId={queryId}
            onSave={(q) => {
                return connection.updateQuery(q);
            }}
        />
    );
}
