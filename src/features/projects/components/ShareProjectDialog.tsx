'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, UserPlus, Trash2, Shield, Eye, Edit3 } from 'lucide-react';
import { projectsApi, Collaborator } from '@/features/projects/api/projectsApi';
import { useParams } from 'next/navigation';
import { useCanvasStore } from '@/features/editor/stores/canvasStore';
import { cn } from '@/lib/utils/cn';

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

    const { metadata } = useCanvasStore();
    const theme = metadata?.theme || 'default';

    const getThemeStyles = () => {
        switch (theme) {
            case 'dark':
                return {
                    content: 'bg-slate-900 border border-slate-700 text-slate-200',
                    title: 'text-slate-100',
                    text: 'text-slate-300',
                    subText: 'text-slate-400',
                    input: 'bg-slate-800 border-slate-700 text-slate-200 focus:ring-blue-500',
                    buttonPrimary: 'bg-blue-600 hover:bg-blue-500 text-white',
                    buttonSecondary: 'hover:bg-slate-800 text-slate-400',
                    listBg: 'bg-slate-800/50 border-slate-700',
                    badge: 'bg-slate-800 text-slate-300',
                    avatar: 'bg-slate-700 text-slate-300',
                    select: 'bg-slate-800 border-slate-700 text-slate-200'
                };
            case 'ocean':
                return {
                    content: 'bg-cyan-50 border border-cyan-200 text-cyan-900',
                    title: 'text-cyan-900',
                    text: 'text-cyan-800',
                    subText: 'text-cyan-600',
                    input: 'bg-white border-cyan-200 text-cyan-900 focus:ring-cyan-500',
                    buttonPrimary: 'bg-cyan-600 hover:bg-cyan-700 text-white',
                    buttonSecondary: 'hover:bg-cyan-100 text-cyan-600',
                    listBg: 'bg-white border-cyan-100',
                    badge: 'bg-cyan-100 text-cyan-700',
                    avatar: 'bg-cyan-200 text-cyan-800',
                    select: 'bg-white border-cyan-200 text-cyan-900'
                };
            case 'sunset':
                return {
                    content: 'bg-orange-50 border border-orange-200 text-orange-900',
                    title: 'text-orange-900',
                    text: 'text-orange-800',
                    subText: 'text-orange-600',
                    input: 'bg-white border-orange-200 text-orange-900 focus:ring-orange-500',
                    buttonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
                    buttonSecondary: 'hover:bg-orange-100 text-orange-600',
                    listBg: 'bg-white border-orange-100',
                    badge: 'bg-orange-100 text-orange-700',
                    avatar: 'bg-orange-200 text-orange-800',
                    select: 'bg-white border-orange-200 text-orange-900'
                };
            default:
                return {
                    content: 'bg-white text-gray-900',
                    title: 'text-gray-900',
                    text: 'text-gray-700',
                    subText: 'text-gray-500',
                    input: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500',
                    buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
                    buttonSecondary: 'hover:bg-gray-100 text-gray-500',
                    listBg: 'bg-gray-50 border-gray-200',
                    badge: 'bg-gray-100 text-gray-600',
                    avatar: 'bg-indigo-100 text-indigo-700',
                    select: 'bg-white border-gray-300 text-gray-900'
                };
        }
    };

    const styles = getThemeStyles();

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
                <Dialog.Content className={cn(
                    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl shadow-xl p-6 z-50 animate-in zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0",
                    styles.content
                )}>
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className={cn("text-xl font-semibold flex items-center gap-2", styles.title)}>
                            <Users className="w-5 h-5" />
                            Share Project
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0 rounded-full", styles.buttonSecondary)}>
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
                                className={cn("flex-1", styles.input)}
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value as any)}
                                className={cn("border rounded-md px-2 text-sm", styles.select)}
                            >
                                <option value="VIEWER">Viewer</option>
                                <option value="EDITOR">Editor</option>
                            </select>
                        </div>
                        <Button type="submit" disabled={loading} className={cn("w-full transition-colors", styles.buttonPrimary)}>
                            {loading ? 'Sending...' : 'Send Invite'}
                        </Button>
                    </form>

                    {/* Collaborators List */}
                    <div className={cn("border-t pt-4", theme === 'dark' ? 'border-slate-700' : 'border-gray-200')}>
                        <h3 className={cn("text-sm font-medium mb-3", styles.subText)}>Collaborators</h3>
                        <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                            {fetching ? (
                                <div className={cn("text-center py-4 text-xs", styles.subText)}>Loading...</div>
                            ) : collaborators.length === 0 ? (
                                <div className={cn("text-center py-4 text-sm rounded-lg border border-dashed", styles.subText, styles.listBg)}>
                                    No collaborators yet.
                                </div>
                            ) : (
                                collaborators.map((c) => (
                                    <div key={c.id} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs", styles.avatar)}>
                                                {(c.user.name || c.user.email || '?').substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className={cn("text-sm font-medium", styles.text)}>
                                                    {c.user.name || 'User'}
                                                </div>
                                                <div className={cn("text-xs", styles.subText)}>
                                                    {c.user.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-xs px-2 py-0.5 rounded font-medium", styles.badge)}>
                                                {c.role}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(c.userId)}
                                                className={cn("h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity", styles.buttonSecondary)}
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
                        <Button variant="outline" onClick={onClose} className={styles.input}>
                            Done
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
