'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (connectionString: string) => Promise<void>;
    dbType: 'MYSQL' | 'MONGODB';
}

export default function ImportDialog({ open, onClose, onSubmit, dbType }: ImportDialogProps) {
    const [connectionString, setConnectionString] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!connectionString.trim()) {
            setError('Connection string is required');
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit(connectionString);
            setConnectionString('');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Import failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Import Database</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="conn" className="block text-sm font-medium text-gray-700 mb-1">
                            {dbType === 'MYSQL' ? 'MySQL Connection String' : 'MongoDB URI'}
                        </label>
                        <Input
                            id="conn"
                            value={connectionString}
                            onChange={(e) => setConnectionString(e.target.value)}
                            placeholder={dbType === 'MYSQL' ? 'mysql://user:pass@host:3306/db' : 'mongodb://host:27017/db'}
                            autoFocus
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Use a read-only user if possible.
                        </p>
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? 'Importing...' : 'Import'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
