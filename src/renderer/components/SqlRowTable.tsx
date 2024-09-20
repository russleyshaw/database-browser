import { Card, H3, HTMLTable, Icon, Tooltip } from "@blueprintjs/core";
import { maybeGet, uniq } from "@common/utils";
import { ErrorBoundary } from "react-error-boundary";

export interface SqlRowTableProps {
    title?: string;
    loading?: boolean;
    rows: Record<string, unknown>[];
    sql?: string;
}

export function SqlRowTable({ title, rows, sql }: SqlRowTableProps) {
    const keys = uniq(rows.flatMap((row) => Object.keys(row)));

    return (
        <Card elevation={1}>
            <div className="flex flex-row items-center gap-2">
                {title && <H3>{title}</H3>}

                {sql && (
                    <Tooltip content={<pre className="text-xs bp5-monospace-text">{sql}</pre>}>
                        <Icon icon="info-sign" />
                    </Tooltip>
                )}
            </div>
            <HTMLTable interactive>
                <thead>
                    <tr>
                        {keys.map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIdx) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        <tr key={rowIdx}>
                            {keys?.map((key) => (
                                <td key={key}>
                                    <ErrorBoundary
                                        fallback={<div className="text-red-500">Error</div>}
                                        onError={(error) => {
                                            console.error(error);
                                        }}
                                    >
                                        {maybeGet(row, key).toString()}
                                    </ErrorBoundary>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </HTMLTable>
        </Card>
    );
}
