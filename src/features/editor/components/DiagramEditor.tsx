import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
    Edge,
    ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TableNode from '../nodes/TableNode';
import MysqlTableNode from '../nodes/MysqlTableNode';
import MongoCollectionNode from '../nodes/MongoCollectionNode';
import FieldMappingEdge from './edges/FieldMappingEdge';
import RelationshipEditor from './dialogs/RelationshipEditor';
import SchemaInboxPanel from './dialogs/SchemaInboxPanel';
import { useCanvasStore } from '../stores/canvasStore';
import { Button } from '@/components/ui/button';
import { Plus, FileInput, History, Database } from 'lucide-react';
import VersionHistoryPanel from './dialogs/VersionHistoryPanel';
import ImportDialog from './ImportDialog';
import { projectsApi } from '@/features/projects/api/projectsApi';

import { toast } from 'sonner';
import NodeContextMenu from './nodes/NodeContextMenu';
import { cn } from '@/lib/utils/cn';
import { useSmartGuides } from '../hooks/useSmartGuides';
import AlignmentGuides from './AlignmentGuides';

import { useCollaboration } from '../hooks/useCollaboration';
import { useAutoSave } from '../hooks/useAutoSave';

interface DiagramEditorProps {
    initialContent?: any;
    projectId: string;
}

export default function DiagramEditor({ initialContent, projectId }: DiagramEditorProps) {
    useCollaboration(projectId);
    useAutoSave(projectId); // Enable Auto-Save
    const initialized = useRef(false);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
    const [schemaInboxOpen, setSchemaInboxOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);

    const handleImportFromDb = async (connectionString: string) => {
        try {
            const dbType = metadata?.dbType || 'MYSQL';
            const importedData = await projectsApi.importFromDb(dbType, connectionString);

            // Merge nodes
            if (importedData && importedData.nodes) {
                importedData.nodes.forEach((node: any) => {
                    useCanvasStore.getState().handleLocalEvent({
                        type: 'NODE_ADDED',
                        node: {
                            ...node,
                        },
                        projectId,
                        actorId: 'local',
                        timestamp: Date.now()
                    });
                });
            }

            // Merge edges
            if (importedData && importedData.edges) {
                importedData.edges.forEach((edge: any) => {
                    useCanvasStore.getState().handleLocalEvent({
                        type: 'EDGE_ADDED',
                        edge,
                        projectId,
                        actorId: 'local',
                        timestamp: Date.now()
                    });
                });
            }
        } catch (error: any) {
            console.error('Import failed', error);
            const msg = error.response?.data?.error?.message || error.message || 'Failed to import database';
            toast.error(msg);
        }
    };

    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setInitialContent,
        addTable,
        selectNode,
        selectedNodeId,
        getConnectedElements,
        metadata,
        snapshot, // Undo/Redo
        undo,
        redo,
        searchTerm
    } = useCanvasStore();

    // Focus Mode & Search Logic
    const { displayNodes, displayEdges } = useMemo(() => {
        let activeNodeIds = new Set<string>();
        let activeEdgeIds = new Set<string>();
        let isFiltering = false;

        // 1. Search Filter
        if (searchTerm && searchTerm.trim().length > 0) {
            isFiltering = true;
            const lowerTerm = searchTerm.toLowerCase();
            nodes.forEach(n => {
                if (n.data.label.toLowerCase().includes(lowerTerm)) {
                    activeNodeIds.add(n.id);
                }
                // Also search fields
                if (n.data.fields?.some((f: any) => f.name.toLowerCase().includes(lowerTerm))) {
                    activeNodeIds.add(n.id);
                }
            });
        }

        // 2. Selection Filter (Focus Mode) - override search if selection is active? 
        // Or maybe only if NOT searching. Let's prioritize Search if active.
        if (selectedNodeId && !isFiltering) {
            isFiltering = true;
            const { nodeIds, edgeIds } = getConnectedElements(selectedNodeId);
            nodeIds.forEach(id => activeNodeIds.add(id));
            edgeIds.forEach(id => activeEdgeIds.add(id));
        }

        if (!isFiltering) return { displayNodes: nodes, displayEdges: edges };

        const newNodes = nodes.map(n => ({
            ...n,
            style: {
                ...n.style,
                opacity: activeNodeIds.has(n.id) ? 1 : 0.15,
                transition: 'opacity 0.2s ease-in-out'
            }
        }));

        const newEdges = edges.map(e => {
            const isActive = activeEdgeIds.has(e.id) || (activeNodeIds.has(e.source) && activeNodeIds.has(e.target));
            return {
                ...e,
                style: {
                    ...e.style,
                    opacity: isActive ? 1 : 0.05,
                    stroke: isActive ? (e.style?.stroke) : '#e2e8f0', // Dim color
                },
                animated: isActive ? true : e.animated,
            };
        });

        return { displayNodes: newNodes, displayEdges: newEdges };
    }, [nodes, edges, selectedNodeId, searchTerm, getConnectedElements]);

    const nodeTypes = useMemo(() => ({
        table: TableNode,
        mysqlTable: MysqlTableNode,
        mongoCollection: MongoCollectionNode
    }), []);

    const edgeTypes = useMemo(() => ({
        fieldMapping: FieldMappingEdge,
        default: FieldMappingEdge, // Use FieldMappingEdge as default
    }), []);

    const deleteKeyCode = useMemo(() => ['Backspace', 'Delete'], []);

    const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
        selectNode(node.id);
        setContextMenu(null); // Close context menu on click
    }, [selectNode]);

    const onNodeContextMenu = useCallback((event: React.MouseEvent, node: any) => {
        event.preventDefault();
        setContextMenu({
            x: event.clientX,
            y: event.clientY,
            nodeId: node.id,
        });
    }, []);

    const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
        setSelectedEdge(edge);
    }, []);

    const onPaneClick = useCallback(() => {
        selectNode(null);
        setContextMenu(null); // Close context menu
    }, [selectNode]);

    // Snapshot state before dragging starts
    const onNodeDragStart = useCallback(() => {
        snapshot();
    }, [snapshot]);

    useEffect(() => {
        if (initialContent && !initialized.current) {
            setInitialContent(initialContent);
            initialized.current = true;
        }
    }, [initialContent, setInitialContent]);

    // Undo/Redo Keyboard Shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Avoid interfering with input text editing
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) {
                        redo();
                    } else {
                        undo();
                    }
                } else if (e.key === 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo]);

    const isMongo = metadata?.dbType === 'MONGODB';

    // Theme Backgrounds
    const getThemeBackground = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'ocean':
                return 'bg-gradient-to-br from-cyan-50 to-blue-100/50';
            case 'sunset':
                return 'bg-gradient-to-br from-orange-50 to-rose-100/50';
            case 'dark':
                return 'bg-gradient-to-br from-slate-900 to-slate-800';
            default:
                return 'bg-gradient-to-br from-gray-50 to-gray-100/50';
        }
    };

    const getGridColor = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'ocean': return '#a5f3fc'; // cyan-200
            case 'sunset': return '#fdba74'; // orange-300
            case 'dark': return '#334155'; // slate-700
            default: return '#cbd5e1';
        }
    };

    const getControlsStyle = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'dark': return 'bg-slate-800/80 border-slate-700 shadow-sm !text-white';
            case 'ocean': return 'bg-cyan-50/80 border-cyan-200 shadow-sm text-cyan-900';
            case 'sunset': return 'bg-orange-50/80 border-orange-200 shadow-sm text-orange-900';
            default: return 'bg-white/80 border-gray-200 shadow-sm';
        }
    };

    const { guides, onNodeDrag, onNodeDragStop } = useSmartGuides();

    return (
        <div className={cn("w-full h-full relative", getThemeBackground())}>
            <ReactFlow
                nodes={displayNodes}
                edges={displayEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onNodeContextMenu={onNodeContextMenu}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onNodeDragStart={onNodeDragStart} // Added
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                className="bg-transparent text-black"
                deleteKeyCode={deleteKeyCode}
                connectionMode={ConnectionMode.Loose}
                snapToGrid={true}
                snapGrid={[15, 15]}
            >
                <AlignmentGuides guides={guides} />
                <Controls className={cn("backdrop-blur-sm rounded-lg overflow-hidden !m-4 border", getControlsStyle())} />
                <MiniMap
                    className={cn("!backdrop-blur-sm !rounded-lg !m-4 border", getControlsStyle())}
                    maskColor={metadata?.theme === 'dark' ? "rgba(30, 41, 59, 0.7)" : "rgba(240, 240, 240, 0.6)"}
                    nodeColor={metadata?.theme === 'dark' ? "#475569" : "#e2e8f0"}
                    zoomable
                    pannable
                />
                <Background variant={BackgroundVariant.Dots} gap={20} size={1} color={getGridColor()} />

                {/* Empty State */}
                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className={cn(
                            "text-center p-8 rounded-2xl border flex flex-col items-center gap-4 pointer-events-auto shadow-sm max-w-sm mx-auto backdrop-blur-sm",
                            metadata?.theme === 'dark'
                                ? "bg-slate-800/50 border-slate-700 text-slate-300"
                                : "bg-white/60 border-gray-200/50 text-gray-500"
                        )}>
                            <div className={cn(
                                "p-4 rounded-full mb-2",
                                metadata?.theme === 'dark' ? "bg-slate-700/50" : "bg-gray-100/50"
                            )}>
                                <Database className="w-8 h-8 opacity-50" />
                            </div>
                            <div className="space-y-1">
                                <h3 className={cn("text-lg font-semibold", metadata?.theme === 'dark' ? "text-slate-200" : "text-gray-800")}>
                                    Start Designing
                                </h3>
                                <p className="text-sm opacity-80 max-w-[240px] leading-relaxed">
                                    Drag tables, connect fields, or import an existing schema to get started.
                                </p>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <Button onClick={addTable} size="sm" className={cn(
                                    "shadow-sm transition-all hover:scale-105 active:scale-95",
                                    metadata?.theme === 'dark' ? "bg-blue-600 hover:bg-blue-500" : ""
                                )}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Table
                                </Button>
                                <Button onClick={() => setImportDialogOpen(true)} size="sm" variant="outline" className="shadow-sm transition-all hover:scale-105 active:scale-95">
                                    <FileInput className="w-4 h-4 mr-2" />
                                    Import
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </ReactFlow>

            {/* Editor Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/20 ring-1 ring-black/5 space-y-2 w-48 transition-all hover:bg-white/95">
                    <Button onClick={addTable} size="sm" className="w-full shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        {isMongo ? 'Add Collection' : 'Add Table'}
                    </Button>
                    <Button
                        onClick={() => setSchemaInboxOpen(true)}
                        size="sm"
                        variant="outline"
                        className="w-full shadow-sm"
                    >
                        <FileInput className="w-4 h-4 mr-2" />
                        Import Schema
                    </Button>
                    <Button
                        onClick={() => setImportDialogOpen(true)}
                        size="sm"
                        variant="outline"
                        className="w-full shadow-sm"
                    >
                        <Database className="w-4 h-4 mr-2" />
                        Connect DB
                    </Button>



                    <Button
                        onClick={() => setHistoryOpen(true)}
                        size="sm"
                        variant="outline"
                        className="w-full shadow-sm"
                    >
                        <History className="w-4 h-4 mr-2" />
                        History
                    </Button>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 z-10 text-xs text-gray-400 pointer-events-none">
                <p>Ctrl+Z to Undo • Ctrl+Y to Redo • Click edge to edit relationship</p>
            </div>

            {/* Relationship Editor Dialog */}
            {selectedEdge && (
                <RelationshipEditor
                    edge={selectedEdge}
                    onClose={() => setSelectedEdge(null)}
                />
            )}

            {/* Schema Inbox Panel */}
            {schemaInboxOpen && (
                <SchemaInboxPanel
                    onClose={() => setSchemaInboxOpen(false)}
                />
            )}

            {/* Version History Panel */}
            {historyOpen && (
                <VersionHistoryPanel
                    projectId={projectId}
                    onClose={() => setHistoryOpen(false)}
                />
            )}
            {/* Import Dialog */}
            {importDialogOpen && (
                <ImportDialog
                    open={importDialogOpen}
                    onClose={() => setImportDialogOpen(false)}
                    onSubmit={handleImportFromDb}
                    dbType={metadata?.dbType || 'MYSQL'}
                />
            )}

            {/* Context Menu */}
            {contextMenu && (
                <NodeContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    nodeId={contextMenu.nodeId}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
