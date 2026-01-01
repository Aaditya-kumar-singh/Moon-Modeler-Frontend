'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Users, Shield, User } from 'lucide-react';
import { useTeamStore } from '../stores/teamStore';

interface TeamMembersDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function TeamMembersDialog({ open, onClose }: TeamMembersDialogProps) {
    const { currentTeam, members, fetchMembers, isLoading } = useTeamStore();

    useEffect(() => {
        if (open && currentTeam) {
            fetchMembers(currentTeam.id);
        }
    }, [open, currentTeam, fetchMembers]);

    if (!open) return null;

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in" />
                <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-xl shadow-xl p-6 z-50 animate-in zoom-in-95 data-[state=closed]:zoom-out-95 data-[state=closed]:fade-out-0">
                    <div className="flex items-center justify-between mb-6">
                        <Dialog.Title className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            {currentTeam?.name} Members
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                <X className="w-4 h-4" />
                            </Button>
                        </Dialog.Close>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No members found.
                            </div>
                        ) : (
                            members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                                            {(member.name || member.email).substring(0, 1).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {member.name || 'Unknown Helper'}
                                            </p>
                                            <p className="text-xs text-gray-500 line-clamp-1">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded border text-xs font-medium text-gray-600">
                                        {member.role === 'OWNER' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                        {member.role}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
