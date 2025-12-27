import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import { DiagramContent, TableNodeData, Field } from '@/types/diagram';
import { DiagramEvent } from '@/types/events';
import { Socket } from 'socket.io-client';

// Simple ID generator (UUID v4)
const generateId = () => {
    if (typeof self !== 'undefined' && self.crypto && self.crypto.randomUUID) {
        return self.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

interface HistoryState {
    nodes: Node<TableNodeData>[];
    edges: Edge[];
}

interface CanvasState {
    nodes: Node<TableNodeData>[];
    edges: Edge[];
    selectedNodeId: string | null;
    metadata: any;
    projectId: string | null;

    // History
    past: HistoryState[];
    future: HistoryState[];

    // Collaboration
    socket: Socket | null;
    setSocket: (socket: Socket | null) => void;
    setProjectId: (id: string) => void;

    // ReactFlow Handlers
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;

    // Canvas Actions
    setInitialContent: (content: any) => void;
    addTable: () => void;
    deleteNode: (nodeId: string) => void;
    selectNode: (nodeId: string | null) => void;

    // History Actions
    snapshot: () => void;
    undo: () => void;
    redo: () => void;

    // Collaboration / Event Handling
    handleLocalEvent: (event: DiagramEvent, skipSnapshot?: boolean) => void;
    applyEvent: (event: DiagramEvent) => void;

    // Table Actions
    updateTableName: (nodeId: string, name: string) => void;
    addField: (nodeId: string) => void;
    updateField: (nodeId: string, fieldId: string, updates: Partial<Field>) => void;
    deleteField: (nodeId: string, fieldId: string) => void;

    // Getters
    getDiagramContent: () => DiagramContent;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    metadata: { version: 1, dbType: 'MYSQL', createdAt: '', updatedAt: '' },
    projectId: null,
    past: [],
    future: [],
    socket: null,

    setSocket: (socket) => set({ socket }),
    setProjectId: (id) => set({ projectId: id }),

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
        // Note: Node position changes need to be broadcasted via onNodeDragStop logic ideally,
        // or throttled here. For MVP, we'll implement explicit MOVE event handler if needed, 
        // or just rely on 'snapshot' logic for drag start.
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        const newEdgeFn = addEdge(connection, get().edges);
        get().snapshot();
        // TODO: Emit EDGE_ADDED event. Finding the new edge ID is tricky with standard addEdge.
        // For now, local only.
        set({
            edges: addEdge(connection, get().edges),
        });
    },

    setInitialContent: (content: any) => {
        set({
            nodes: content?.nodes || [],
            edges: content?.edges || [],
            metadata: content?.metadata || { version: 1, dbType: 'MYSQL', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            past: [],
            future: []
        });
    },

    snapshot: () => {
        const { nodes, edges, past } = get();
        const currentState: HistoryState = {
            nodes: typeof structuredClone === 'function' ? structuredClone(nodes) : JSON.parse(JSON.stringify(nodes)),
            edges: typeof structuredClone === 'function' ? structuredClone(edges) : JSON.parse(JSON.stringify(edges))
        };
        const newPast = [...past, currentState].slice(-50);
        set({ past: newPast, future: [] });
    },

    undo: () => {
        const { past, future, nodes, edges } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        const current: HistoryState = { nodes, edges };
        set({
            nodes: previous.nodes,
            edges: previous.edges,
            past: newPast,
            future: [current, ...future]
        });
    },

    redo: () => {
        const { past, future, nodes, edges } = get();
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        const current: HistoryState = { nodes, edges };
        set({
            nodes: next.nodes,
            edges: next.edges,
            past: [...past, current],
            future: newFuture
        });
    },

    // --- Event Sourcing Core ---

    handleLocalEvent: (event: DiagramEvent, skipSnapshot = false) => {
        if (!skipSnapshot) {
            get().snapshot();
        }

        // Enrich event with actual ProjectId
        const enrichedEvent = {
            ...event,
            projectId: get().projectId || 'unknown'
        };

        get().applyEvent(enrichedEvent);

        // Emit to WebSocket
        const socket = get().socket;
        if (socket) {
            socket.emit('diagram-event', enrichedEvent);
        }
    },

    applyEvent: (event: DiagramEvent) => {
        const { nodes, edges } = get();

        switch (event.type) {
            case 'NODE_ADDED':
                set({ nodes: [...nodes, event.node], selectedNodeId: event.node.id });
                break;
            case 'NODE_DELETED':
                set({
                    nodes: nodes.filter(n => n.id !== event.nodeId),
                    edges: edges.filter(e => e.source !== event.nodeId && e.target !== event.nodeId),
                    selectedNodeId: get().selectedNodeId === event.nodeId ? null : get().selectedNodeId
                });
                break;
            case 'NODE_UPDATED':
                set({
                    nodes: nodes.map(n => n.id === event.nodeId ? { ...n, data: { ...n.data, ...event.changes } } : n)
                });
                break;
            case 'FIELD_ADDED':
                set({
                    nodes: nodes.map(n => {
                        if (n.id === event.nodeId) {
                            return { ...n, data: { ...n.data, fields: [...n.data.fields, event.field] } };
                        }
                        return n;
                    })
                });
                break;
            case 'FIELD_UPDATED':
                set({
                    nodes: nodes.map(n => {
                        if (n.id === event.nodeId) {
                            return {
                                ...n,
                                data: {
                                    ...n.data,
                                    fields: n.data.fields.map(f => f.id === event.fieldId ? { ...f, ...event.changes } : f)
                                }
                            };
                        }
                        return n;
                    })
                });
                break;
            case 'FIELD_DELETED':
                set({
                    nodes: nodes.map(n => {
                        if (n.id === event.nodeId) {
                            return { ...n, data: { ...n.data, fields: n.data.fields.filter(f => f.id !== event.fieldId) } };
                        }
                        return n;
                    })
                });
                break;
        }
    },

    // --- Actions ---

    addTable: () => {
        const id = generateId();
        const dbType = get().metadata?.dbType || 'MYSQL';
        const isMongo = dbType === 'MONGODB';

        const newNode: Node<TableNodeData> = {
            id,
            type: isMongo ? 'mongoCollection' : 'mysqlTable',
            position: { x: 100 + Math.random() * 50, y: 100 + Math.random() * 50 },
            data: {
                label: isMongo ? `Collection ${get().nodes.length + 1}` : `Table ${get().nodes.length + 1}`,
                fields: isMongo
                    ? [{ id: generateId(), name: '_id', type: 'ObjectId', isPrimaryKey: true }]
                    : [{ id: generateId(), name: 'id', type: 'INT', isPrimaryKey: true }]
            },
        };

        get().handleLocalEvent({
            type: 'NODE_ADDED',
            node: newNode,
            projectId: 'current',
            actorId: 'local',
            timestamp: Date.now()
        });
    },

    deleteNode: (nodeId: string) => {
        get().handleLocalEvent({
            type: 'NODE_DELETED',
            nodeId,
            projectId: 'current',
            actorId: 'local',
            timestamp: Date.now()
        });
    },

    updateTableName: (nodeId: string, name: string) => {
        get().handleLocalEvent({
            type: 'NODE_UPDATED',
            nodeId,
            changes: { label: name },
            projectId: 'current',
            actorId: 'local',
            timestamp: Date.now()
        }, true); // Skip snapshot (handled by UI Focus)
    },

    addField: (nodeId: string) => {
        const newField: Field = {
            id: generateId(),
            name: 'new_field',
            type: 'VARCHAR',
            isPrimaryKey: false,
            isForeignKey: false,
            isNullable: true,
        };

        get().handleLocalEvent({
            type: 'FIELD_ADDED',
            nodeId,
            field: newField,
            projectId: 'current',
            actorId: 'local',
            timestamp: Date.now()
        });
    },

    updateField: (nodeId: string, fieldId: string, updates: Partial<Field>) => {
        get().handleLocalEvent({
            type: 'FIELD_UPDATED',
            nodeId,
            fieldId,
            changes: updates,
            projectId: 'current',
            actorId: 'local',
            timestamp: Date.now()
        }, true); // Usually continuous typing? If Atomic (dropdown), skip=false is better.
        // Assuming continuous for name/type.
    },

    deleteField: (nodeId: string, fieldId: string) => {
        get().handleLocalEvent({
            type: 'FIELD_DELETED',
            nodeId,
            fieldId,
            projectId: 'current',
            actorId: 'local',
            timestamp: Date.now()
        });
    },

    selectNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
    },

    getDiagramContent: () => {
        const state = get();
        return {
            nodes: state.nodes,
            edges: state.edges,
            metadata: {
                ...state.metadata,
                updatedAt: new Date().toISOString()
            },
        };
    },
}));
