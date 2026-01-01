'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@radix-ui/react-dialog';
import { X, UserPlus, Mail } from 'lucide-react';
import { useTeamStore } from '../stores/teamStore';

interface InviteMemberDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function InviteMemberDialog({ open, onClose }: InviteMemberDialogProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { inviteMember, currentTeam } = useTeamStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await inviteMember(email, 'VIEWER'); // Default role
            setEmail('');
            onClose();
            alert(`Invitation sent to ${email}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to invite member');
        } finally {
            setIsLoading(false);
        }
    };

    if (!open) return null;

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6 z-50 animate-in zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                            Invite to {currentTeam?.name}
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                <X className="w-4 h-4" />
                            </Button>
                        </Dialog.Close>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="pl-9"
                                    autoFocus
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isLoading ? 'Inviting...' : 'Send Invite'}
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
