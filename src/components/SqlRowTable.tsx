import { maybeGet, toMap, uniq } from "@/lib/utils";
import type { TableData } from "@/models/connection";
import type {} from "@/models/connection-config";
import { H3, HTMLTable, Icon, Tag, Tooltip } from "@blueprintjs/core";
import { format } from "date-fns";
import { observer } from "mobx-react";
import { format as sqlFormat } from "sql-formatter";

export interface SqlRowTableProps {
    title?: string;

    loading?: boolean;
    tableData?: TableData;

    children?: React.ReactNode;
}

export const SqlRowTable = observer(({ title, tableData, children }: SqlRowTableProps) => {
    const sql = sqlFormat(tableData?.sql ?? "");
    const data = tableData?.data ?? [];
    const colInfo = tableData?.colInfo ?? {};

    const keys = uniq(data.flatMap((row) => Object.keys(row)));

    const colMap = toMap(
        tableData?.query.columns ?? [],
        (col) => col.name,
        (col) => col,
    );

    return (
        <div className="flex flex-col gap-2 text-xs">
            <div className="flex flex-row items-center gap-2">
                {title && <H3>{title}</H3>}

                {sql && (
                    <Tooltip content={<pre className="text-xs bp5-monospace-text">{sql}</pre>}>
                        <Icon icon="info-sign" />
                    </Tooltip>
                )}
                {children}
            </div>
            <div className="overflow-x-auto">
                <HTMLTable interactive compact striped className="overflow-x-auto">
                    <thead>
                        <tr className="overflow-x-auto">
                            {keys.map((key) => {
                                const myColInfo = colInfo[key];
                                const colType = colMap.get(key)?.col_type;
                                return (
                                    <th className="!align-bottom" key={key}>
                                        <div>
                                            <div>{key.split("_").join(" ")}</div>
                                            {myColInfo?.isForeign && <Tag minimal>FK</Tag>}
                                        </div>
                                        {colType && <span className="text-[10px] text-gray-500">{colType}</span>}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="overflow-x-auto">
                        {data.map((row, rowIdx) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                            <tr key={rowIdx}>
                                {keys.map((key) => (
                                    <td key={key}>
                                        <SqlCell value={maybeGet(row, key)} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </HTMLTable>
            </div>
        </div>
    );
});

export interface SqlCellProps {
    value: unknown;
    colType?: string;
}

function SqlCell(props: SqlCellProps) {
    const { value, colType } = props;

    if (typeof value === "string") {
        return <>{value}</>;
    }

    if (typeof value === "number") {
        return <>{value}</>;
    }

    if (value instanceof Date) {
        let text: string;
        if (colType === "date") {
            text = format(value, "P");
        } else {
            text = format(value, "Pp");
        }

        return (
            <Tag minimal htmlTitle={value.toISOString()}>
                {text}
            </Tag>
        );
    }

    if (value === null) {
        return <Tag minimal>null</Tag>;
    }

    return <span className="text-red-800">Unknown</span>;
}
