'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users } from 'lucide-react';

interface CreateTeamDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
}

export default function CreateTeamDialog({ open, onClose, onSubmit }: CreateTeamDialogProps) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name);
        setName('');
        onClose();
    };

    if (!open) return null;

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6 z-50 animate-in zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0">
                    <div className="flex items-center justify-between mb-4">
                        <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Create Team Workspace
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                <X className="w-4 h-4" />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                                Team Name
                            </label>
                            <Input
                                id="teamName"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Acme Engineering"
                                autoFocus
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This will create a new workspace for your team to collaborate.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
