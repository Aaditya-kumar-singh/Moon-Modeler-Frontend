'use client';

import { useTeamStore } from '../stores/teamStore';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Check, Plus, UserCircle, Briefcase } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';

export default function TeamSwitcher({ onCreateTeam }: { onCreateTeam: () => void }) {
    const { teams, currentTeam, switchTeam, fetchTeams } = useTeamStore();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-between shadow-sm border-slate-200">
                    <div className="flex items-center gap-2 truncate">
                        {currentTeam ? (
                            <Briefcase className="w-4 h-4 text-blue-600" />
                        ) : (
                            <UserCircle className="w-4 h-4 text-slate-500" />
                        )}
                        <span className="truncate">{currentTeam?.name || 'Personal Workspace'}</span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px] p-0">
                <DropdownMenuLabel className="text-xs text-slate-500 font-normal px-2 py-1.5">
                    Personal Account
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onSelect={() => switchTeam(null)}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-100">
                        <UserCircle className="w-4 h-4" />
                    </div>
                    <span>Personal</span>
                    {!currentTeam && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-xs text-slate-500 font-normal px-2 py-1.5">
                    Teams
                </DropdownMenuLabel>
                {teams.filter(t => t && t.id).map((team) => (
                    <DropdownMenuItem
                        key={team.id}
                        onSelect={() => switchTeam(team.id)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="flex items-center justify-center w-6 h-6 rounded bg-blue-100 text-blue-700 font-bold text-xs">
                            {(team.name || '?').substring(0, 1).toUpperCase()}
                        </div>
                        <span className="truncate">{team.name}</span>
                        {currentTeam?.id === team.id && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem onSelect={onCreateTeam} className="cursor-pointer text-blue-600 focus:text-blue-700 bg-blue-50/50 hover:bg-blue-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
