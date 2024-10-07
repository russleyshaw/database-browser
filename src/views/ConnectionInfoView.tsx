import type { ConnectionModel } from "@/models/connection";
import { EditableText, H3, Label } from "@blueprintjs/core";
import { observer } from "mobx-react";

interface ConnectionInfoViewProps {
    connection: ConnectionModel;
}

export const ConnectionInfoView = observer(({ connection }: ConnectionInfoViewProps) => {
    return (
        <div className="flex flex-col gap-2 p-2">
            <H3>
                <Label>Name</Label>
                <EditableText
                    value={connection.config.name}
                    onChange={(name) => {
                        connection.config.name = name;
                    }}
                />
            </H3>
        </div>
    );
});
