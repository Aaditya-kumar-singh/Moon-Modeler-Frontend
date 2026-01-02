'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectsStore } from '@/features/projects/stores/projectsStore';
import { Button } from '@/components/ui/button';
import { Plus, Database, UserPlus } from 'lucide-react';
import ProjectCard from '@/features/projects/components/ProjectCard';
import CreateProjectDialog from '@/features/projects/components/CreateProjectDialog';
import TeamSwitcher from '@/features/teams/components/TeamSwitcher';
import CreateTeamDialog from '@/features/teams/components/CreateTeamDialog';
import InviteMemberDialog from '@/features/teams/components/InviteMemberDialog';
import { useTeamStore } from '@/features/teams/stores/teamStore';

export default function DashboardPage() {
    const router = useRouter();
    const { projects, pagination, fetchProjects, createProject, isLoading, error } = useProjectsStore();
    const { currentTeam } = useTeamStore();
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
    const [showInviteDialog, setShowInviteDialog] = useState(false);

    useEffect(() => {
        // When team changes, we might want to fetch different projects
        // For now, mock it by just re-fetching
        fetchProjects();
    }, [fetchProjects, currentTeam]);

    const handleProjectClick = (projectId: string) => {
        router.push(`/editor/${projectId}`);
    };

    const handleCreateProject = async (name: string, dbType: 'MYSQL' | 'MONGODB') => {
        const project = await createProject(name, dbType);
        router.push(`/editor/${project.id}`);
    };

    const handleCreateTeam = async (name: string) => {
        const { createTeam } = useTeamStore.getState();
        await createTeam(name);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <div className="mb-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <div className="flex items-center gap-3">
                                <img src="/logo.png" alt="SchemaFlow" className="w-10 h-10 rounded-xl shadow-sm" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SchemaFlow</h1>
                                    <p className="text-slate-500 text-sm">Visual Database Design</p>
                                </div>
                            </div>

                            <div className="hidden md:block h-8 w-px bg-slate-200"></div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <TeamSwitcher onCreateTeam={() => setShowCreateTeamDialog(true)} />

                                {currentTeam && (
                                    <Button variant="ghost" size="sm" className="text-slate-500 shrink-0" onClick={() => setShowInviteDialog(true)}>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Invite</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {/* Temporarily disabled
                             <Button onClick={() => router.push('/pricing')} variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 hover:bg-yellow-100">
                                Upgrade to Pro
                             </Button>
                             */}
                            <Button onClick={() => setShowCreateDialog(true)} size="lg" className="shadow-lg bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto">
                                <Plus className="w-5 h-5 mr-2" />
                                New Project
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading projects...</p>
                    </div>
                ) : projects.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
                        <div className="inline-block p-6 bg-blue-50 rounded-full mb-4">
                            <Database className="w-16 h-16 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                            No projects yet
                        </h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Create your first database diagram to get started with visual schema design
                        </p>
                        <Button onClick={() => setShowCreateDialog(true)} size="lg">
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Project
                        </Button>
                    </div>
                ) : (
                    /* Projects Grid */
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map(project => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => handleProjectClick(project.id)}
                                />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 py-4">
                                <Button
                                    variant="outline"
                                    disabled={pagination.page <= 1}
                                    onClick={() => fetchProjects(pagination.page - 1)}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => fetchProjects(pagination.page + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <CreateProjectDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSubmit={handleCreateProject}
            />
            <CreateTeamDialog
                open={showCreateTeamDialog}
                onClose={() => setShowCreateTeamDialog(false)}
                onSubmit={handleCreateTeam}
            />
            <InviteMemberDialog
                open={showInviteDialog}
                onClose={() => setShowInviteDialog(false)}
            />
        </div>
    );
}
