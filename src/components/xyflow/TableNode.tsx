import type { ConnectionModel } from "@/models/connection";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import { observer } from "mobx-react";

export type TableNode = Node<{ table: string; schema: string; connection: ConnectionModel }, "Table">;

const COLUMN_HEIGHT = 10;
const COLUMN_HANDLE_OFFSET = 12;

export const TableNode = observer(({ data }: NodeProps<TableNode>) => {
    const columns = data.connection.columns.filter((c) => c.table === data.table && c.schema === data.schema);

    return (
        <>
            <div className="relative px-2 py-1 bg-black rounded-md border-2 border-green-500 flex items-center gap-1">
                {columns.map((c, cIdx) => (
                    <>
                        <Handle
                            id={`${data.schema}.${data.table}.${c.name}`}
                            key={c.name}
                            style={{ top: `${COLUMN_HEIGHT * cIdx + COLUMN_HANDLE_OFFSET}px` }}
                            type="source"
                            position={Position.Right}
                        />
                        <Handle
                            id={`${data.schema}.${data.table}.${c.name}`}
                            key={c.name}
                            style={{ top: `${COLUMN_HEIGHT * cIdx + COLUMN_HANDLE_OFFSET}px` }}
                            type="target"
                            position={Position.Right}
                        />
                    </>
                ))}

                <div className="flex flex-col gap-0">
                    <span className="text-sm text-gray-500">{data.schema}</span>
                    <span className="text-sm">{data.table}</span>
                </div>
                <div>
                    {columns.map((column) => (
                        <tr key={column.name}>
                            <td style={{ height: `${COLUMN_HEIGHT}px` }} className="flex flex-col">
                                <span style={{ height: `${COLUMN_HEIGHT}px` }} className="!text-[10px]">
                                    {column.name}
                                </span>
                            </td>
                        </tr>
                    ))}
                </div>
            </div>
        </>
    );
});
