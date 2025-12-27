'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectsStore } from '@/features/projects/stores/projectsStore';
import { Button } from '@/components/ui/button';
import { Plus, Database } from 'lucide-react';
import ProjectCard from '@/features/projects/components/ProjectCard';
import CreateProjectDialog from '@/features/projects/components/CreateProjectDialog';

export default function DashboardPage() {
    const router = useRouter();
    const { projects, fetchProjects, createProject, isLoading, error } = useProjectsStore();
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleProjectClick = (projectId: string) => {
        router.push(`/editor/${projectId}`);
    };

    const handleCreateProject = async (name: string, dbType: 'mysql' | 'mongodb') => {
        const project = await createProject(name, dbType);
        router.push(`/editor/${project.id}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Projects</h1>
                            <p className="text-gray-600">Design and manage your database schemas</p>
                        </div>
                        <Button onClick={() => setShowCreateDialog(true)} size="lg" className="shadow-lg">
                            <Plus className="w-5 h-5 mr-2" />
                            New Project
                        </Button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => handleProjectClick(project.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Dialog */}
            <CreateProjectDialog
                open={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onSubmit={handleCreateProject}
            />
        </div>
    );
}
