import type { SqlRequestResult } from "@/lib/sql/core";
import { maybeGet, toMap, uniq } from "@/lib/utils";
import { HTMLTable, Tag } from "@blueprintjs/core";
import { format } from "date-fns";
import { observer } from "mobx-react";

export interface SqlRowTableProps {
    loading?: boolean;
    result?: SqlRequestResult;

    children?: React.ReactNode;
}

export const SqlRowTable = observer(({ result }: SqlRowTableProps) => {
    const data = result?.response.rows ?? [];

    const keys = uniq(data.flatMap((row) => Object.keys(row)));

    const colMap = toMap(
        result?.response.columns ?? [],
        (col) => col.name,
        (col) => col,
    );

    return (
        <div className="flex flex-col gap-2 text-xs">
            <div className="overflow-x-auto">
                <HTMLTable interactive compact striped className="overflow-x-auto">
                    <thead>
                        <tr className="overflow-x-auto">
                            {keys.map((key) => {
                                const colType = colMap.get(key)?.type;
                                return (
                                    <th className="!align-bottom" key={key}>
                                        <div>
                                            <div>{key.split("_").join(" ")}</div>
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
