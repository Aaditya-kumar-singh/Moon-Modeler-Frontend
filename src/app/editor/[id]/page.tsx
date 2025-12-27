'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { projectsApi, Project } from '@/features/projects/api/projectsApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import DiagramEditor from '@/features/editor/components/DiagramEditor';
import PropertiesPanel from '@/features/editor/components/PropertiesPanel';
import ImportDialog from '@/features/editor/components/ImportDialog';
import { useCanvasStore } from '@/features/editor/stores/canvasStore';
import { Loader2, Download, Database } from 'lucide-react';

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importOpen, setImportOpen] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const content = useCanvasStore.getState().getDiagramContent();
            await projectsApi.update(id, { content });
        } catch (e) {
            console.error("Save failed", e);
            // Optionally add toast here
        } finally {
            setSaving(false);
        }
    };

    const handleImportSubmit = async (connectionString: string) => {
        if (!project) return;
        // 1. Get Imported Content
        const content = await projectsApi.importFromDb(project.type, connectionString);

        // 2. Update Local Store
        useCanvasStore.getState().setInitialContent(content);

        // 3. Save to Backend (Auto-save effect)
        await projectsApi.update(id, { content });

        // 4. Update Project State
        setProject(prev => prev ? { ...prev, content } : null);
    };

    const handleExport = async () => {
        try {
            await handleSave(); // Auto-save before export
            const { filename, content } = await projectsApi.export(id);
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Export failed", e);
            alert("Export failed. See console.");
        }
    };

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            try {
                setLoading(true);
                const data = await projectsApi.getById(id);
                setProject(data);
            } catch (e: any) {
                console.error(e);
                setError(e.message || 'Failed to load project');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Editor...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Project</h2>
                    <p className="text-gray-600 mb-6">{error || 'Project not found'}</p>
                    <Button onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-white">
            {/* Toolbar Header Placeholder */}
            <div className="h-14 border-b flex items-center px-4 justify-between bg-white">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="font-semibold text-gray-900">{project.name}</h1>
                        <span className="text-xs text-gray-500 uppercase">{project.type}</span>
                    </div>
                </div>
                <div>
                    {/* Toolbar Actions */}
                    <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className="mr-2">
                        <Database className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport} className="mr-2">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : 'Save'}
                    </Button>
                </div>
            </div>


            <div className="flex-1 bg-gray-50 relative overflow-hidden flex">
                <div className="flex-1 relative">
                    <DiagramEditor projectId={id} initialContent={{
                        ...project.content,
                        metadata: {
                            ...(project.content?.metadata || {}),
                            dbType: project.type
                        }
                    }} />
                </div>
                <PropertiesPanel />
            </div>


            {
                project && (
                    <ImportDialog
                        open={importOpen}
                        onClose={() => setImportOpen(false)}
                        onSubmit={handleImportSubmit}
                        dbType={project.type}
                    />
                )
            }
        </div >
    );
}
