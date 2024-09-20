import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    FormGroup,
    InputGroup,
    MenuItem,
    NumericInput,
    Tag,
} from "@blueprintjs/core";
import type { ItemRenderer } from "@blueprintjs/select";
import type { DatabaseConnection } from "@common/database";
import { assertExists } from "@common/utils";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useState } from "react";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { DatabaseConnectionModel, databaseConnectionModelStore } from "../models/connection";
import { checkConnection } from "../pgsql";

interface ConnectionDialogProps {
    connection?: DatabaseConnectionModel; // If this is provided, the dialog will be in edit mode
    onSubmit: (connection: DatabaseConnectionModel) => void;
    onClose: () => void;
}

export const ConnectionDialog = observer(({ connection, onSubmit, onClose }: ConnectionDialogProps) => {
    const [connectionId] = useState(connection?.id || crypto.randomUUID());

    // Form fields
    const [connectionName, setConnectionName] = useState(connection?.name || "");
    const [databaseName, setDatabaseName] = useState(connection?.connection.database || "");
    const [databaseHost, setDatabaseHost] = useState(connection?.connection.host || "");
    const [databasePort, setDatabasePort] = useState(connection?.connection.port || "");
    const [databaseUsername, setDatabaseUsername] = useState(connection?.connection.user || "");
    const [databasePassword, setDatabasePassword] = useState(connection?.connection.password || "");

    // Resolve from default values.
    const resolvedHost = databaseHost || "localhost";
    const resolvedPort = Number(databasePort) || 5432;
    const resolvedUsername = databaseUsername ?? "postgres";
    const resolvedPassword = databasePassword ?? "postgres";
    const resolvedDatabase = databaseName || "postgres";

    const conn: DatabaseConnection = {
        host: resolvedHost,
        port: resolvedPort,
        user: resolvedUsername,
        password: resolvedPassword,
        database: resolvedDatabase,
    };
    const debouncedConn = useDebouncedValue<DatabaseConnection>(conn, 500);

    let nameError = connectionName.length === 0 && "Connection name is required";
    nameError ||=
        databaseConnectionModelStore.connections.some((c) => c.name === connectionName && c.id !== connectionId) &&
        "Connection name must be unique";

    const error = nameError;

    const connectionStatusQuery = useQuery({
        queryKey: ["connectionStatus", connectionId, debouncedConn],
        enabled: !!debouncedConn,
        retry: 3,
        retryDelay: 1000,
        refetchInterval: 10000,

        queryFn: async () => {
            assertExists(debouncedConn);
            await checkConnection({ connection: debouncedConn });
            return "connected";
        },
    });

    function onSubmitClick() {
        onSubmit(
            new DatabaseConnectionModel({
                id: connectionId,
                name: connectionName,
                connection: {
                    host: resolvedHost,
                    port: resolvedPort,
                    user: resolvedUsername,
                    password: resolvedPassword,
                    database: resolvedDatabase,
                },
            }),
        );
    }

    const title = connection ? "Edit database" : "Add a database";
    const icon = connection ? "edit" : "info-sign";

    return (
        <Dialog isOpen title={title} icon={icon} onClose={onClose}>
            <DialogBody>
                <FormGroup label="Connection name" intent={nameError ? "danger" : undefined} helperText={nameError}>
                    <InputGroup
                        intent={nameError ? "danger" : undefined}
                        value={connectionName}
                        onChange={(e) => setConnectionName(e.target.value)}
                        required
                        placeholder={connection?.name ?? "My database"}
                        minLength={1}
                    />
                </FormGroup>

                <FormGroup label="Database name">
                    <InputGroup value={databaseName} onChange={(e) => setDatabaseName(e.target.value)} />
                </FormGroup>

                <FormGroup label="Database host">
                    <InputGroup value={databaseHost} onChange={(e) => setDatabaseHost(e.target.value)} />
                </FormGroup>

                <FormGroup label="Database port">
                    <NumericInput value={databasePort} onChange={(e) => setDatabasePort(e.target.value)} />
                </FormGroup>

                <FormGroup label="Username">
                    <InputGroup value={databaseUsername} onChange={(e) => setDatabaseUsername(e.target.value)} />
                </FormGroup>

                <FormGroup label="Password">
                    <InputGroup
                        value={databasePassword}
                        onChange={(e) => setDatabasePassword(e.target.value)}
                        type="password"
                    />
                </FormGroup>
            </DialogBody>
            <DialogFooter
                actions={
                    <Button
                        disabled={!!error}
                        onClick={onSubmitClick}
                        intent="primary"
                        text={connection ? "Update" : "Add"}
                    />
                }
            >
                {connectionStatusQuery.isSuccess && (
                    <Tag intent="success" round>
                        Connected!
                    </Tag>
                )}

                {connectionStatusQuery.isError && (
                    <Tag intent="danger" round>
                        No connection!
                    </Tag>
                )}

                {connectionStatusQuery.isLoading && (
                    <Tag intent="warning" round>
                        Connecting...
                    </Tag>
                )}
            </DialogFooter>
        </Dialog>
    );
});
