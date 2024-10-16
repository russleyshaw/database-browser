import { Button, ButtonGroup, Dialog, DialogBody, HTMLTable, Icon, Tooltip } from "@blueprintjs/core";

import { checkConnection } from "@/lib/sql/pgsql";
import { APP_MODEL } from "@/models/app";
import { ConnectionModel } from "@/models/connection";
import { useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react";
import { useState } from "react";
import ConfirmIconButton from "./ConfirmIconButton";
import { ConnectionDialog } from "./ConnectionDialog";
import TrButton from "./TrButton";

interface ConnectionRowProps {
    connection: ConnectionModel;
    removeConnection: () => void;
    editConnection: () => void;
    onSelectConnection: (connection: ConnectionModel) => void;
}

const ConnectionRow = observer(
    ({ connection, removeConnection, editConnection, onSelectConnection }: ConnectionRowProps) => {
        const url = `${connection.config.connection.host}:${connection.config.connection.port}`;

        const connectionStatusQuery = useQuery({
            queryKey: ["connectionStatus", connection.id],
            retry: 3,
            retryDelay: 1000,
            refetchInterval: 10000,
            queryFn: async () => {
                await checkConnection({ connection: connection.config.connection });
                return "ok";
            },
        });
        return (
            <TrButton className="align-middle" onClick={() => onSelectConnection(connection)}>
                <td>{connection.name}</td>
                <td> {url}</td>
                <td>{connection.config.connection.user}</td>
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
    onSelectConnection: (connection: ConnectionModel) => void;
}

export const ManageConnectionsDialog = observer(({ onClose, onSelectConnection }: ManageConnectionsDialogProps) => {
    const [addConnectionDialogOpen, setAddConnectionDialogOpen] = useState(false);

    const [editingConnection, setEditingConnection] = useState<ConnectionModel | null>(null);

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
                        {APP_MODEL.connections.map((connection) => (
                            <ConnectionRow
                                key={connection.name}
                                connection={connection}
                                removeConnection={() => {
                                    APP_MODEL.removeConnection(connection.id);
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
                        connection={editingConnection.config}
                        onSubmit={() => {
                            setEditingConnection(null);
                        }}
                        onClose={() => setEditingConnection(null)}
                    />
                )}

                {addConnectionDialogOpen && (
                    <ConnectionDialog
                        onSubmit={(connection) => {
                            APP_MODEL.addConnection(new ConnectionModel(connection));
                            setAddConnectionDialogOpen(false);
                        }}
                        onClose={() => setAddConnectionDialogOpen(false)}
                    />
                )}
            </DialogBody>
        </Dialog>
    );
});
