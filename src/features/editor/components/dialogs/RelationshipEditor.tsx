import { useState, useMemo } from 'react';
import { Edge } from 'reactflow';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '../../stores/canvasStore';
import { FieldMapping, EnhancedEdgeData } from '@/types/diagram';
import { cn } from '@/lib/utils/cn';

interface RelationshipEditorProps {
    edge: Edge;
    onClose: () => void;
}

export default function RelationshipEditor({ edge, onClose }: RelationshipEditorProps) {
    const { nodes, updateEdgeData, removeFieldMapping, addFieldMapping, deleteEdge, metadata } = useCanvasStore();

    // Get source and target nodes
    const sourceNode = useMemo(() =>
        nodes.find(n => n.id === edge.source), [nodes, edge.source]
    );
    const targetNode = useMemo(() =>
        nodes.find(n => n.id === edge.target), [nodes, edge.target]
    );

    // Local state for editing
    const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(
        edge.data?.fieldMappings || []
    );
    const [relationshipName, setRelationshipName] = useState(
        edge.data?.relationshipName || `${sourceNode?.data.label}-${targetNode?.data.label}`
    );
    const [relationshipType, setRelationshipType] = useState<'one-to-one' | 'one-to-many' | 'many-to-many'>(
        edge.data?.relationshipType || 'one-to-many'
    );
    const [onDelete, setOnDelete] = useState<'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'>(
        edge.data?.constraints?.onDelete || 'NO ACTION'
    );
    const [onUpdate, setOnUpdate] = useState<'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION'>(
        edge.data?.constraints?.onUpdate || 'NO ACTION'
    );

    const isMongo = metadata?.dbType === 'MONGODB';

    // Handle add new field mapping
    const handleAddFieldMapping = () => {
        const sourceFields = sourceNode?.data.fields || [];
        const targetFields = targetNode?.data.fields || [];

        const newMapping: FieldMapping = {
            sourceField: sourceFields[0]?.name || '',
            targetField: targetFields[0]?.name || '',
            relationshipType: '1:N',
            description: ''
        };

        setFieldMappings([...fieldMappings, newMapping]);
    };

    // Handle remove field mapping
    const handleRemoveFieldMapping = (index: number) => {
        const updated = fieldMappings.filter((_, i) => i !== index);
        setFieldMappings(updated);
    };

    // Handle update field mapping
    const handleUpdateFieldMapping = (index: number, updates: Partial<FieldMapping>) => {
        const updated = [...fieldMappings];
        updated[index] = { ...updated[index], ...updates };
        setFieldMappings(updated);
    };

    // Handle save
    const handleSave = () => {
        if (fieldMappings.length === 0) {
            // If no field mappings, delete the edge
            deleteEdge(edge.id);
            onClose();
            return;
        }

        const updatedData: Partial<EnhancedEdgeData> = {
            fieldMappings,
            relationshipName,
            relationshipType,
            constraints: isMongo ? undefined : {
                onDelete,
                onUpdate
            },
            showFields: true,
            showCardinality: true
        };

        updateEdgeData(edge.id, updatedData);
        onClose();
    };

    // Handle delete entire relationship
    const handleDeleteRelationship = () => {
        if (confirm('Are you sure you want to delete this entire relationship?')) {
            deleteEdge(edge.id);
            onClose();
        }
    };

    // Theme Logic for Relationship Editor
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
                    card: 'bg-slate-800 border-slate-700',
                    button: 'border-slate-600 text-slate-300 hover:bg-slate-800',
                    icon: 'text-slate-400',
                    dangerBtn: 'text-red-400 hover:text-red-300',
                    infoBox: 'bg-blue-900/20 border-blue-800 text-blue-200'
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
                    card: 'bg-cyan-50/30 border-cyan-100 hover:border-cyan-300',
                    button: 'border-cyan-200 text-cyan-700 hover:bg-cyan-50',
                    icon: 'text-cyan-400',
                    dangerBtn: 'text-red-500 hover:text-red-600',
                    infoBox: 'bg-cyan-50 border-cyan-200 text-cyan-900'
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
                    card: 'bg-orange-50/30 border-orange-100 hover:border-orange-300',
                    button: 'border-orange-200 text-orange-700 hover:bg-orange-50',
                    icon: 'text-orange-400',
                    dangerBtn: 'text-red-500 hover:text-red-600',
                    infoBox: 'bg-orange-50 border-orange-200 text-orange-900'
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
                    card: 'bg-gray-50 border-gray-200 hover:border-blue-300',
                    button: 'border-gray-200 text-gray-700 hover:bg-gray-50',
                    icon: 'text-gray-400 hover:text-gray-600',
                    dangerBtn: 'text-red-500 hover:text-red-700',
                    infoBox: 'bg-blue-50 border-blue-200 text-blue-900'
                };
        }
    };

    const styles = getThemeStyles();

    if (!sourceNode || !targetNode) {
        return null;
    }

    const sourceFields = sourceNode.data.fields || [];
    const targetFields = targetNode.data.fields || [];

    return (
        <div className={cn("fixed inset-0 flex items-center justify-center z-50 p-4", styles.overlay)}>
            <div className={cn("rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300", styles.modal)}>
                {/* Header */}
                <div className={cn("px-6 py-4 border-b flex items-center justify-between", styles.header)}>
                    <h2 className={cn("text-xl font-bold", styles.text)}>Edit Relationship</h2>
                    <button
                        onClick={onClose}
                        className={cn("transition", styles.icon)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className={cn("flex-1 overflow-y-auto px-6 py-4 space-y-6", styles.content)}>
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className={cn("block text-sm font-medium mb-1", styles.text)}>
                                Relationship Name
                            </label>
                            <input
                                type="text"
                                value={relationshipName}
                                onChange={(e) => setRelationshipName(e.target.value)}
                                className={cn("w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2", styles.input)}
                                placeholder="e.g., student-class"
                            />
                        </div>

                        <div>
                            <label className={cn("block text-sm font-medium mb-1", styles.text)}>
                                Relationship Type
                            </label>
                            <select
                                value={relationshipType}
                                onChange={(e) => setRelationshipType(e.target.value as any)}
                                className={cn("w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2", styles.input)}
                            >
                                <option value="one-to-one">One to One (1:1)</option>
                                <option value="one-to-many">One to Many (1:N)</option>
                                <option value="many-to-many">Many to Many (N:M)</option>
                            </select>
                        </div>
                    </div>

                    {/* Field Mappings */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className={cn("text-lg font-semibold", styles.text)}>Field Mappings</h3>
                            <Button
                                onClick={handleAddFieldMapping}
                                size="sm"
                                className={cn("flex items-center gap-1 transition-colors", styles.button)}
                            >
                                <Plus className="w-4 h-4" />
                                Add Mapping
                            </Button>
                        </div>

                        {fieldMappings.length === 0 ? (
                            <div className={cn("text-center py-8 rounded-lg border-2 border-dashed", styles.subText, styles.card)}>
                                <p className="text-sm">No field mappings yet.</p>
                                <p className="text-xs mt-1">Click "Add Mapping" to create one.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {fieldMappings.map((mapping, index) => (
                                    <div
                                        key={index}
                                        className={cn("p-4 rounded-lg border transition", styles.card)}
                                    >
                                        <div className="flex items-center gap-3">
                                            {/* Source Field */}
                                            <div className="flex-1">
                                                <label className={cn("block text-xs font-medium mb-1 opacity-75", styles.text)}>
                                                    {sourceNode.data.label}
                                                </label>
                                                <select
                                                    value={mapping.sourceField}
                                                    onChange={(e) => handleUpdateFieldMapping(index, {
                                                        sourceField: e.target.value
                                                    })}
                                                    className={cn("w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2", styles.input)}
                                                >
                                                    {sourceFields.map(field => (
                                                        <option key={field.id} value={field.name}>
                                                            {field.name} ({field.type})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Arrow & Type */}
                                            <div className="flex flex-col items-center">
                                                <span className={cn("text-xs mb-1", styles.subText)}>→</span>
                                                <select
                                                    value={mapping.relationshipType}
                                                    onChange={(e) => handleUpdateFieldMapping(index, {
                                                        relationshipType: e.target.value as any
                                                    })}
                                                    className={cn("px-2 py-1 text-xs border rounded focus:outline-none focus:ring-2", styles.input)}
                                                >
                                                    <option value="1:1">1:1</option>
                                                    <option value="1:N">1:N</option>
                                                    <option value="N:M">N:M</option>
                                                </select>
                                            </div>

                                            {/* Target Field */}
                                            <div className="flex-1">
                                                <label className={cn("block text-xs font-medium mb-1 opacity-75", styles.text)}>
                                                    {targetNode.data.label}
                                                </label>
                                                <select
                                                    value={mapping.targetField}
                                                    onChange={(e) => handleUpdateFieldMapping(index, {
                                                        targetField: e.target.value
                                                    })}
                                                    className={cn("w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2", styles.input)}
                                                >
                                                    {targetFields.map(field => (
                                                        <option key={field.id} value={field.name}>
                                                            {field.name} ({field.type})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveFieldMapping(index)}
                                                className={cn("transition p-2 rounded hover:bg-opacity-10 hover:bg-red-500", styles.dangerBtn)}
                                                title="Remove this field mapping"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Description (optional) */}
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                value={mapping.description || ''}
                                                onChange={(e) => handleUpdateFieldMapping(index, {
                                                    description: e.target.value
                                                })}
                                                placeholder="Optional description for this mapping..."
                                                className={cn("w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1", styles.input)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SQL Constraints */}
                    {!isMongo && (
                        <div className={cn("space-y-3 pt-4 border-t", styles.header)}>
                            <h3 className={cn("text-lg font-semibold", styles.text)}>SQL Constraints</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={cn("block text-sm font-medium mb-1", styles.text)}>
                                        ON DELETE
                                    </label>
                                    <select
                                        value={onDelete}
                                        onChange={(e) => setOnDelete(e.target.value as any)}
                                        className={cn("w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2", styles.input)}
                                    >
                                        <option value="NO ACTION">NO ACTION</option>
                                        <option value="CASCADE">CASCADE</option>
                                        <option value="SET NULL">SET NULL</option>
                                        <option value="RESTRICT">RESTRICT</option>
                                    </select>
                                    <p className={cn("text-xs mt-1", styles.subText)}>
                                        Action when parent record is deleted
                                    </p>
                                </div>

                                <div>
                                    <label className={cn("block text-sm font-medium mb-1", styles.text)}>
                                        ON UPDATE
                                    </label>
                                    <select
                                        value={onUpdate}
                                        onChange={(e) => setOnUpdate(e.target.value as any)}
                                        className={cn("w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2", styles.input)}
                                    >
                                        <option value="NO ACTION">NO ACTION</option>
                                        <option value="CASCADE">CASCADE</option>
                                        <option value="SET NULL">SET NULL</option>
                                        <option value="RESTRICT">RESTRICT</option>
                                    </select>
                                    <p className={cn("text-xs mt-1", styles.subText)}>
                                        Action when parent record is updated
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MongoDB Info */}
                    {isMongo && (
                        <div className={cn("rounded-lg p-4 border", styles.infoBox)}>
                            <h3 className="text-sm font-semibold mb-2">MongoDB Reference</h3>
                            <p className="text-xs opacity-90">
                                Field mappings will be exported as ObjectId references. Use populate() or $lookup for querying.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={cn("px-6 py-4 border-t flex items-center justify-between", styles.footer)}>
                    <Button
                        onClick={handleDeleteRelationship}
                        variant="destructive"
                        className="flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete Relationship
                    </Button>

                    <div className="flex gap-2">
                        <Button onClick={onClose} variant="outline" className={cn("transition-colors", styles.button)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
