import { Icon } from "@blueprintjs/core";
import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";

export type TableNode = Node<{ label: string }, "Table">;

export function TableNode({ data }: NodeProps<TableNode>) {
    return (
        <>
            <div className="px-2 py-1 bg-black rounded-md border-2 border-green-500 flex items-center gap-1">
                <Icon icon="th" />
                <Handle type="source" position={Position.Right} />
                <label>{data.label}</label>
            </div>
        </>
    );
}
