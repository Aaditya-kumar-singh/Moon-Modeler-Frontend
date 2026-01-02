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
import { DiagramContent, TableNodeData, Field, FieldMapping, EnhancedEdgeData } from '@/types/diagram';
import { DiagramEvent } from '@/types/events';
import { Socket } from 'socket.io-client';
import { getSmartHandleIds } from '../utils/smartHandles';

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
    addNodeNextTo: (nodeId: string, direction: 'top' | 'bottom' | 'left' | 'right') => void;
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

    // Edge/Relationship Actions
    updateEdgeData: (edgeId: string, data: Partial<EnhancedEdgeData>) => void;
    addFieldMapping: (edgeId: string, mapping: FieldMapping) => void;
    removeFieldMapping: (edgeId: string, mappingIndex: number) => void;
    deleteEdge: (edgeId: string) => void;

    // Appearance
    updateNodeColor: (nodeId: string, color: string) => void;
    setTheme: (theme: any) => void;
    setEdgeStyle: (style: any) => void;
    setDbType: (dbType: string) => void;

    // UI State
    searchTerm: string;
    setSearchTerm: (term: string) => void;

    // Getters
    getDiagramContent: () => DiagramContent;
    getConnectedElements: (nodeId: string) => { nodeIds: string[], edgeIds: string[] };
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    metadata: { version: 1, dbType: 'MYSQL', createdAt: '', updatedAt: '', theme: 'default', edgeStyle: 'step' },
    projectId: null,
    past: [],
    future: [],
    socket: null,
    searchTerm: '',

    setSearchTerm: (term) => set({ searchTerm: term }),

    setSocket: (socket) => set({ socket }),
    setProjectId: (id) => set({ projectId: id }),

    onNodesChange: (changes: NodeChange[]) => {
        const currentNodes = get().nodes;
        const newNodes = applyNodeChanges(changes, currentNodes);

        // --- Smart Handle Logic ---
        // Identify which nodes moved (position change detected)
        const movedNodeIds = new Set<string>();
        changes.forEach(change => {
            if (change.type === 'position' && change.dragging) {
                movedNodeIds.add(change.id);
            }
        });

        let newEdges = get().edges;

        if (movedNodeIds.size > 0) {
            let edgesChanged = false;

            newEdges = newEdges.map(edge => {
                // Only touch edges connected to moved nodes
                if (!movedNodeIds.has(edge.source) && !movedNodeIds.has(edge.target)) {
                    return edge;
                }

                // Only touch "Table-level" edges (heuristic: handle IDs contain 'source-' or 'target-' but not field IDs)
                // We'll trust our new handle naming convention: "nodeId-source-top" etc.
                const isTableHandle = (h?: string | null) => h && (h.includes('-source-') || h.includes('-target-') || h.includes('-table-'));
                const isSmartEdge = isTableHandle(edge.sourceHandle) && isTableHandle(edge.targetHandle);

                if (!isSmartEdge) return edge;

                const sourceNode = newNodes.find(n => n.id === edge.source);
                const targetNode = newNodes.find(n => n.id === edge.target);

                if (!sourceNode || !targetNode) return edge;

                const { sourceHandle, targetHandle } = getSmartHandleIds(sourceNode, targetNode);

                if (edge.sourceHandle !== sourceHandle || edge.targetHandle !== targetHandle) {
                    edgesChanged = true;
                    return {
                        ...edge,
                        sourceHandle,
                        targetHandle
                    };
                }

                return edge;
            });

            if (edgesChanged) {
                // Optimization: avoid re-setting edges if nothing changed
            }
        }

        set({
            nodes: newNodes,
            edges: newEdges
        });
    },
    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },
    onConnect: (connection: Connection) => {
        get().snapshot();

        // Find source and target nodes to suggest initial field mapping
        const sourceNode = get().nodes.find(n => n.id === connection.source);
        const targetNode = get().nodes.find(n => n.id === connection.target);

        // Smart field suggestion: try to find primary key in source
        const sourcePkField = sourceNode?.data.fields.find(f => f.isPrimaryKey);
        const targetFirstField = targetNode?.data.fields[0];

        // Create edge with initial field mapping
        const newEdge: Edge = {
            id: connection.source + '-' + connection.target + '-' + generateId().slice(0, 8),
            source: connection.source!,
            target: connection.target!,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: 'fieldMapping',
            data: {
                fieldMappings: [{
                    sourceField: sourcePkField?.name || sourceNode?.data.fields[0]?.name || 'id',
                    targetField: targetFirstField?.name || 'id',
                    relationshipType: '1:N',
                }],
                relationshipName: `${sourceNode?.data.label}-${targetNode?.data.label}`,
                relationshipType: 'one-to-many',
                showFields: true,
                showCardinality: true
            }
        };

        set({
            edges: [...get().edges, newEdge],
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
            case 'EDGE_ADDED':
                set({ edges: [...edges, event.edge] });
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

    addNodeNextTo: (sourceNodeId: string, direction: 'top' | 'bottom' | 'left' | 'right') => {
        const sourceNode = get().nodes.find(n => n.id === sourceNodeId);
        if (!sourceNode) return;

        const id = generateId();
        const dbType = get().metadata?.dbType || 'MYSQL';
        const isMongo = dbType === 'MONGODB';
        const offset = 250;

        let position = { x: sourceNode.position.x, y: sourceNode.position.y };

        switch (direction) {
            case 'right': position.x += 300; break;
            case 'left': position.x -= 300; break;
            case 'bottom': position.y += 300; break;
            case 'top': position.y -= 250; break;
        }

        const newNode: Node<TableNodeData> = {
            id,
            type: isMongo ? 'mongoCollection' : 'mysqlTable',
            position,
            data: {
                label: isMongo ? `Collection ${get().nodes.length + 1}` : `Table ${get().nodes.length + 1}`,
                fields: isMongo
                    ? [{ id: generateId(), name: '_id', type: 'ObjectId', isPrimaryKey: true }]
                    : [{ id: generateId(), name: 'id', type: 'INT', isPrimaryKey: true }]
            },
        };

        // Add Node
        get().handleLocalEvent({
            type: 'NODE_ADDED',
            node: newNode,
            projectId: 'current',
            actorId: 'local',
            timestamp: Date.now()
        });

        // Add Edge
        // Default connecting Primary Key to ID or similar
        const sourcePk = sourceNode.data.fields.find(f => f.isPrimaryKey) || sourceNode.data.fields[0];
        const targetPk = newNode.data.fields[0];

        if (sourcePk && targetPk) {
            const newEdge: Edge = {
                id: `${sourceNodeId}-${id}-quick`,
                source: sourceNodeId,
                target: id,
                sourceHandle: `${sourceNodeId}-source-${direction}`,
                targetHandle: `${id}-target`, // fallback or specific handle
                type: 'fieldMapping',
                data: {
                    fieldMappings: [{
                        sourceField: sourcePk.name,
                        targetField: targetPk.name,
                        relationshipType: '1:N',
                    }],
                    relationshipName: `${sourceNode.data.label}-${newNode.data.label}`,
                    relationshipType: 'one-to-many',
                    showFields: true,
                    showCardinality: true
                }
            };
            get().handleLocalEvent({
                type: 'EDGE_ADDED',
                edge: newEdge,
                projectId: 'current',
                actorId: 'local',
                timestamp: Date.now()
            });
        }
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

    // --- Edge/Relationship Actions ---

    updateEdgeData: (edgeId: string, data: Partial<EnhancedEdgeData>) => {
        get().snapshot();
        set((state) => ({
            edges: state.edges.map(edge =>
                edge.id === edgeId
                    ? { ...edge, data: { ...edge.data, ...data } }
                    : edge
            )
        }));

        // Emit to WebSocket
        const socket = get().socket;
        if (socket) {
            socket.emit('diagram-event', {
                type: 'EDGE_DATA_UPDATED',
                edgeId,
                data,
                projectId: get().projectId || 'unknown',
                actorId: 'local',
                timestamp: Date.now()
            });
        }
    },

    addFieldMapping: (edgeId: string, mapping: FieldMapping) => {
        get().snapshot();
        set((state) => ({
            edges: state.edges.map(edge =>
                edge.id === edgeId
                    ? {
                        ...edge,
                        data: {
                            ...edge.data,
                            fieldMappings: [...(edge.data.fieldMappings || []), mapping]
                        }
                    }
                    : edge
            )
        }));

        // Emit to WebSocket
        const socket = get().socket;
        if (socket) {
            socket.emit('diagram-event', {
                type: 'FIELD_MAPPING_ADDED',
                edgeId,
                mapping,
                projectId: get().projectId || 'unknown',
                actorId: 'local',
                timestamp: Date.now()
            });
        }
    },

    removeFieldMapping: (edgeId: string, mappingIndex: number) => {
        get().snapshot();
        set((state) => {
            const edges = state.edges.map(edge => {
                if (edge.id !== edgeId) return edge;

                const updatedMappings = edge.data.fieldMappings?.filter(
                    (_: any, i: number) => i !== mappingIndex
                );

                // If no mappings left, remove the edge entirely
                if (!updatedMappings || updatedMappings.length === 0) {
                    return null;
                }

                return {
                    ...edge,
                    data: { ...edge.data, fieldMappings: updatedMappings }
                };
            }).filter(Boolean) as Edge[];

            return { edges };
        });

        // Emit to WebSocket
        const socket = get().socket;
        if (socket) {
            socket.emit('diagram-event', {
                type: 'FIELD_MAPPING_REMOVED',
                edgeId,
                mappingIndex,
                projectId: get().projectId || 'unknown',
                actorId: 'local',
                timestamp: Date.now()
            });
        }
    },

    deleteEdge: (edgeId: string) => {
        get().snapshot();
        set((state) => ({
            edges: state.edges.filter(edge => edge.id !== edgeId)
        }));

        // Emit to WebSocket
        const socket = get().socket;
        if (socket) {
            socket.emit('diagram-event', {
                type: 'EDGE_DELETED',
                edgeId,
                projectId: get().projectId || 'unknown',
                actorId: 'local',
                timestamp: Date.now()
            });
        }
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

    // --- Appearance Actions ---

    updateNodeColor: (nodeId: string, color: string) => {
        get().handleLocalEvent({
            type: 'NODE_UPDATED',
            nodeId,
            changes: { color },
            projectId: 'current',
            actorId: 'local',
            timestamp: Date.now()
        }, true);
    },

    setTheme: (theme: any) => {
        set(state => ({
            metadata: { ...state.metadata, theme }
        }));
    },

    setEdgeStyle: (edgeStyle: any) => {
        set(state => ({
            metadata: { ...state.metadata, edgeStyle }
        }));
    },

    setDbType: (dbType: string) => {
        set(state => ({
            metadata: { ...state.metadata, dbType }
        }));
    },

    getConnectedElements: (nodeId: string) => {
        const { edges } = get();
        const connectedNodeIds = new Set<string>([nodeId]);
        const connectedEdgeIds = new Set<string>();

        edges.forEach(edge => {
            if (edge.source === nodeId) {
                connectedNodeIds.add(edge.target);
                connectedEdgeIds.add(edge.id);
            } else if (edge.target === nodeId) {
                connectedNodeIds.add(edge.source);
                connectedEdgeIds.add(edge.id);
            }
        });

        return {
            nodeIds: Array.from(connectedNodeIds),
            edgeIds: Array.from(connectedEdgeIds)
        };
    },
}));
