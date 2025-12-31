import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TableNodeData } from '@/types/diagram';
import { Key, Link, Table, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCanvasStore } from '../stores/canvasStore';

const TableNode = ({ data, selected, id: nodeId }: NodeProps<TableNodeData>) => {
    const columns = data.columns || data.fields || [];
    const { metadata, addNodeNextTo } = useCanvasStore();
    const theme = metadata.theme || 'default';

    // Theme-based colors
    const getThemeStyles = () => {
        if (data.color) {
            return {
                border: selected ? 'border-gray-400' : 'border-gray-200',
                headerBg: data.color,
                ring: 'ring-gray-200',
                shadow: 'shadow-md'
            };
        }

        switch (theme) {
            case 'dark':
                return {
                    container: 'bg-slate-800 border-slate-700 text-slate-200',
                    headerBg: 'bg-slate-900',
                    border: selected ? 'border-blue-500' : 'border-slate-700',
                    text: 'text-slate-200',
                    subText: 'text-slate-400'
                };
            case 'ocean':
                return {
                    container: 'bg-white',
                    headerBg: 'bg-cyan-50',
                    border: selected ? 'border-cyan-500' : 'border-cyan-200'
                };
            case 'sunset':
                return {
                    container: 'bg-white',
                    headerBg: 'bg-orange-50',
                    border: selected ? 'border-orange-500' : 'border-orange-200'
                };
            default:
                return {
                    container: 'bg-white',
                    headerBg: 'bg-gray-50',
                    border: selected ? 'border-blue-500' : 'border-gray-200'
                };
        }
    };

    const styles = getThemeStyles();
    const isDark = theme === 'dark' && !data.color;

    return (
        <div className={cn(
            "min-w-[200px] rounded-md border-2 shadow-sm transition-all group",
            styles.container || 'bg-white',
            styles.border,
            selected ? "ring-2" : "",
            selected && theme === 'default' && "ring-blue-200",
            selected && theme === 'ocean' && "ring-cyan-200",
            selected && theme === 'sunset' && "ring-orange-200",
            selected && isDark && "ring-slate-600"
        )}>
            {/* Header */}
            <div className={cn(
                "p-3 border-b rounded-t-md flex items-center justify-between",
                isDark ? "border-slate-700" : "border-gray-100",
            )} style={{ backgroundColor: data.color || undefined, background: !data.color && !isDark ? undefined : styles.headerBg }}>
                <div className={cn("font-bold text-sm flex items-center gap-2", isDark ? "text-slate-200" : "text-gray-800")}>
                    <Table className="w-4 h-4 text-gray-400" />
                    {data.label}
                </div>
            </div>

            {/* Columns with Field-Level Handles */}
            <div className="p-2 flex flex-col gap-1">
                {columns.map((col) => (
                    <div
                        key={col.id}
                        className={cn(
                            "relative flex items-center justify-between text-xs p-1 rounded group cursor-default transition-colors",
                            isDark ? "hover:bg-blue-900/30" : "hover:bg-blue-50"
                        )}
                    >
                        {/* Left Handle - Target */}
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={`${nodeId}-${col.name}-target`}
                            className={cn(
                                "!absolute !left-0 !top-1/2 !-translate-y-1/2 !-translate-x-1/2",
                                "!bg-blue-500 !w-2 !h-2 !border-2 !border-white !rounded-full",
                                "!opacity-0 group-hover:!opacity-100",
                                "hover:!w-3 hover:!h-3 hover:!bg-blue-600",
                                "transition-all !cursor-crosshair"
                            )}
                            style={{ zIndex: 10 }}
                        />

                        <div className="flex items-center gap-2 flex-1">
                            <div className="w-3 flex justify-center">
                                {col.isPrimaryKey ? (
                                    <Key className="w-3 h-3 text-yellow-500 fill-yellow-100" />
                                ) : col.isForeignKey ? (
                                    <Link className="w-3 h-3 text-blue-500" />
                                ) : null}
                            </div>
                            <span className={cn(
                                "truncate max-w-[120px]",
                                col.isPrimaryKey
                                    ? (isDark ? "font-semibold text-white" : "font-semibold text-gray-900")
                                    : (isDark ? "text-slate-300" : "text-gray-700")
                            )}>
                                {col.name}
                            </span>
                        </div>

                        <span className={cn("font-mono text-[10px] ml-2", isDark ? "text-slate-400" : "text-gray-400")}>
                            {col.type}
                            {col.isNullable && <span className={cn("ml-0.5", isDark ? "text-slate-500" : "text-gray-300")}>?</span>}
                        </span>

                        {/* Right Handle - Source */}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`${nodeId}-${col.name}-source`}
                            className={cn(
                                "!absolute !right-0 !top-1/2 !-translate-y-1/2 !translate-x-1/2",
                                "!bg-blue-500 !w-2 !h-2 !border-2 !border-white !rounded-full",
                                "!opacity-0 group-hover:!opacity-100",
                                "hover:!w-3 hover:!h-3 hover:!bg-blue-600",
                                "transition-all !cursor-crosshair"
                            )}
                            style={{ zIndex: 10 }}
                        />
                    </div>
                ))}
                {columns.length === 0 && (
                    <div className="text-xs text-gray-400 italic p-2 text-center">No columns</div>
                )}
            </div>

            {/* Table-Level Connection Handles - Full 360 Connectivity (Loose Mode: Single Handle per side) */}
            {/* Top */}
            <Handle type="source" position={Position.Top} id={`${nodeId}-source-top`} className="!bg-blue-400 !w-3 !h-3 !-mt-1.5 hover:!bg-blue-600 border-2 border-white !left-1/2 transition-all" />

            {/* Right */}
            <Handle type="source" position={Position.Right} id={`${nodeId}-source-right`} className="!bg-blue-400 !w-3 !h-3 !-mr-1.5 hover:!bg-blue-600 border-2 border-white !top-1/2 transition-all" />

            {/* Bottom */}
            <Handle type="source" position={Position.Bottom} id={`${nodeId}-source-bottom`} className="!bg-blue-400 !w-3 !h-3 !-mb-1.5 hover:!bg-blue-600 border-2 border-white !left-1/2 transition-all" />

            {/* Left */}
            <Handle type="source" position={Position.Left} id={`${nodeId}-source-left`} className="!bg-blue-400 !w-3 !h-3 !-ml-1.5 hover:!bg-blue-600 border-2 border-white !top-1/2 transition-all" />

            {/* Legacy Fallback Handles */}
            <Handle type="target" position={Position.Left} id={`${nodeId}-table-target`} style={{ opacity: 0, pointerEvents: 'none' }} />
            <Handle type="source" position={Position.Right} id={`${nodeId}-table-source`} style={{ opacity: 0, pointerEvents: 'none' }} />

            {/* Quick Add Buttons */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ zIndex: 20 }}>
                <button
                    className="p-1 rounded-full bg-blue-500 text-white shadow-sm hover:scale-110 hover:bg-blue-600 transition-transform"
                    onClick={(e) => { e.stopPropagation(); addNodeNextTo(nodeId, 'top'); }}
                    title="Add table above"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ zIndex: 20 }}>
                <button
                    className="p-1 rounded-full bg-blue-500 text-white shadow-sm hover:scale-110 hover:bg-blue-600 transition-transform"
                    onClick={(e) => { e.stopPropagation(); addNodeNextTo(nodeId, 'bottom'); }}
                    title="Add table below"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="absolute top-1/2 -right-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ zIndex: 20 }}>
                <button
                    className="p-1 rounded-full bg-blue-500 text-white shadow-sm hover:scale-110 hover:bg-blue-600 transition-transform"
                    onClick={(e) => { e.stopPropagation(); addNodeNextTo(nodeId, 'right'); }}
                    title="Add table to right"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ zIndex: 20 }}>
                <button
                    className="p-1 rounded-full bg-blue-500 text-white shadow-sm hover:scale-110 hover:bg-blue-600 transition-transform"
                    onClick={(e) => { e.stopPropagation(); addNodeNextTo(nodeId, 'left'); }}
                    title="Add table to left"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default memo(TableNode);
