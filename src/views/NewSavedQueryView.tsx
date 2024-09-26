import type { ConnectionModel } from "@/models/connection";
import { Button, EditableText, H1, HTMLTable, Intent } from "@blueprintjs/core";
import { Editor } from "@monaco-editor/react";
import { observer, useLocalObservable } from "mobx-react";
import { useState } from "react";
import { formatDialect, postgresql } from "sql-formatter";

import { FaBroom } from "react-icons/fa";
export interface NewSavedQueryViewProps {
    connection: ConnectionModel;
}

export const NewSavedQueryView = observer((props: NewSavedQueryViewProps) => {
    const [name, setName] = useState("");
    const [query, setQuery] = useState("SELECT * FROM table WHERE id = $::value");

    const [newParamKey, setNewParamKey] = useState("");
    const [newParamValue, setNewParamValue] = useState("");

    const params = useLocalObservable(() => new Map<string, string>());

    return (
        <div className="flex flex-col gap-2 p-2">
            <H1>
                <EditableText value={name} onChange={setName} placeholder="Query Name" />
            </H1>

            <HTMLTable compact>
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.from(params.entries()).map(([key, value]) => (
                        <tr key={key}>
                            <td>{key}</td>
                            <td>
                                <EditableText value={value} onChange={(v) => params.set(key, v)} />
                            </td>
                            <td>
                                <Button
                                    minimal
                                    icon="trash"
                                    onClick={() => params.delete(key)}
                                    intent={Intent.DANGER}
                                />
                            </td>
                        </tr>
                    ))}

                    <tr>
                        <td>
                            <EditableText value={newParamKey} onChange={setNewParamKey} placeholder="Parameter" />
                        </td>
                        <td>
                            <EditableText value={newParamValue} onChange={setNewParamValue} placeholder="Value" />
                        </td>
                        <td>
                            <Button
                                icon="plus"
                                minimal
                                intent={Intent.SUCCESS}
                                onClick={() => {
                                    if (newParamKey && newParamValue) {
                                        params.set(newParamKey, newParamValue);
                                        setNewParamKey("");
                                        setNewParamValue("");
                                    }
                                }}
                            />
                        </td>
                    </tr>
                </tbody>
            </HTMLTable>

            <div className="flex flex-row gap-2">
                <Button onClick={() => setQuery(formatDialect(query, { dialect: postgresql, tabWidth: 4 }))}>
                    <FaBroom />
                </Button>
            </div>
            <Editor
                height="300px"
                language="sql"
                theme="vs-dark"
                value={query}
                onChange={(v) => setQuery(v ?? "")}
                options={{ minimap: { enabled: false } }}
            />

            <div className="flex flex-row gap-2">
                <Button intent={Intent.DANGER} icon="reset" text="Reset" onClick={() => setName("")} />
                <Button intent={Intent.PRIMARY} icon="floppy-disk" text="Save" onClick={() => {}} />
            </div>
        </div>
    );
});
