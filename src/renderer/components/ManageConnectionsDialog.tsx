import { Button, ButtonGroup, Dialog, DialogBody, HTMLTable, Icon, Tag } from "@blueprintjs/core";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ConfirmIconButton from "../components/ConfirmIconButton";
import { ConnectionDialog } from "../components/ConnectionDialog";
import { type DatabaseConnectionModel, databaseConnectionModelStore } from "../models/connection";
import TrButton from "./TrButton";

interface ConnectionRowProps {
    connection: DatabaseConnectionModel;
    removeConnection: () => void;
    editConnection: () => void;
    onSelectConnection: (connection: DatabaseConnectionModel) => void;
}

function ConnectionRow({ connection, removeConnection, editConnection, onSelectConnection }: ConnectionRowProps) {
    const url = `${connection.connection.host}:${connection.connection.port}`;

    const connectionStatusQuery = useQuery({
        queryKey: ["connectionStatus", connection.id],
        retry: 3,
        retryDelay: 1000,
        refetchInterval: 10000,
        queryFn: async () => {
            await connection.connect();
            return "ok";
        },
    });
    return (
        <TrButton onClick={() => onSelectConnection(connection)}>
            <td>{connection.name}</td>
            <td> {url}</td>
            <td>{connection.connection.user}</td>
            <td>
                {connectionStatusQuery.isLoading && <Icon icon="circle" intent="warning" />}
                {connectionStatusQuery.isSuccess && <Icon icon="tick-circle" intent="success" />}
                {connectionStatusQuery.isError && <Icon icon="cross-circle" intent="danger" />}
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
}

interface ManageConnectionsDialogProps {
    onClose: () => void;
    onSelectConnection: (connection: DatabaseConnectionModel) => void;
}

export default function ManageConnectionsDialog({ onClose, onSelectConnection }: ManageConnectionsDialogProps) {
    const [addConnectionDialogOpen, setAddConnectionDialogOpen] = useState(false);

    const [editingConnection, setEditingConnection] = useState<DatabaseConnectionModel | null>(null);

    return (
        <Dialog isOpen onClose={onClose} title="Manage Connections">
            <DialogBody>
                <Button onClick={() => setAddConnectionDialogOpen(true)}>Add Connection</Button>

                <HTMLTable striped interactive>
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
                        {databaseConnectionModelStore.connections.map((connection, connectionIdx) => (
                            <ConnectionRow
                                key={connection.name}
                                connection={connection}
                                removeConnection={() => {
                                    databaseConnectionModelStore.removeConnection(connection.id);
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
                        onSubmit={(updatedConnection) => {
                            setEditingConnection(null);
                        }}
                        onClose={() => setEditingConnection(null)}
                    />
                )}

                {addConnectionDialogOpen && (
                    <ConnectionDialog
                        onSubmit={(connection) => {
                            setAddConnectionDialogOpen(false);
                        }}
                        onClose={() => setAddConnectionDialogOpen(false)}
                    />
                )}
            </DialogBody>
        </Dialog>
    );
}
