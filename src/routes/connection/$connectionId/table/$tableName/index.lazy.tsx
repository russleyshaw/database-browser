import { APP_MODEL } from "@/models/app";
import { TableBrowserView } from "@/views/TableBrowserView";
import { createLazyFileRoute } from "@tanstack/react-router";
import { observer } from "mobx-react";

export const Route = createLazyFileRoute("/connection/$connectionId/table/$tableName/")({
    component: observer(Component),
});

function Component() {
    const { connectionId, tableName } = Route.useParams();
    const connection = APP_MODEL.getConnection(connectionId);
    if (!connection) return <div>Connection Not Found: {connectionId}</div>;

    const entry = connection.tables.find((table) => table.name === tableName);
    if (!entry) return <div>Table Not Found: {tableName}</div>;

    return <TableBrowserView connection={connection} table={entry.name} schema={entry.schema} />;
}
