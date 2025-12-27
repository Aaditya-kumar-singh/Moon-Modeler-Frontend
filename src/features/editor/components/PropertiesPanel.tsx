'use client';

import { useCanvasStore } from '../stores/canvasStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, X } from 'lucide-react';
import { DataType } from '@/types/diagram';

export default function PropertiesPanel() {
    const {
        nodes,
        selectedNodeId,
        updateTableName,
        addField,
        deleteField,
        updateField,
        deleteNode,
        selectNode,
        snapshot // Undo/Redo snapshot
    } = useCanvasStore();

    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    // Terminology based on Node Type (mysqlTable vs mongoCollection)
    const isMongo = selectedNode?.type === 'mongoCollection';
    const terms = {
        entity: isMongo ? 'Collection' : 'Table',
        field: isMongo ? 'Field' : 'Column',
        fields: isMongo ? 'Fields' : 'Columns',
    };

    if (!selectedNode) {
        return (
            <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col items-center justify-center text-gray-400">
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

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden shadow-xl z-20">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-700">{terms.entity} Properties</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => selectNode(null)}
                    className="h-6 w-6 p-0"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Table/Collection Name */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{terms.entity} Name</label>
                    <div className="flex gap-2">
                        <Input
                            value={selectedNode.data.label}
                            onFocus={handleFocus}
                            onChange={(e) => updateTableName(selectedNodeId!, e.target.value)}
                            placeholder={isMongo ? 'users' : 'users'}
                            className="bg-gray-50 font-medium"
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
                </div>

                {/* Fields */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-gray-500 uppercase">{terms.fields}</label>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-xs"
                            onClick={() => addField(selectedNodeId!)}
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {selectedNode.data.fields && selectedNode.data.fields.map((field) => (
                            <div key={field.id} className="p-3 bg-gray-50 rounded-md border border-gray-100 group hover:border-blue-200 transition-colors">
                                {/* Top Row: Name & Delete */}
                                <div className="flex gap-2 mb-2">
                                    <Input
                                        value={field.name}
                                        onFocus={handleFocus}
                                        onChange={(e) => updateField(selectedNodeId!, field.id, { name: e.target.value })}
                                        className="h-7 text-sm bg-white"
                                        placeholder={terms.field.toLowerCase()}
                                    />
                                    <button
                                        className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        onClick={() => deleteField(selectedNodeId!, field.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Bottom Row: Type & Flags */}
                                <div className="flex gap-2 items-center">
                                    <select
                                        value={field.type}
                                        onFocus={handleFocus} // Capture state before changing dropdown
                                        onChange={(e) => updateField(selectedNodeId!, field.id, { type: e.target.value as DataType })}
                                        className="h-7 text-xs border border-gray-300 rounded px-1 bg-white flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {currentDataTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>

                                    <div className="flex gap-1">
                                        {!isMongo && (
                                            <>
                                                <button
                                                    title="Primary Key"
                                                    className={`p-1 rounded ${field.isPrimaryKey ? 'bg-yellow-100 text-yellow-600' : 'text-gray-300 hover:bg-gray-200'}`}
                                                    onClick={() => handleAtomicUpdate(() => updateField(selectedNodeId!, field.id, { isPrimaryKey: !field.isPrimaryKey }))}
                                                >
                                                    <span className="text-[10px] font-bold">PK</span>
                                                </button>
                                                <button
                                                    title="Foreign Key"
                                                    className={`p-1 rounded ${field.isForeignKey ? 'bg-blue-100 text-blue-600' : 'text-gray-300 hover:bg-gray-200'}`}
                                                    onClick={() => handleAtomicUpdate(() => updateField(selectedNodeId!, field.id, { isForeignKey: !field.isForeignKey }))}
                                                >
                                                    <span className="text-[10px] font-bold">FK</span>
                                                </button>
                                            </>
                                        )}
                                        <button
                                            title={isMongo ? "Optional" : "Nullable"}
                                            className={`p-1 rounded ${field.isNullable ? 'bg-purple-100 text-purple-600' : 'text-gray-300 hover:bg-gray-200'}`}
                                            onClick={() => handleAtomicUpdate(() => updateField(selectedNodeId!, field.id, { isNullable: !field.isNullable }))}
                                        >
                                            <span className="text-[10px] font-bold">?</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
