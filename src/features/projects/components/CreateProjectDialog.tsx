'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface CreateProjectDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (name: string, dbType: 'MYSQL' | 'MONGODB') => Promise<void>;
}

export default function CreateProjectDialog({ open, onClose, onSubmit }: CreateProjectDialogProps) {
    const [name, setName] = useState('');
    const [dbType, setDbType] = useState<'MYSQL' | 'MONGODB'>('MYSQL');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Project name is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await onSubmit(name, dbType);
            setName('');
            setDbType('MYSQL');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create project');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                        </label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Database Design"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label htmlFor="dbType" className="block text-sm font-medium text-gray-700 mb-1">
                            Database Type
                        </label>
                        <select
                            id="dbType"
                            value={dbType}
                            onChange={(e) => setDbType(e.target.value as 'MYSQL' | 'MONGODB')}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                            <option value="MYSQL">MySQL</option>
                            <option value="MONGODB">MongoDB</option>
                        </select>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Project'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
