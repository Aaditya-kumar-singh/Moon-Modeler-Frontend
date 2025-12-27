import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TableNodeData } from '@/types/diagram';
import { Key, Link, Table } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const MysqlTableNode = ({ data, selected }: NodeProps<TableNodeData>) => {
    return (
        <div className={cn(
            "min-w-[200px] bg-white rounded-md border-2 shadow-sm transition-all",
            selected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
        )}>
            {/* Header */}
            <div className="bg-gray-50 p-3 border-b border-gray-100 rounded-t-md flex items-center justify-between">
                <div className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <Table className="w-4 h-4 text-gray-400" />
                    {data.label}
                </div>
            </div>

            {/* Fields (formerly columns) */}
            <div className="p-2 flex flex-col gap-1">
                {data.fields && data.fields.map((col) => (
                    <div key={col.id} className="flex items-center justify-between text-xs p-1 hover:bg-blue-50 rounded group cursor-default transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-3 flex justify-center">
                                {col.isPrimaryKey ? (
                                    <Key className="w-3 h-3 text-yellow-500 fill-yellow-100" />
                                ) : col.isForeignKey ? (
                                    <Link className="w-3 h-3 text-blue-500" />
                                ) : null}
                            </div>
                            <span className={cn(
                                "truncate max-w-[120px]",
                                col.isPrimaryKey ? "font-semibold text-gray-900" : "text-gray-700"
                            )}>
                                {col.name}
                            </span>
                        </div>
                        <span className="text-gray-400 font-mono text-[10px] ml-2">
                            {col.type}
                            {col.isNullable && <span className="text-gray-300 ml-0.5">?</span>}
                        </span>
                    </div>
                ))}
                {(!data.fields || data.fields.length === 0) && (
                    <div className="text-xs text-gray-400 italic p-2 text-center">No fields</div>
                )}
            </div>

            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-blue-400 !w-3 !h-3 !-ml-1.5 hover:!bg-blue-600 transition-colors border-2 border-white"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-blue-400 !w-3 !h-3 !-mr-1.5 hover:!bg-blue-600 transition-colors border-2 border-white"
            />
        </div>
    );
};

export default memo(MysqlTableNode);
