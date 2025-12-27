import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TableNodeData } from '@/types/diagram';
import { FileText, Braces } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const MongoCollectionNode = ({ data, selected }: NodeProps<TableNodeData>) => {
    return (
        <div className={cn(
            "min-w-[200px] bg-green-50 rounded-md border-2 shadow-sm transition-all",
            selected ? "border-green-500 ring-2 ring-green-200" : "border-green-200"
        )}>
            {/* Header */}
            <div className="bg-green-100 p-3 border-b border-green-200 rounded-t-md flex items-center justify-between">
                <div className="font-bold text-sm text-green-900 flex items-center gap-2">
                    <Braces className="w-4 h-4 text-green-700" />
                    {data.label}
                </div>
            </div>

            {/* Fields */}
            <div className="p-2 flex flex-col gap-1">
                {data.fields && data.fields.map((col) => (
                    <div key={col.id} className="flex items-center justify-between text-xs p-1 hover:bg-green-100 rounded group cursor-default transition-colors">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "truncate max-w-[120px] font-mono",
                                col.name === '_id' ? "font-bold text-green-800" : "text-gray-700"
                            )}>
                                {col.name}
                            </span>
                        </div>
                        <span className="text-gray-500 text-[10px] ml-2">
                            {col.type}
                        </span>
                    </div>
                ))}
                {(!data.fields || data.fields.length === 0) && (
                    <div className="text-xs text-green-600 italic p-2 text-center">No fields</div>
                )}
            </div>

            {/* Connection Handles - Minimalist for References */}
            <Handle
                type="target"
                position={Position.Left}
                className="!bg-green-400 !w-3 !h-3 !-ml-1.5 hover:!bg-green-600 transition-colors border-2 border-white"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!bg-green-400 !w-3 !h-3 !-mr-1.5 hover:!bg-green-600 transition-colors border-2 border-white"
            />
        </div>
    );
};

export default memo(MongoCollectionNode);
