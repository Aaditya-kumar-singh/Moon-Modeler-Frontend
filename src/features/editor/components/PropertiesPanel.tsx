'use client';

import { useState } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, X, Link2, Unlink, AlertCircle } from 'lucide-react';
import { DataType } from '@/types/diagram';
import { cn } from '@/lib/utils/cn';
import { validateTableName, validateFieldName } from '@/lib/utils/validate';

export default function PropertiesPanel() {
    const {
        nodes,
        edges,
        selectedNodeId,
        updateTableName,
        addField,
        deleteField,
        updateField,
        deleteNode,
        selectNode,
        onEdgesChange,
        snapshot, // Undo/Redo snapshot,
        metadata
    } = useCanvasStore();

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    // Terminology based on Node Type (mysqlTable vs mongoCollection)
    const isMongo = selectedNode?.type === 'mongoCollection';
    const terms = {
        entity: isMongo ? 'Collection' : 'Table',
        field: isMongo ? 'Field' : 'Column',
        fields: isMongo ? 'Fields' : 'Columns',
    };

    // Theme Logic for Side Panel
    // Helper to get consistent theme styles
    const getThemeStyles = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'dark':
                return {
                    container: 'bg-slate-900 border-slate-700',
                    header: 'bg-slate-900 border-slate-700',
                    text: 'text-slate-200',
                    subText: 'text-slate-400',
                    input: 'bg-slate-800 border-slate-600 text-slate-200 focus:ring-blue-500',
                    card: 'bg-slate-800 border-slate-700',
                    cardInput: 'bg-slate-900 border-slate-700 text-slate-200',
                    button: 'text-slate-400 hover:text-red-400',
                };
            case 'ocean':
                return {
                    container: 'bg-white border-cyan-100',
                    header: 'bg-cyan-50/50 border-cyan-100',
                    text: 'text-cyan-900',
                    subText: 'text-cyan-600',
                    input: 'bg-cyan-50 border-cyan-200 text-cyan-900 focus:ring-cyan-500',
                    card: 'bg-cyan-50/30 border-cyan-100',
                    cardInput: 'bg-white border-cyan-200 text-cyan-900',
                    button: 'text-cyan-400 hover:text-red-500',
                };
            case 'sunset':
                return {
                    container: 'bg-white border-orange-100',
                    header: 'bg-orange-50/50 border-orange-100',
                    text: 'text-orange-900',
                    subText: 'text-orange-600',
                    input: 'bg-orange-50 border-orange-200 text-orange-900 focus:ring-orange-500',
                    card: 'bg-orange-50/30 border-orange-100',
                    cardInput: 'bg-white border-orange-200 text-orange-900',
                    button: 'text-orange-400 hover:text-red-500',
                };
            default:
                return {
                    container: 'bg-white border-gray-200',
                    header: 'bg-gray-50 border-gray-100',
                    text: 'text-gray-700',
                    subText: 'text-gray-500',
                    input: 'bg-gray-50 border-gray-200 font-medium text-gray-900',
                    card: 'bg-gray-50 border-gray-100',
                    cardInput: 'bg-white border-gray-200 text-sm',
                    button: 'text-gray-400 hover:text-red-500',
                };
        }
    };

    const styles = getThemeStyles();

    if (!selectedNode) {
        return (
            <div className={cn(
                "hidden md:flex w-80 h-full border-l p-6 flex-col items-center justify-center transition-colors duration-300",
                styles.container,
                styles.subText
            )}>
                <p>Select a {terms.entity.toLowerCase()} to edit properties</p>
            </div>
        );
    }

    const dataTypesMysql: DataType[] = [
        'INT', 'BIGINT', 'TINYINT', 'DECIMAL', 'FLOAT', 'DOUBLE',
        'VARCHAR', 'CHAR', 'TEXT', 'LONGTEXT', 'BOOLEAN',
        'DATE', 'DATETIME', 'TIMESTAMP',
        'JSON', 'ENUM', 'BLOB'
    ];

    const dataTypesMongo: DataType[] = [
        'ObjectId', 'String', 'Number', 'Boolean', 'Date',
        'Array', 'Object', 'Decimal128', 'Map', 'Buffer', 'UUID'
    ];

    const currentDataTypes = isMongo ? dataTypesMongo : dataTypesMysql;

    // Helper to snapshot only on interaction start for inputs
    const handleFocus = () => {
        snapshot();
    };

    // Helper for atomic updates (select/buttons)
    const handleAtomicUpdate = (action: () => void) => {
        snapshot();
        action();
    };

    // Helper to find connections for a specific field
    const getFieldConnections = (nodeId: string, fieldName: string) => {
        const connections = edges.filter(edge => {
            // Check if edge involves this node
            const isFromThisNode = edge.source === nodeId;
            const isToThisNode = edge.target === nodeId;

            if (!isFromThisNode && !isToThisNode) return false;

            // Check if field name is in the handle ID
            const sourceHasField = edge.sourceHandle?.includes(`-${fieldName}-`);
            const targetHasField = edge.targetHandle?.includes(`-${fieldName}-`);

            return (isFromThisNode && sourceHasField) || (isToThisNode && targetHasField);
        });
        return connections;
    };

    // Remove all connections for a specific field
    const removeFieldConnections = (nodeId: string, fieldName: string) => {
        const fieldConnections = getFieldConnections(nodeId, fieldName);


        if (fieldConnections.length > 0) {
            snapshot();
            onEdgesChange(
                fieldConnections.map(edge => ({
                    type: 'remove',
                    id: edge.id
                }))
            );
        }
    };

    const handleTableNameChange = (val: string) => {
        const { isValid, error } = validateTableName(val);
        setErrors(prev => ({ ...prev, tableName: isValid ? '' : error! }));
        updateTableName(selectedNodeId!, val);
    };

    const handleFieldNameChange = (fieldId: string, val: string) => {
        const { isValid, error } = validateFieldName(val);
        setErrors(prev => ({ ...prev, [fieldId]: isValid ? '' : error! }));
        updateField(selectedNodeId!, fieldId, { name: val });
    };

    return (
        <div className={cn(
            "fixed inset-x-0 bottom-0 h-[60vh] md:static md:h-full md:w-80 border-t md:border-t-0 md:border-l flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-xl z-40 transition-colors duration-300",
            styles.container
        )}>
            {/* Header */}
            <div className={cn("p-4 border-b flex items-center justify-between transition-colors", styles.header)}>
                <h3 className={cn("font-semibold text-sm", styles.text)}>{terms.entity} Properties</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectNode(null)}
                    className={cn("h-6 w-6 p-0", styles.button)}
                    aria-label="Close properties panel"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Table/Collection Name */}
                <div className="space-y-2">
                    <label className={cn("text-xs font-semibold uppercase", styles.subText)}>{terms.entity} Name</label>
                    <div className="flex gap-2">
                        <Input
                            value={selectedNode.data.label}
                            onFocus={handleFocus}
                            onChange={(e) => handleTableNameChange(e.target.value)}
                            placeholder={isMongo ? 'users' : 'users'}
                            className={cn(
                                "font-medium transition-colors",
                                styles.input,
                                errors.tableName && "border-red-500 ring-red-500 focus:ring-red-500"
                            )}
                        />
                        <Button
                            variant="destructive"
                            size="sm"
                            className="px-2"
                            onClick={() => deleteNode(selectedNodeId!)}
                            title={`Delete ${terms.entity}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    {errors.tableName && (
                        <p className="text-[10px] text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.tableName}
                        </p>
                    )}
                </div>

                {/* Fields */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className={cn("text-xs font-semibold uppercase", styles.subText)}>{terms.fields}</label>
                        <Button
                            size="sm"
                            variant="outline"
                            className={cn("h-6 text-xs transition-colors", styles.button, styles.card)}
                            onClick={() => addField(selectedNodeId!)}
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {selectedNode.data.fields && selectedNode.data.fields.map((field) => {
                            const fieldConnections = getFieldConnections(selectedNodeId!, field.name);
                            const hasConnections = fieldConnections.length > 0;
                            const fieldError = errors[field.id];

                            return (
                                <div key={field.id} className={cn("p-3 rounded-md border group transition-colors", styles.card)}>
                                    {/* Top Row: Name & Actions */}
                                    <div className="flex gap-2 mb-2">
                                        <Input
                                            value={field.name}
                                            onFocus={handleFocus}
                                            onChange={(e) => handleFieldNameChange(field.id, e.target.value)}
                                            className={cn(
                                                "h-7 text-sm flex-1 transition-colors",
                                                styles.cardInput,
                                                fieldError && "border-red-500 ring-red-500 focus:ring-red-500"
                                            )}
                                            placeholder={terms.field.toLowerCase()}
                                        />

                                        {/* Connection Indicator & Remove Button */}
                                        {hasConnections && (
                                            <button
                                                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors whitespace-nowrap"
                                                onClick={() => removeFieldConnections(selectedNodeId!, field.name)}
                                                title={`Remove ${fieldConnections.length} connection(s)`}
                                            >
                                                <Link2 className="w-3 h-3" />
                                                <span>{fieldConnections.length}</span>
                                                <Unlink className="w-3 h-3" />
                                            </button>
                                        )}

                                        <button
                                            className={cn("transition-colors opacity-0 group-hover:opacity-100", styles.button)}
                                            onClick={() => deleteField(selectedNodeId!, field.id)}
                                            title="Delete field"
                                            aria-label="Delete field"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {fieldError && (
                                        <p className="text-[10px] text-red-500 mb-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {fieldError}
                                        </p>
                                    )}

                                    {/* Bottom Row: Type & Flags */}
                                    <div className="flex gap-2 items-center">
                                        <select
                                            value={field.type}
                                            onFocus={handleFocus}
                                            onChange={(e) => updateField(selectedNodeId!, field.id, { type: e.target.value as DataType })}
                                            className={cn("h-7 text-xs border rounded px-1 flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors", styles.cardInput)}
                                        >
                                            {currentDataTypes.map(t => <option key={t} value={t} className="bg-white text-gray-900 dark:bg-slate-800 dark:text-slate-200">{t}</option>)}
                                        </select>

                                        <div className="flex gap-1">
                                            {!isMongo && (
                                                <>
                                                    <button
                                                        title="Primary Key"
                                                        className={`p-1 rounded ${field.isPrimaryKey ? 'bg-yellow-100 text-yellow-600' : (metadata?.theme === 'dark' ? 'text-slate-600 hover:bg-slate-700' : 'text-gray-300 hover:bg-gray-200')}`}
                                                        onClick={() => handleAtomicUpdate(() => updateField(selectedNodeId!, field.id, { isPrimaryKey: !field.isPrimaryKey }))}
                                                    >
                                                        <span className="text-[10px] font-bold">PK</span>
                                                    </button>
                                                    <button
                                                        title="Foreign Key"
                                                        className={`p-1 rounded ${field.isForeignKey ? 'bg-blue-100 text-blue-600' : (metadata?.theme === 'dark' ? 'text-slate-600 hover:bg-slate-700' : 'text-gray-300 hover:bg-gray-200')}`}
                                                        onClick={() => handleAtomicUpdate(() => updateField(selectedNodeId!, field.id, { isForeignKey: !field.isForeignKey }))}
                                                    >
                                                        <span className="text-[10px] font-bold">FK</span>
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                title={isMongo ? "Optional" : "Nullable"}
                                                className={`p-1 rounded ${field.isNullable ? 'bg-purple-100 text-purple-600' : (metadata?.theme === 'dark' ? 'text-slate-600 hover:bg-slate-700' : 'text-gray-300 hover:bg-gray-200')}`}
                                                onClick={() => handleAtomicUpdate(() => updateField(selectedNodeId!, field.id, { isNullable: !field.isNullable }))}
                                            >
                                                <span className="text-[10px] font-bold">?</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
