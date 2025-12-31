import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { TableNodeData } from '@/types/diagram';
import { Braces, Plus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCanvasStore } from '../stores/canvasStore';

const MongoCollectionNode = ({ data, selected, id: nodeId }: NodeProps<TableNodeData>) => {
    const fields = data.fields || [];
    const { metadata, addNodeNextTo } = useCanvasStore();
    const theme = metadata.theme || 'default';

    // Theme-based colors
    const getThemeStyles = () => {
        if (data.color) {
            // Custom color override
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
                    border: selected ? 'border-emerald-500' : 'border-slate-700',
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
                // Default Green for Mongo
                return {
                    container: 'bg-white',
                    headerBg: 'bg-emerald-50/50',
                    border: selected ? 'border-emerald-500' : 'border-gray-200'
                };
        }
    };

    const styles = getThemeStyles();
    const isDark = theme === 'dark' && !data.color;

    return (
        <div className={cn(
            "min-w-[220px] rounded-xl border transition-all duration-200 group font-sans",
            styles.container || 'bg-white',
            styles.border,
            selected ? "shadow-xl ring-2" : "shadow-md hover:shadow-lg",
            selected && theme === 'default' && "ring-emerald-100",
            selected && theme === 'ocean' && "ring-cyan-100",
            selected && theme === 'sunset' && "ring-orange-100",
            selected && isDark && "ring-slate-600"
        )}>
            {/* Header */}
            <div className={cn(
                "p-3 rounded-t-xl flex items-center justify-between border-b",
                isDark ? "border-slate-700" : "border-gray-100",
                selected && !data.color && !isDark ? "bg-gradient-to-r from-emerald-50 to-white" : "",
            )} style={{ backgroundColor: data.color || undefined, background: !data.color && !isDark ? undefined : styles.headerBg }}>
                <div className={cn("font-bold text-sm flex items-center gap-2", isDark ? "text-green-400" : "text-green-900")}>
                    <Braces className={cn("w-4 h-4", isDark ? "text-green-400" : "text-green-700")} />
                    {data.label}
                </div>
            </div>

            {/* Fields with Field-Level Handles */}
            <div className="p-2 flex flex-col gap-1">
                {fields.map((field) => (
                    <div
                        key={field.id}
                        className={cn(
                            "relative flex items-center justify-between text-xs p-1 rounded group cursor-default transition-colors",
                            isDark ? "hover:bg-green-900/30" : "hover:bg-green-100"
                        )}
                    >
                        {/* Left Handle - Target */}
                        <Handle
                            type="target"
                            position={Position.Left}
                            id={`${nodeId}-${field.name}-target`}
                            className={cn(
                                "!absolute !left-0 !top-1/2 !-translate-y-1/2 !-translate-x-1/2",
                                "!bg-green-600 !w-2 !h-2 !border-2 !border-white !rounded-full",
                                "!opacity-0 group-hover:!opacity-100",
                                "hover:!w-3 hover:!h-3 hover:!bg-green-700",
                                "transition-all !cursor-crosshair"
                            )}
                            style={{ zIndex: 10 }}
                        />

                        <div className="flex items-center gap-2 flex-1">
                            <span className={cn(
                                "truncate max-w-[120px] font-mono",
                                field.name === '_id'
                                    ? (isDark ? "font-bold text-green-400" : "font-bold text-green-800")
                                    : (isDark ? "text-slate-300" : "text-gray-700")
                            )}>
                                {field.name}
                            </span>
                        </div>

                        <span className={cn("text-[10px] ml-2", isDark ? "text-slate-400" : "text-gray-500")}>
                            {field.type}
                        </span>

                        {/* Right Handle - Source */}
                        <Handle
                            type="source"
                            position={Position.Right}
                            id={`${nodeId}-${field.name}-source`}
                            className={cn(
                                "!absolute !right-0 !top-1/2 !-translate-y-1/2 !translate-x-1/2",
                                "!bg-green-600 !w-2 !h-2 !border-2 !border-white !rounded-full",
                                "!opacity-0 group-hover:!opacity-100",
                                "hover:!w-3 hover:!h-3 hover:!bg-green-700",
                                "transition-all !cursor-crosshair"
                            )}
                            style={{ zIndex: 10 }}
                        />
                    </div>
                ))}
                {fields.length === 0 && (
                    <div className={cn("text-xs italic p-2 text-center", isDark ? "text-green-400" : "text-green-600")}>No fields</div>
                )}
            </div>

            {/* Collection-Level Connection Handles - Full 360 Connectivity (Loose Mode) */}
            {/* Top */}
            <Handle type="source" position={Position.Top} id={`${nodeId}-source-top`} className="!bg-green-400 !w-3 !h-3 !-mt-1.5 hover:!bg-green-600 border-2 border-white !left-1/2 transition-all" />

            {/* Right */}
            <Handle type="source" position={Position.Right} id={`${nodeId}-source-right`} className="!bg-green-400 !w-3 !h-3 !-mr-1.5 hover:!bg-green-600 border-2 border-white !top-6 transition-all" />

            {/* Bottom */}
            <Handle type="source" position={Position.Bottom} id={`${nodeId}-source-bottom`} className="!bg-green-400 !w-3 !h-3 !-mb-1.5 hover:!bg-green-600 border-2 border-white !left-1/2 transition-all" />

            {/* Left */}
            <Handle type="source" position={Position.Left} id={`${nodeId}-source-left`} className="!bg-green-400 !w-3 !h-3 !-ml-1.5 hover:!bg-green-600 border-2 border-white !top-6 transition-all" />

            {/* Legacy Fallback Handles */}
            <Handle type="target" position={Position.Left} id={`${nodeId}-collection-target`} style={{ opacity: 0, pointerEvents: 'none' }} />
            <Handle type="source" position={Position.Right} id={`${nodeId}-collection-source`} style={{ opacity: 0, pointerEvents: 'none' }} />

            {/* Quick Add Buttons */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ zIndex: 20 }}>
                <button
                    className="p-1 rounded-full bg-green-500 text-white shadow-sm hover:scale-110 hover:bg-green-600 transition-transform"
                    onClick={(e) => { e.stopPropagation(); addNodeNextTo(nodeId, 'top'); }}
                    title="Add collection above"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ zIndex: 20 }}>
                <button
                    className="p-1 rounded-full bg-green-500 text-white shadow-sm hover:scale-110 hover:bg-green-600 transition-transform"
                    onClick={(e) => { e.stopPropagation(); addNodeNextTo(nodeId, 'bottom'); }}
                    title="Add collection below"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="absolute top-1/2 -right-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ zIndex: 20 }}>
                <button
                    className="p-1 rounded-full bg-green-500 text-white shadow-sm hover:scale-110 hover:bg-green-600 transition-transform"
                    onClick={(e) => { e.stopPropagation(); addNodeNextTo(nodeId, 'right'); }}
                    title="Add collection to right"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{ zIndex: 20 }}>
                <button
                    className="p-1 rounded-full bg-green-500 text-white shadow-sm hover:scale-110 hover:bg-green-600 transition-transform"
                    onClick={(e) => { e.stopPropagation(); addNodeNextTo(nodeId, 'left'); }}
                    title="Add collection to left"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default memo(MongoCollectionNode);
