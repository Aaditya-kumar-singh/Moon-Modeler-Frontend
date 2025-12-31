import { FC, useState, useRef, useCallback, useEffect } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    EdgeProps,
    getBezierPath,
    getStraightPath,
    getSmoothStepPath,
    useStore
} from 'reactflow';
import { EnhancedEdgeData } from '@/types/diagram';
import { useCanvasStore } from '../../stores/canvasStore';
import { cn } from '@/lib/utils/cn';

const FieldMappingEdge: FC<EdgeProps<EnhancedEdgeData>> = ({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    markerEnd,
    selected,
}) => {
    const fieldMappings = data?.fieldMappings || [];
    const showFields = data?.showFields ?? true;
    const showCardinality = data?.showCardinality ?? true;
    const { updateEdgeData, metadata, deleteEdge } = useCanvasStore(); // Get metadata for edge style
    const edgeStyle = metadata?.edgeStyle || 'step';

    // Get zoom level for correct drag calculation
    const zoom = useStore((s) => s.transform[2]);

    // Local drag state
    const [dragging, setDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const dragStartRef = useRef<{ x: number, y: number, initialLabelPos: { x: number, y: number } } | null>(null);

    // 1. Get the path center based on selected style
    let defaultLabelX: number, defaultLabelY: number;
    let path = '';

    // We only need the label coordinates here, the path string is used later if we don't force through the box
    // But since we DO force through the box (Source -> Box -> Target), the "Underlying" path logic is mainly for finding the initial "center".

    if (edgeStyle === 'bezier') {
        const [bezierPath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
        path = bezierPath;
        defaultLabelX = labelX; defaultLabelY = labelY;
    } else if (edgeStyle === 'straight') {
        const [straightPath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
        path = straightPath;
        defaultLabelX = labelX; defaultLabelY = labelY;
    } else {
        const [smoothPath, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 0 });
        path = smoothPath;
        defaultLabelX = labelX; defaultLabelY = labelY;
    }

    // 2. Calculate the final label position
    // If no custom position, it defaults to the center.
    // If dragged, it moves from there.
    const storedOffsetX = data?.labelPosition?.x || 0;
    const storedOffsetY = data?.labelPosition?.y || 0;

    const labelX = defaultLabelX + storedOffsetX + dragOffset.x;
    const labelY = defaultLabelY + storedOffsetY + dragOffset.y;

    // 3. Construct the actual path
    let edgePath = '';

    const isCustomPosition = storedOffsetX !== 0 || storedOffsetY !== 0;

    if (!isCustomPosition) {
        // Use the native path if the label hasn't been moved.
        // This ensures nice Bezier/Step curves when in default state.
        edgePath = path;
    } else {
        // If label is moved, use straight lines (Polyline) to ensure connection.
        // M Source -> Label -> Target
        edgePath = `M ${sourceX} ${sourceY} L ${labelX} ${labelY} L ${targetX} ${targetY}`;
    }

    const defaultStroke = selected ? '#3b82f6' : (data?.style?.stroke || '#999');
    const defaultStrokeWidth = selected ? 3 : (data?.style?.strokeWidth || 2);
    const isAnimated = data?.style?.animated || false;

    // Drag Handlers
    const isDraggingRef = useRef(false);

    const onMouseDown = useCallback((event: React.MouseEvent) => {
        event.stopPropagation();
        event.preventDefault();

        const startX = event.clientX;
        const startY = event.clientY;
        isDraggingRef.current = false;

        // When drag starts, we are at the current stored offset
        const initialOffsetX = data?.labelPosition?.x || 0;
        const initialOffsetY = data?.labelPosition?.y || 0;

        setDragging(true);

        const handleMouseMove = (e: MouseEvent) => {
            const deltaX = (e.clientX - startX) / zoom;
            const deltaY = (e.clientY - startY) / zoom;

            // If moved more than small threshold, it's a drag
            if (Math.abs(e.clientX - startX) > 2 || Math.abs(e.clientY - startY) > 2) {
                isDraggingRef.current = true;
            }

            setDragOffset({ x: deltaX, y: deltaY });
        };

        const handleMouseUp = (e: MouseEvent) => {
            // Calculate final total offset from the default center
            const deltaX = (e.clientX - startX) / zoom;
            const deltaY = (e.clientY - startY) / zoom;

            const finalOffsetX = initialOffsetX + deltaX;
            const finalOffsetY = initialOffsetY + deltaY;

            // Commit the offset to the store
            updateEdgeData(id, {
                labelPosition: { x: finalOffsetX, y: finalOffsetY }
            });

            // Reset local drag state
            setDragging(false);
            setDragOffset({ x: 0, y: 0 });

            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);

            // Important: We need to consume the click if we dragged
            if (isDraggingRef.current) {
                e.stopPropagation();
                e.preventDefault();
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [id, data?.labelPosition, zoom, updateEdgeData]);

    // Prevent default click propagation on the label itself if we just dragged
    const onLabelClick = useCallback((e: React.MouseEvent) => {
        if (isDraggingRef.current) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, []);

    // Theme Logic for Edge Label
    const getThemeStyles = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'dark':
                return {
                    box: 'bg-slate-800 border-slate-600 shadow-md',
                    header: 'bg-slate-900 border-slate-700 text-slate-200',
                    text: 'text-slate-300',
                    row: 'bg-slate-800 text-slate-300',
                    border: 'border-slate-700',
                    footer: 'bg-slate-900 border-slate-700 text-slate-500',
                    typeTag: 'bg-slate-900 border-slate-700 text-slate-300'
                };
            case 'ocean':
                return {
                    box: 'bg-white border-cyan-200 shadow-md',
                    header: 'bg-cyan-50 border-cyan-100 text-cyan-900',
                    text: 'text-cyan-900',
                    row: 'bg-cyan-50/30 text-cyan-900',
                    border: 'border-cyan-100',
                    footer: 'bg-cyan-50 border-cyan-100 text-cyan-600',
                    typeTag: 'bg-white border-cyan-200 text-cyan-700'
                };
            case 'sunset':
                return {
                    box: 'bg-white border-orange-200 shadow-md',
                    header: 'bg-orange-50 border-orange-100 text-orange-900',
                    text: 'text-orange-900',
                    row: 'bg-orange-50/30 text-orange-900',
                    border: 'border-orange-100',
                    footer: 'bg-orange-50 border-orange-100 text-orange-600',
                    typeTag: 'bg-white border-orange-200 text-orange-700'
                };
            default:
                return {
                    box: 'bg-white border-gray-300 shadow-md',
                    header: 'bg-gray-50 border-gray-200 text-gray-700',
                    text: 'text-gray-700',
                    row: 'bg-gray-50 text-gray-700',
                    border: 'border-gray-200',
                    footer: 'bg-gray-50 border-gray-200 text-gray-500',
                    typeTag: 'bg-white border-gray-300 text-gray-600'
                };
        }
    };

    const styles = getThemeStyles();


    // Styling for the label container
    const labelStyle = {
        position: 'absolute' as const,
        // Use the labelX/Y from the path generation which now respects our centerX/Y
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        pointerEvents: 'all' as const,
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: 100
    };

    if (!showFields || fieldMappings.length === 0) {
        return (
            <>
                <BaseEdge
                    id={id}
                    path={edgePath}
                    markerEnd={markerEnd}
                    style={{
                        stroke: defaultStroke,
                        strokeWidth: defaultStrokeWidth,
                        strokeDasharray: isAnimated ? '5,5' : undefined,
                    }}
                />
                {showCardinality && data?.relationshipType && (
                    <EdgeLabelRenderer>
                        <div
                            style={labelStyle}
                            className="nodrag nopan"
                            onMouseDown={onMouseDown}
                            onClick={onLabelClick}
                        >
                            <div className={cn(
                                "px-2 py-0.5 rounded border text-xs font-mono shadow-sm flex items-center gap-2 transition-shadow",
                                dragging ? "shadow-lg ring-2 ring-blue-400/50" : "",
                                styles.typeTag
                            )}>
                                <span>
                                    {data.relationshipType === 'one-to-one' && '1:1'}
                                    {data.relationshipType === 'one-to-many' && '1:N'}
                                    {data.relationshipType === 'many-to-many' && 'N:M'}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteEdge(id);
                                    }}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                    onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking delete
                                    title="Delete Relationship"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    </EdgeLabelRenderer>
                )}
            </>
        );
    }

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    stroke: defaultStroke,
                    strokeWidth: defaultStrokeWidth,
                    opacity: 0.3,
                }}
            />

            <EdgeLabelRenderer>
                <div
                    style={labelStyle}
                    className="nodrag nopan"
                    onMouseDown={onMouseDown}
                    onClick={onLabelClick}
                >
                    <div className={cn(
                        "rounded border shadow-lg max-w-xs transition-shadow overflow-hidden",
                        dragging ? "shadow-xl ring-2 ring-blue-400/50" : "",
                        styles.box
                    )}>
                        <div className={cn("px-2 py-1 border-b text-xs font-semibold flex items-center justify-between cursor-grab active:cursor-grabbing", styles.header)}>
                            <span>{data?.relationshipName || 'Field Relationship'}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteEdge(id);
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors text-base"
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Delete Relationship"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-1.5 space-y-1">
                            {fieldMappings.map((mapping, index) => (
                                <div
                                    key={index}
                                    className={cn("flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded", styles.row)}
                                    style={{
                                        borderLeft: `3px solid ${mapping.style?.stroke || defaultStroke}`,
                                    }}
                                >
                                    <span className="text-blue-500 font-medium truncate max-w-[80px]" title={mapping.sourceField}>
                                        {mapping.sourceField}
                                    </span>
                                    <span className="opacity-50 text-[10px]">
                                        {mapping.relationshipType === '1:1' && '→'}
                                        {mapping.relationshipType === '1:N' && '→□'}
                                        {mapping.relationshipType === 'N:M' && '⇄'}
                                    </span>
                                    <span className="text-emerald-500 font-medium truncate max-w-[80px]" title={mapping.targetField}>
                                        {mapping.targetField}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {data?.constraints && (
                            <div className={cn("px-2 py-1 border-t text-[10px]", styles.footer)}>
                                {data.constraints.onDelete && (
                                    <span>ON DELETE: {data.constraints.onDelete}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
};

export default FieldMappingEdge;
