'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, UserPlus, Trash2, Shield, Eye, Edit3 } from 'lucide-react';
import { projectsApi, Collaborator } from '@/features/projects/api/projectsApi';
import { useParams } from 'next/navigation';

interface ShareProjectDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function ShareProjectDialog({ open, onClose }: ShareProjectDialogProps) {
    const params = useParams();
    const projectId = params?.id as string;

    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
    const [loading, setLoading] = useState(false);
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCollaborators = async () => {
        if (!projectId) return;
        setFetching(true);
        try {
            const data = await projectsApi.getCollaborators(projectId);
            setCollaborators(data);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchCollaborators();
        }
    }, [open, projectId]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError(null);
        try {
            await projectsApi.share(projectId, email, role);
            setEmail('');
            fetchCollaborators(); // Refresh list
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to invite user');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm('Remove this collaborator?')) return;
        try {
            await projectsApi.removeCollaborator(projectId, userId);
            fetchCollaborators();
        } catch (err) {
            console.error('Failed to remove', err);
        }
    };

    if (!open) return null;

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6 z-50 animate-in zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Share Project
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                <X className="w-4 h-4" />
                            </Button>
                        </Dialog.Close>
                    </div>

                    {/* Invite Form */}
                    <form onSubmit={handleInvite} className="space-y-4 mb-6">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter email address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-1"
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                className="border rounded-md px-2 text-sm bg-white"
                            >
                                <option value="VIEWER">Viewer</option>
                                <option value="EDITOR">Editor</option>
                            </select>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                            {loading ? 'Sending...' : 'Send Invite'}
                        </Button>
                    </form>

                    {/* Collaborators List */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Collaborators</h3>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                            {fetching ? (
                                <div className="text-center py-4 text-xs text-gray-400">Loading...</div>
                            ) : collaborators.length === 0 ? (
                                <div className="text-center py-4 text-sm text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    No collaborators yet.
                                </div>
                            ) : (
                                collaborators.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                                {(c.user.name || c.user.email || '?').substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {c.user.name || 'User'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {c.user.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600 font-medium">
                                                {c.role}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(c.userId)}
                                                className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Done
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
