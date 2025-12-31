'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useCanvasStore } from '../stores/canvasStore';

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
    const theme = useCanvasStore(state => state.metadata.theme || 'default');

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

    // Theme Logic for Dialog
    const getThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return {
                    overlay: 'bg-black/70',
                    modal: 'bg-slate-800 border border-slate-700 shadow-2xl',
                    text: 'text-slate-100',
                    subText: 'text-slate-400',
                    input: 'bg-slate-900 border-slate-600 text-slate-200 placeholder:text-slate-500 focus:ring-blue-500',
                    closeBtn: 'text-slate-400 hover:text-slate-200',
                    button: 'border-slate-600 text-slate-200 hover:bg-slate-700'
                };
            case 'ocean':
                return {
                    overlay: 'bg-cyan-900/30 backdrop-blur-sm',
                    modal: 'bg-white border-2 border-cyan-100 shadow-xl',
                    text: 'text-cyan-900',
                    subText: 'text-cyan-600',
                    input: 'bg-cyan-50 border-cyan-200 text-cyan-900 placeholder:text-cyan-400 focus:ring-cyan-500',
                    closeBtn: 'text-cyan-400 hover:text-cyan-600',
                    button: 'border-cyan-200 text-cyan-700 hover:bg-cyan-50'
                };
            case 'sunset':
                return {
                    overlay: 'bg-orange-900/30 backdrop-blur-sm',
                    modal: 'bg-white border-2 border-orange-100 shadow-xl',
                    text: 'text-orange-900',
                    subText: 'text-orange-600',
                    input: 'bg-orange-50 border-orange-200 text-orange-900 placeholder:text-orange-400 focus:ring-orange-500',
                    closeBtn: 'text-orange-400 hover:text-orange-600',
                    button: 'border-orange-200 text-orange-700 hover:bg-orange-50'
                };
            default:
                return {
                    overlay: 'bg-black/50',
                    modal: 'bg-white shadow-xl',
                    text: 'text-gray-900',
                    subText: 'text-gray-500',
                    input: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400',
                    closeBtn: 'text-gray-400 hover:text-gray-600',
                    button: 'border-gray-200 text-gray-700 hover:bg-gray-50'
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <div className={cn("fixed inset-0 flex items-center justify-center z-50", styles.overlay)}>
            <div className={cn("rounded-lg max-w-md w-full p-6 transition-all duration-300", styles.modal)}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={cn("text-xl font-bold", styles.text)}>Import Database</h2>
                    <button onClick={onClose} className={cn("transition-colors", styles.closeBtn)}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="conn" className={cn("block text-sm font-medium mb-1", styles.text)}>
                            {dbType === 'MYSQL' ? 'MySQL Connection String' : 'MongoDB URI'}
                        </label>
                        <Input
                            id="conn"
                            value={connectionString}
                            onChange={(e) => setConnectionString(e.target.value)}
                            placeholder={dbType === 'MYSQL' ? 'mysql://user:pass@localhost:3306/db_name' : 'mongodb://localhost:27017/your_database_name'}
                            autoFocus
                            className={cn("transition-colors", styles.input)}
                        />
                        <p className={cn("text-xs mt-1", styles.subText)}>
                            Supports localhost. Ensure your database name is included in the URI.
                        </p>
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} className={cn("flex-1 transition-colors", styles.button)} disabled={isSubmitting}>
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
