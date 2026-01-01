import { useState } from 'react';
import { X, FileInput, Code2, Database } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { MongoDocumentParser, ParsedMongoSchema } from '../../services/MongoDocumentParser';
import { SQLDDLParser, ParsedSQLTable } from '../../services/SQLDDLParser';
import { JSONSchemaParser } from '../../services/JSONSchemaParser';
import { MongooseSchemaParser } from '../../services/MongooseSchemaParser';
import { useCanvasStore } from '../../stores/canvasStore';
import { Node } from 'reactflow';
import { TableNodeData } from '@/types/diagram';

type SchemaFormat = 'mongodb' | 'mysql' | 'unknown';

interface ParsedSchema {
    format: SchemaFormat;
    mongoSchemas?: ParsedMongoSchema[];
    sqlTables?: ParsedSQLTable[];
    error?: string;
}

interface SchemaInboxPanelProps {
    onClose: () => void;
}

export default function SchemaInboxPanel({ onClose }: SchemaInboxPanelProps) {
    const [inputText, setInputText] = useState('');
    const [parsedSchema, setParsedSchema] = useState<ParsedSchema | null>(null);
    const [flattenNested, setFlattenNested] = useState(false);
    const [mergeMode, setMergeMode] = useState(true);

    const { addTable, metadata, nodes } = useCanvasStore();

    // Detect schema format
    const detectFormat = (text: string): SchemaFormat => {
        const trimmed = text.trim();
        // Check for SQL CREATE TABLE
        if (/CREATE\s+TABLE/i.test(trimmed)) { return 'mysql'; }
        // Check for JSON (MongoDB documents)
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) { return 'mongodb'; }
        return 'unknown';
    };

    // Parse schema
    const handleParse = () => {
        try {
            // Try specialized parsers first
            const mongooseResult = MongooseSchemaParser.parseFullSchema(inputText);
            if (mongooseResult) {
                setParsedSchema({ format: 'mongodb', mongoSchemas: [mongooseResult] });
                return;
            }
            const jsonSchemaResult = JSONSchemaParser.parseCreateCollection(inputText);
            if (jsonSchemaResult) {
                setParsedSchema({ format: 'mongodb', mongoSchemas: [jsonSchemaResult] });
                return;
            }

            const format = detectFormat(inputText);
            if (format === 'unknown') {
                setParsedSchema({
                    format: 'unknown',
                    error: 'Could not detect schema format. Please paste:\n• SQL CREATE TABLE statements\n• MongoDB JSON documents\n• Mongoose schema definitions\n• db.createCollection() commands'
                });
                return;
            }

            if (format === 'mysql') {
                const tables = SQLDDLParser.parse(inputText);
                setParsedSchema({ format: 'mysql', sqlTables: tables });
            } else if (format === 'mongodb') {
                const schemas = MongoDocumentParser.parse(inputText);
                setParsedSchema({ format: 'mongodb', mongoSchemas: schemas });
            }
        } catch (error: any) {
            setParsedSchema({
                format: 'unknown',
                error: error.message || 'Failed to parse schema'
            });
        }
    };

    // Add to canvas
    const handleAddToCanvas = () => {
        if (!parsedSchema) return;
        const GRID_GAP = 300;
        const START_X = 100;
        const START_Y = 100;
        const COLUMNS = 3;
        const createdNodesMap = new Map<string, Node<TableNodeData>>();

        // Helper to find existing node by label (table/collection name)
        const findExistingNode = (label: string) => nodes.find(n => n.data.label === label);

        if (parsedSchema.format === 'mongodb' && parsedSchema.mongoSchemas) {
            parsedSchema.mongoSchemas.forEach((schema, index) => {
                const existing = findExistingNode(schema.name);
                const fields = MongoDocumentParser.toDiagramFields(schema.fields, flattenNested);

                if (mergeMode && existing) {
                    // Update existing node data (preserve ID and Position)
                    useCanvasStore.setState(state => ({
                        nodes: state.nodes.map(n => n.id === existing.id ? {
                            ...n,
                            data: { ...n.data, fields } // Overwrite fields
                        } : n)
                    }));
                } else {
                    // Create new node
                    const newNode: Node<TableNodeData> = {
                        id: `imported_${schema.name}_${Date.now()}_${index}`,
                        type: 'mongoCollection',
                        position: { x: START_X + (index % COLUMNS) * GRID_GAP, y: START_Y + Math.floor(index / COLUMNS) * GRID_GAP },
                        data: { label: schema.name, fields }
                    };
                    useCanvasStore.getState().handleLocalEvent({
                        type: 'NODE_ADDED',
                        node: newNode,
                        projectId: useCanvasStore.getState().projectId || 'unknown',
                        actorId: 'local',
                        timestamp: Date.now()
                    });
                }
            });
            onClose();
        } else if (parsedSchema.format === 'mysql' && parsedSchema.sqlTables) {
            parsedSchema.sqlTables.forEach((table, index) => {
                const existing = findExistingNode(table.name);
                const fields = SQLDDLParser.toDiagramFields(table.fields);
                table.foreignKeys.forEach(fk => {
                    const field = fields.find(f => f.name === fk.sourceColumn);
                    if (field) { field.isForeignKey = true; }
                });

                if (mergeMode && existing) {
                    // Update existing node
                    useCanvasStore.setState(state => ({
                        nodes: state.nodes.map(n => n.id === existing.id ? {
                            ...n,
                            data: { ...n.data, fields }
                        } : n)
                    }));
                    createdNodesMap.set(table.name, existing); // Map to existing node for edges logic
                } else {
                    // Create new node
                    const newNode: Node<TableNodeData> = {
                        id: `imported_${table.name}_${Date.now()}_${index}`,
                        type: 'mysqlTable',
                        position: { x: START_X + (index % COLUMNS) * GRID_GAP, y: START_Y + Math.floor(index / COLUMNS) * GRID_GAP },
                        data: { label: table.name, fields }
                    };
                    createdNodesMap.set(table.name, newNode);
                    useCanvasStore.getState().handleLocalEvent({
                        type: 'NODE_ADDED',
                        node: newNode,
                        projectId: useCanvasStore.getState().projectId || 'unknown',
                        actorId: 'local',
                        timestamp: Date.now()
                    });
                }
            });

            // Re-run edge creation (will trigger edge add, might need de-dupe logic or just let it add multiple?)
            // If we merged, we might want to AVOID adding duplicate edges.
            // Edge ID generation is random/time-based, so it WILL add duplicates.
            // We should check if edge exists.
            parsedSchema.sqlTables.forEach((table) => {
                const sourceNode = createdNodesMap.get(table.name);
                if (!sourceNode) return;
                table.foreignKeys.forEach(fk => {
                    const targetNode = createdNodesMap.get(fk.targetTable);
                    if (!targetNode) return;

                    // Check if connection already exists (simple check)
                    const edges = useCanvasStore.getState().edges;
                    const exists = edges.some(e => e.source === sourceNode.id && e.target === targetNode.id);
                    if (mergeMode && exists) return; // Skip if merging and edge exists

                    const sourceField = sourceNode.data.fields.find(f => f.name === fk.sourceColumn);
                    const targetField = targetNode.data.fields.find(f => f.name === fk.targetColumn);
                    if (sourceField && targetField) {
                        const newEdge: any = {
                            id: `edge_${sourceNode.id}_${targetNode.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                            source: sourceNode.id,
                            target: targetNode.id,
                            sourceHandle: sourceField.id,
                            targetHandle: targetField.id,
                            type: 'fieldMapping',
                            data: {
                                fieldMappings: [{ sourceField: sourceField.name, targetField: targetField.name, relationshipType: '1:N', }],
                                relationshipName: fk.constraintName || `${table.name}_${fk.targetTable}`,
                                relationshipType: 'one-to-many',
                                showFields: true,
                                showCardinality: true,
                                constraints: { onDelete: fk.onDelete, onUpdate: fk.onUpdate }
                            }
                        };
                        useCanvasStore.getState().handleLocalEvent({
                            type: 'EDGE_ADDED',
                            edge: newEdge,
                            projectId: useCanvasStore.getState().projectId || 'unknown',
                            actorId: 'local',
                            timestamp: Date.now()
                        });
                    }
                });
            });
            onClose();
        }
    };

    // Calculate Conflicts
    const existingCount = parsedSchema ? (
        parsedSchema.format === 'mongodb'
            ? parsedSchema.mongoSchemas?.filter(s => nodes.some(n => n.data.label === s.name)).length
            : parsedSchema.sqlTables?.filter(t => nodes.some(n => n.data.label === t.name)).length
    ) : 0;

    // Theme Logic for Schema Inbox
    const getThemeStyles = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'dark':
                return {
                    overlay: 'bg-black/70',
                    modal: 'bg-slate-900 border border-slate-700 shadow-2xl',
                    header: 'bg-slate-900 border-slate-700',
                    footer: 'bg-slate-900 border-slate-700',
                    content: 'bg-slate-900',
                    text: 'text-slate-100',
                    subText: 'text-slate-400',
                    input: 'bg-slate-800 border-slate-600 text-slate-200 focus:ring-blue-500',
                    codeBox: 'bg-slate-800 border-slate-600 text-blue-300',
                    card: 'bg-slate-800 border-slate-700',
                    errorBox: 'bg-red-900/20 border-red-800 text-red-200',
                    successBagde: 'bg-green-900/30 text-green-300',
                    button: 'border-slate-600 text-slate-300 hover:bg-slate-800',
                    icon: 'text-slate-400'
                };
            case 'ocean':
                return {
                    overlay: 'bg-cyan-900/30 backdrop-blur-sm',
                    modal: 'bg-white border text-cyan-900 border-cyan-100 shadow-xl',
                    header: 'bg-cyan-50/50 border-cyan-100',
                    footer: 'bg-cyan-50/50 border-cyan-100',
                    content: 'bg-white',
                    text: 'text-cyan-900',
                    subText: 'text-cyan-600',
                    input: 'bg-cyan-50 border-cyan-200 text-cyan-900 focus:ring-cyan-500',
                    codeBox: 'bg-cyan-50 border-cyan-200 text-cyan-800',
                    card: 'bg-cyan-50/30 border-cyan-100',
                    errorBox: 'bg-red-50 border-red-200 text-red-900',
                    successBagde: 'bg-green-100 text-green-800',
                    button: 'border-cyan-200 text-cyan-700 hover:bg-cyan-50',
                    icon: 'text-cyan-400'
                };
            case 'sunset':
                return {
                    overlay: 'bg-orange-900/30 backdrop-blur-sm',
                    modal: 'bg-white border border-orange-100 shadow-xl',
                    header: 'bg-orange-50/50 border-orange-100',
                    footer: 'bg-orange-50/50 border-orange-100',
                    content: 'bg-white',
                    text: 'text-orange-900',
                    subText: 'text-orange-600',
                    input: 'bg-orange-50 border-orange-200 text-orange-900 focus:ring-orange-500',
                    codeBox: 'bg-orange-50 border-orange-200 text-orange-800',
                    card: 'bg-orange-50/30 border-orange-100',
                    errorBox: 'bg-red-50 border-red-200 text-red-900',
                    successBagde: 'bg-green-100 text-green-800',
                    button: 'border-orange-200 text-orange-700 hover:bg-orange-50',
                    icon: 'text-orange-400'
                };
            default:
                return {
                    overlay: 'bg-black/50',
                    modal: 'bg-white shadow-2xl',
                    header: 'bg-white border-gray-200',
                    footer: 'bg-gray-50 border-gray-200',
                    content: 'bg-white',
                    text: 'text-gray-900',
                    subText: 'text-gray-500',
                    input: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500',
                    codeBox: 'bg-blue-50 border-blue-200 text-blue-900',
                    card: 'bg-gray-50 border-gray-200',
                    errorBox: 'bg-red-50 border-red-200 text-red-900',
                    successBagde: 'bg-green-100 text-green-800',
                    button: 'border-gray-200 text-gray-700 hover:bg-gray-50',
                    icon: 'text-gray-400 hover:text-gray-600'
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <div className={cn("fixed inset-0 flex items-center justify-center z-50 p-4", styles.overlay)}>
            <div className={cn("rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300", styles.modal)}>
                {/* Header */}
                <div className={cn("px-6 py-4 border-b flex items-center justify-between", styles.header)}>
                    <div className="flex items-center gap-3">
                        <FileInput className={cn("w-6 h-6", styles.text)} />
                        <h2 className={cn("text-xl font-bold", styles.text)}>Schema Inbox</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={cn("transition", styles.icon)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className={cn("flex-1 overflow-y-auto px-6 py-4 space-y-4", styles.content)}>
                    {/* Instructions */}
                    <div className={cn("rounded-lg p-4 border", styles.codeBox)}>
                        <p className={cn("text-sm font-medium mb-2", styles.text)}>
                            📥 Paste your schema below:
                        </p>
                        <ul className={cn("text-xs space-y-1 ml-4 opacity-80", styles.text)}>
                            <li>• SQL CREATE TABLE statements</li>
                            <li>• MongoDB document samples (JSON)</li>
                            <li>• Mongoose schema definitions</li>
                            <li>• db.createCollection() commands</li>
                            <li>• Multiple tables/collections supported</li>
                        </ul>
                    </div>

                    {/* Input Area */}
                    <div>
                        <label className={cn("block text-sm font-medium mb-2", styles.text)}>
                            Schema Input
                        </label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={`Paste SQL or MongoDB JSON here...\n\nExample SQL:\nCREATE TABLE students (\n  id INT PRIMARY KEY,\n  name VARCHAR(100)\n);\n\nExample MongoDB:\n{\n  "_id": ObjectId("..."),\n  "name": "John",\n  "age": 16\n}`}
                            className={cn("w-full h-64 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 font-mono text-sm resize-none transition-colors", styles.input)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Button onClick={handleParse} className="flex items-center gap-2">
                            <Code2 className="w-4 h-4" />
                            Parse Schema
                        </Button>
                        <Button
                            onClick={() => {
                                setInputText('');
                                setParsedSchema(null);
                            }}
                            variant="outline"
                            className={cn("transition-colors", styles.button)}
                        >
                            Clear
                        </Button>
                    </div>

                    {/* Preview */}
                    {parsedSchema && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className={cn("text-lg font-semibold mb-3", styles.text)}>Preview</h3>

                            {parsedSchema.error ? (
                                <div className={cn("rounded-lg p-4 border", styles.errorBox)}>
                                    <p className="text-sm">
                                        <strong>Error:</strong> {parsedSchema.error}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Detected Format */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={cn("text-sm", styles.subText)}>Detected:</span>
                                        <span className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium", styles.successBagde)}>
                                            {parsedSchema.format === 'mysql' ? (
                                                <>
                                                    <Database className="w-4 h-4" />
                                                    MySQL DDL
                                                </>
                                            ) : (
                                                <>
                                                    <Database className="w-4 h-4" />
                                                    MongoDB Documents
                                                </>
                                            )}
                                        </span>
                                        {/* (Stats rendering omitted for brevity, assumes default color usage but wrapper is themed) */}
                                    </div>

                                    {/* MongoDB Preview */}
                                    {parsedSchema.format === 'mongodb' && parsedSchema.mongoSchemas && (
                                        <div className="space-y-3">
                                            {parsedSchema.mongoSchemas.map((schema, index) => (
                                                <div key={index} className={cn("rounded-lg p-4 border", styles.card)}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Database className="w-5 h-5 text-green-600" />
                                                        <h4 className={cn("font-semibold", styles.text)}>{schema.name}</h4>
                                                        <span className={cn("text-sm", styles.subText)}>
                                                            ({schema.fields.length} fields)
                                                        </span>
                                                    </div>
                                                    <div className={cn("grid grid-cols-2 gap-2 text-sm", styles.text)}>
                                                        {schema.fields.slice(0, 10).map((field, i) => (
                                                            <div key={i} className="flex items-center gap-2">
                                                                <span className="opacity-90">{field.name}</span>
                                                                <span className="opacity-60 text-xs">
                                                                    {field.isArray ? `Array<${field.type}>` : field.type}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* SQL Preview */}
                                    {parsedSchema.format === 'mysql' && parsedSchema.sqlTables && (
                                        <div className="space-y-3">
                                            {parsedSchema.sqlTables.map((table, index) => (
                                                <div key={index} className={cn("rounded-lg p-4 border", styles.card)}>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Database className="w-5 h-5 text-blue-600" />
                                                        <h4 className={cn("font-semibold", styles.text)}>{table.name}</h4>
                                                        <span className={cn("text-sm", styles.subText)}>
                                                            ({table.fields.length} fields)
                                                        </span>
                                                    </div>
                                                    <div className={cn("grid grid-cols-2 gap-2 text-sm", styles.text)}>
                                                        {table.fields.slice(0, 10).map((field, i) => (
                                                            <div key={i} className="flex items-center gap-2">
                                                                <span className="opacity-90">
                                                                    {field.name}
                                                                    {field.isPrimaryKey && ' 🔑'}
                                                                </span>
                                                                <span className="opacity-60 text-xs">{field.type}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={cn("px-6 py-4 border-t flex items-center justify-between", styles.footer)}>
                    <div className="flex items-center gap-4">
                        <label className={cn("flex items-center gap-2 text-sm cursor-pointer select-none", styles.text)}>
                            <input
                                type="checkbox"
                                checked={mergeMode}
                                onChange={e => setMergeMode(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>Merge with existing tables</span>
                        </label>
                        {!!existingCount && existingCount > 0 && (
                            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full border border-yellow-200 font-medium">
                                ⚠️ {existingCount} conflict{existingCount > 1 ? 's' : ''} found
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={onClose} variant="outline" className={cn("transition-colors", styles.button)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddToCanvas}
                            disabled={!parsedSchema || !!parsedSchema.error}
                            className="flex items-center gap-2"
                        >
                            <Database className="w-4 h-4" />
                            {mergeMode && !!existingCount ? 'Merge to Canvas' : 'Add to Canvas'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
