import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import clsx from "clsx";

export type ColumnNode = Node<{ isPrimaryKey?: boolean; isUniqueKey?: boolean; type: string; label: string }, "column">;

export function ColumnNode({ data }: NodeProps<ColumnNode>) {
    const divCn = clsx("px-2 py-1 bg-black rounded-md flex flex-col", {
        "border-2 border-red-500": data.isPrimaryKey,
        "border-2 border-blue-500": data.isUniqueKey,
    });

    return (
        <>
            <div className={divCn}>
                <Handle type="source" position={Position.Right} />
                <Handle type="target" position={Position.Left} />
                <label>{data.label}</label>
                <span className="text-[10px] text-gray-500">{data.type}</span>
            </div>
        </>
    );
}
