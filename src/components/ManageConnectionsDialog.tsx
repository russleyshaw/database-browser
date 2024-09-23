import { Button, ButtonGroup, Dialog, DialogBody, HTMLTable, Icon, Tooltip } from "@blueprintjs/core";

import { checkConnection } from "@/lib/pgsql";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useState } from "react";
import { CONNECTION_CONFIG_STORE, ConnectionConfigModel } from "../models/connection-config";
import ConfirmIconButton from "./ConfirmIconButton";
import { ConnectionDialog } from "./ConnectionDialog";
import TrButton from "./TrButton";

interface ConnectionRowProps {
    connection: ConnectionConfigModel;
    removeConnection: () => void;
    editConnection: () => void;
    onSelectConnection: (connection: ConnectionConfigModel) => void;
}

const ConnectionRow = observer(
    ({ connection, removeConnection, editConnection, onSelectConnection }: ConnectionRowProps) => {
        const url = `${connection.connection.host}:${connection.connection.port}`;

        const connectionStatusQuery = useQuery({
            queryKey: ["connectionStatus", connection.id],
            retry: 3,
            retryDelay: 1000,
            refetchInterval: 10000,
            queryFn: async () => {
                await checkConnection({ connection: connection.connection });
                return "ok";
            },
        });
        return (
            <TrButton className="align-middle" onClick={() => onSelectConnection(connection)}>
                <td>{connection.name}</td>
                <td> {url}</td>
                <td>{connection.connection.user}</td>
                <td>
                    {connectionStatusQuery.isLoading && <Icon icon="circle" intent="warning" />}
                    {connectionStatusQuery.isSuccess && <Icon icon="tick-circle" intent="success" />}
                    {connectionStatusQuery.isError && (
                        <Tooltip content={connectionStatusQuery.error.name}>
                            <Icon icon="cross-circle" intent="danger" />
                        </Tooltip>
                    )}
                </td>
                <td>
                    <ButtonGroup minimal>
                        <Button icon="edit" onClick={() => editConnection()} />
                        <ConfirmIconButton
                            icon="trash"
                            confirmIcon="trash"
                            confirmIntent="danger"
                            confirmText="Are you sure you want to delete this connection?"
                            onConfirm={() => {
                                removeConnection();
                            }}
                        />
                    </ButtonGroup>
                </td>
            </TrButton>
        );
    },
);

interface ManageConnectionsDialogProps {
    onClose: () => void;
    onSelectConnection: (connection: ConnectionConfigModel) => void;
}

export const ManageConnectionsDialog = observer(({ onClose, onSelectConnection }: ManageConnectionsDialogProps) => {
    const [addConnectionDialogOpen, setAddConnectionDialogOpen] = useState(false);

    const [editingConnection, setEditingConnection] = useState<ConnectionConfigModel | null>(null);

    return (
        <Dialog isOpen onClose={onClose} title="Manage Connections">
            <DialogBody>
                <Button onClick={() => setAddConnectionDialogOpen(true)}>Add Connection</Button>

                <HTMLTable striped interactive compact>
                    <thead>
                        <tr>
                            <th>Name</th>

                            <th>URL</th>
                            <th>User</th>
                            <th />
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {CONNECTION_CONFIG_STORE.configs.map((connection) => (
                            <ConnectionRow
                                key={connection.name}
                                connection={connection}
                                removeConnection={() => {
                                    CONNECTION_CONFIG_STORE.remove(connection.id);
                                }}
                                editConnection={() => {
                                    setEditingConnection(connection);
                                }}
                                onSelectConnection={onSelectConnection}
                            />
                        ))}
                    </tbody>
                </HTMLTable>

                {editingConnection && (
                    <ConnectionDialog
                        connection={editingConnection}
                        onSubmit={() => {
                            setEditingConnection(null);
                        }}
                        onClose={() => setEditingConnection(null)}
                    />
                )}

                {addConnectionDialogOpen && (
                    <ConnectionDialog
                        onSubmit={(connection) => {
                            CONNECTION_CONFIG_STORE.add(
                                new ConnectionConfigModel(connection.id, connection.name, connection.connection),
                            );
                            setAddConnectionDialogOpen(false);
                        }}
                        onClose={() => setAddConnectionDialogOpen(false)}
                    />
                )}
            </DialogBody>
        </Dialog>
    );
});
