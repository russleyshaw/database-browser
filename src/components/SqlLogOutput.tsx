import { SQL_LOGGER, type SqlLog } from "@/models/SqlLogger";
import { Card, Dialog, DialogBody, H3, HTMLTable, Icon, IconSize } from "@blueprintjs/core";
import { format } from "date-fns";
import hljs from "highlight.js";
import { observer } from "mobx-react";
import { useMemo, useState } from "react";
import * as sqlFormat from "sql-formatter";

import "@/lib/highlight";
import { uniq } from "@/lib/utils";

interface LogDetailDialogProps {
    log: SqlLog;
    onClose: () => void;
}

const LogDetailDialog = observer(({ log, onClose }: LogDetailDialogProps) => {
    const sql = useMemo(
        () =>
            hljs.highlightAuto(
                sqlFormat.format(log.sql, {
                    tabWidth: 4,
                    useTabs: false,
                    language: "postgresql",
                }),
            ).value,
        [log.sql],
    );

    const resultKeys = useMemo(() => {
        if (!log.results) return [];

        return uniq(log.results.flatMap((r) => Object.keys(r)));
    }, [log.results]);
    return (
        <Dialog style={{ width: "80%", height: "80%" }} title="SQL Log" isOpen onClose={onClose}>
            <DialogBody>
                <div className="flex flex-col gap-2 p-2">
                    <div>Created At: {format(log.createdAt, "HH:mm:ss")}</div>
                    <Card className="overflow-auto">
                        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
                        <pre className="text-xs m-0" dangerouslySetInnerHTML={{ __html: sql }} />
                    </Card>

                    {log.params && (
                        <Card className="overflow-auto">
                            <H3>Params</H3>
                            <pre className="text-xs m-0">{JSON.stringify(log.params, null, 2)}</pre>
                        </Card>
                    )}

                    {log.results && (
                        <Card className="overflow-auto">
                            <H3>Results</H3>
                            <HTMLTable striped>
                                <thead>
                                    <tr>
                                        {resultKeys.map((key) => (
                                            <th key={key}>{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {log.results.map((row, rowIdx) => (
                                        <tr key={rowIdx}>
                                            {resultKeys.map((key) => (
                                                <td key={key}>{row[key] as any}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </HTMLTable>
                        </Card>
                    )}
                </div>
            </DialogBody>
        </Dialog>
    );
});

interface LogItemProps {
    log: SqlLog;
    onClick?: () => void;
}

const LogItem = observer(({ log, onClick }: LogItemProps) => {
    return (
        <div className="even:bg-gray-100/5 p-1 text-xs flex flex-row gap-2" onClick={onClick}>
            <span className="text-xs text-gray-500">{format(log.createdAt, "HH:mm:ss")}</span>

            {log.status === "idle" && <Icon icon="full-circle" intent="none" size={IconSize.STANDARD} />}
            {log.status === "loading" && <Icon icon="full-circle" intent="warning" size={IconSize.STANDARD} />}
            {log.status === "success" && <Icon icon="tick-circle" intent="success" size={IconSize.STANDARD} />}
            {log.status === "error" && <Icon icon="cross-circle" intent="danger" size={IconSize.STANDARD} />}

            <span className="font-mono whitespace-nowrap opacity-75">{log.sql}</span>
        </div>
    );
});

export const SqlLogOutput = observer(() => {
    const [selectedLog, setSelectedLog] = useState<SqlLog | null>(null);
    return (
        <>
            {selectedLog && <LogDetailDialog log={selectedLog} onClose={() => setSelectedLog(null)} />}
            <div className="h-40 overflow-y-auto flex flex-col-reverse">
                {SQL_LOGGER.logs.map((log, logIdx) => (
                    <LogItem log={log} key={logIdx} onClick={() => setSelectedLog(log)} />
                ))}
            </div>
        </>
    );
});
