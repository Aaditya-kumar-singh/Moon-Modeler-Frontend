import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TableNode from '../nodes/TableNode';
import MysqlTableNode from '../nodes/MysqlTableNode';
import MongoCollectionNode from '../nodes/MongoCollectionNode';
import { useCanvasStore } from '../stores/canvasStore';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { useCollaboration } from '../hooks/useCollaboration';

interface DiagramEditorProps {
    initialContent?: any;
    projectId: string;
}

export default function DiagramEditor({ initialContent, projectId }: DiagramEditorProps) {
    useCollaboration(projectId);
    const initialized = useRef(false);

    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setInitialContent,
        addTable,
        selectNode,
        metadata,
        snapshot, // Undo/Redo
        undo,
        redo
    } = useCanvasStore();

    const nodeTypes = useMemo(() => ({
        table: TableNode,
        mysqlTable: MysqlTableNode,
        mongoCollection: MongoCollectionNode
    }), []);

    const onNodeClick = useCallback((_: React.MouseEvent, node: any) => {
        selectNode(node.id);
    }, [selectNode]);

    const onPaneClick = useCallback(() => {
        selectNode(null);
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

    return (
        <div className="w-full h-full relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onNodeDragStart={onNodeDragStart} // Added
                nodeTypes={nodeTypes}
                fitView
                className="bg-gray-50 text-black"
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Controls />
                <MiniMap />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>

            {/* Editor Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
                    <Button onClick={addTable} size="sm" className="w-full shadow-sm">
                        <Plus className="w-4 h-4 mr-2" />
                        {isMongo ? 'Add Collection' : 'Add Table'}
                    </Button>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 z-10 text-xs text-gray-400 pointer-events-none">
                <p>Ctrl+Z to Undo • Ctrl+Y to Redo</p>
            </div>
        </div>
    );
}
