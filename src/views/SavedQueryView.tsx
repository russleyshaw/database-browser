import type { ConnectionModel } from "@/models/connection";
import { Button, EditableText, H1, HTMLTable, Intent } from "@blueprintjs/core";
import { Editor } from "@monaco-editor/react";
import { observer, useLocalObservable } from "mobx-react";
import { useEffect, useMemo, useState } from "react";
import { formatDialect, postgresql } from "sql-formatter";

import type { NewQuery, Query } from "@/lib/connection-config-file";
import { useNavigate } from "@tanstack/react-router";
import { FaBroom } from "react-icons/fa";

export interface SavedQueryViewProps {
    connection: ConnectionModel;

    queryId?: string;

    onSave: (query: Query | NewQuery) => Query;
}

export const SavedQueryEditorView = observer((props: SavedQueryViewProps) => {
    const { connection, queryId, onSave } = props;

    const savedQuery = useMemo(() => {
        return (connection.config.queries ?? []).find((q) => q.id === queryId);
    }, [connection, queryId]);

    const [name, setName] = useState(savedQuery?.name ?? "");
    const [query, setQuery] = useState(savedQuery?.query ?? "SELECT * FROM table WHERE id = $::value");

    const [newParamKey, setNewParamKey] = useState("");
    const [newParamValue, setNewParamValue] = useState("");

    const navigate = useNavigate();

    const params = useLocalObservable(() => {
        const params = new Map<string, string>();

        for (const param of savedQuery?.params ?? []) {
            params.set(param.name, param.value);
        }

        return params;
    });

    function reset() {
        setName(savedQuery?.name ?? "");
        setQuery(savedQuery?.query ?? "");
        setNewParamKey("");
        setNewParamValue("");
        for (const param of savedQuery?.params ?? []) {
            params.set(param.name, param.value);
        }
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        reset();
    }, [savedQuery]);

    const currQuery: NewQuery | Query = {
        id: savedQuery?.id,
        name,
        description: "",
        order: 0,
        query,
        params: Array.from(params.entries()).map(([name, value]) => ({
            name,
            order: 0,
            value,
            type: "string",
        })),
        tagIds: [],
    };

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
                <Button
                    intent={Intent.PRIMARY}
                    icon="floppy-disk"
                    text={savedQuery ? "Update" : "Create"}
                    onClick={() => {
                        const newQuery = onSave(currQuery);

                        // if not defined, we are creating a new query, navigate to it.
                        if (queryId == null) {
                            navigate({
                                to: "/connection/$connectionId/query/$queryId",
                                params: { connectionId: connection.id, queryId: newQuery.id },
                            });
                        }
                    }}
                />
            </div>
        </div>
    );
});
