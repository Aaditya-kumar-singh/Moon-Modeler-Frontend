import { create } from 'zustand';
import { teamsApi, Team, TeamMember } from '../api/teamsApi';

interface TeamState {
    teams: Team[];
    currentTeam: Team | null; // null = Personal Workspace
    members: TeamMember[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTeams: () => Promise<void>;
    createTeam: (name: string) => Promise<void>;
    switchTeam: (teamId: string | null) => void;
    fetchMembers: (teamId: string) => Promise<void>;
    inviteMember: (email: string, role: TeamMember['role']) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
    teams: [],
    currentTeam: null,
    members: [],
    isLoading: false,
    error: null,

    fetchTeams: async () => {
        set({ isLoading: true, error: null });
        try {
            const teams = await teamsApi.list();
            set({ teams: Array.isArray(teams) ? teams : [], isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch teams:', error);
            set({
                teams: [], // Ensure teams is always an array
                error: error.response?.data?.error || 'Failed to load teams',
                isLoading: false
            });
        }
    },

    createTeam: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
            const newTeam = await teamsApi.create(name);
            set(state => ({
                teams: [...state.teams, newTeam],
                // Optionally switch to new team immediately
                currentTeam: newTeam,
                isLoading: false
            }));
            // Fetch members for the new team (just the creator)
            get().fetchMembers(newTeam.id);
        } catch (error: any) {
            set({ isLoading: false, error: error.message || 'Failed to create team' });
            throw error;
        }
    },

    switchTeam: (teamId: string | null) => {
        if (!teamId) {
            set({ currentTeam: null, members: [] });
            return;
        }
        const team = get().teams.find(t => t.id === teamId);
        if (team) {
            set({ currentTeam: team });
            get().fetchMembers(teamId);
        }
    },

    fetchMembers: async (teamId: string) => {
        if (!teamId || teamId === 'undefined') {
            console.warn('fetchMembers called with invalid ID:', teamId);
            return;
        }
        try {
            const members = await teamsApi.getMembers(teamId);
            set({ members });
        } catch (error) {
            console.error("Failed to fetch members", error);
        }
    },

    inviteMember: async (email: string, role: TeamMember['role']) => {
        const { currentTeam } = get();
        if (!currentTeam) return;

        try {
            await teamsApi.inviteMember(currentTeam.id, email, role);
            // Refresh members list
            get().fetchMembers(currentTeam.id);
        } catch (error: any) {
            throw error; // Let UI handle specific error
        }
    }
}));
