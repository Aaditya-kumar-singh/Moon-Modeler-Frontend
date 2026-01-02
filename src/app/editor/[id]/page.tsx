'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { projectsApi, Project } from '@/features/projects/api/projectsApi';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCanvasStore } from '@/features/editor/stores/canvasStore';
import { Loader2, Download, Database, Code, Search, Users } from 'lucide-react';
import MobileMenu from '@/features/editor/components/MobileMenu';
import { useTeamStore } from '@/features/teams/stores/teamStore';
import { cn } from '@/lib/utils/cn';

// Lazy load heavy components
const DiagramEditor = dynamic(() => import('@/features/editor/components/DiagramEditor'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-50 animate-pulse" />
});
const PropertiesPanel = dynamic(() => import('@/features/editor/components/PropertiesPanel'), { ssr: false });
const ImportDialog = dynamic(() => import('@/features/editor/components/ImportDialog'), { ssr: false });
const CodePreviewPanel = dynamic(() => import('@/features/editor/components/CodePreviewPanel'), { ssr: false });
const ShareProjectDialog = dynamic(() => import('@/features/projects/components/ShareProjectDialog'), { ssr: false });

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importOpen, setImportOpen] = useState(false);
    const [codePreviewOpen, setCodePreviewOpen] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    // const [showInviteDialog, setShowInviteDialog] = useState(false);
    // const [showMembersDialog, setShowMembersDialog] = useState(false);
    const { currentTeam } = useTeamStore();

    // Single declaration
    const { metadata } = useCanvasStore();

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

    // Theme Logic for App Shell
    const getThemeStyles = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'dark':
                return {
                    container: 'bg-slate-900',
                    toolbar: 'bg-slate-900 border-slate-700',
                    text: 'text-slate-100',
                    subText: 'text-slate-400',
                    border: 'border-slate-700',
                    input: 'bg-slate-800 border-slate-600 text-slate-200 focus:ring-blue-500 hover:bg-slate-700',
                    button: 'border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white',
                    icon: 'text-slate-400'
                };
            case 'ocean':
                return {
                    container: 'bg-cyan-50/30',
                    toolbar: 'bg-white border-cyan-100',
                    text: 'text-cyan-900',
                    subText: 'text-cyan-600',
                    border: 'border-cyan-100',
                    input: 'bg-cyan-50 border-cyan-200 text-cyan-900 focus:ring-cyan-500 hover:bg-white',
                    button: 'border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-900',
                    icon: 'text-cyan-400'
                };
            case 'sunset':
                return {
                    container: 'bg-orange-50/30',
                    toolbar: 'bg-white border-orange-100',
                    text: 'text-orange-900',
                    subText: 'text-orange-600',
                    border: 'border-orange-100',
                    input: 'bg-orange-50 border-orange-200 text-orange-900 focus:ring-orange-500 hover:bg-white',
                    button: 'border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-900',
                    icon: 'text-orange-400'
                };
            default:
                return {
                    container: 'bg-white',
                    toolbar: 'bg-white border-gray-200',
                    text: 'text-gray-900',
                    subText: 'text-gray-500',
                    border: 'border-gray-200',
                    input: 'bg-gray-50 border-gray-200 text-gray-700 focus:ring-blue-500 hover:bg-white',
                    button: 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                    icon: 'text-gray-400'
                };
        }
    };

    const styles = getThemeStyles();

    return (
        <div className={cn("h-screen flex flex-col transition-colors duration-300", styles.container)}>
            {/* Toolbar Header */}
            <div className={cn("h-14 border-b flex items-center px-4 justify-between transition-colors duration-300", styles.toolbar)}>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className={styles.text}>
                        <ArrowLeft className={cn("w-4 h-4 mr-2", styles.icon)} />
                        Back
                    </Button>
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md" />
                        <div>
                            <h1 className={cn("font-semibold transition-colors", styles.text)}>{project?.name}</h1>
                            <span className={cn("text-xs uppercase transition-colors", styles.subText)}>{project?.type}</span>
                        </div>
                    </div>
                </div>
                {/* Desktop Toolbar (Hidden on Mobile/Tablet) */}
                <div className="hidden lg:flex items-center gap-2">
                    <div className={cn("inline-flex items-center gap-2 mr-4 border-r pr-4", styles.border)}>
                        <select
                            className={cn("text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 transition-all cursor-pointer", styles.input)}
                            value={metadata?.theme || 'default'}
                            onChange={(e) => useCanvasStore.getState().setTheme(e.target.value)}
                            title="Theme"
                        >
                            <option value="default">Theme: Default</option>
                            <option value="ocean">Theme: Ocean</option>
                            <option value="sunset">Theme: Sunset</option>
                            <option value="dark">Theme: Dark</option>
                        </select>
                        <select
                            className={cn("text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 transition-all cursor-pointer", styles.input)}
                            value={metadata?.edgeStyle || 'step'}
                            onChange={(e) => useCanvasStore.getState().setEdgeStyle(e.target.value)}
                            title="Edge Style"
                        >
                            <option value="step">Lines: Step</option>
                            <option value="bezier">Lines: Bezier</option>
                            <option value="straight">Lines: Straight</option>
                        </select>
                    </div>

                    <div className="relative mr-4">
                        <Search className={cn("w-4 h-4 absolute left-2 top-1.5", styles.icon)} />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            className={cn("pl-8 pr-4 py-1 text-xs border rounded focus:outline-none focus:ring-1 transition-colors w-32 focus:w-48 xl:w-56 transition-all", styles.input)}
                            onChange={(e) => useCanvasStore.getState().setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Button variant="outline" size="sm" onClick={() => setCodePreviewOpen(!codePreviewOpen)} className={cn("mr-2 transition-colors", styles.button)}>
                        <Code className={cn("w-4 h-4 mr-2", styles.icon)} />
                        Code
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setImportOpen(true)} className={cn("mr-2 transition-colors", styles.button)}>
                        <Database className={cn("w-4 h-4 mr-2", styles.icon)} />
                        Import
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport} className={cn("mr-2 transition-colors", styles.button)}>
                        <Download className={cn("w-4 h-4 mr-2", styles.icon)} />
                        Export
                    </Button>

                    <Button variant="outline" size="sm" onClick={() => setShareOpen(true)} className={cn("mr-2 transition-colors", styles.button)}>
                        <Users className={cn("w-4 h-4 mr-2", styles.icon)} />
                        Share
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSave}
                        disabled={saving || (project as any)?.currentUserRole === 'VIEWER'}
                        className={cn("transition-colors", styles.button)}
                    >
                        {saving ? (
                            <>
                                <Loader2 className={cn("w-4 h-4 mr-2 animate-spin", styles.icon)} />
                                Saving...
                            </>
                        ) : 'Save'}
                    </Button>
                </div>

                {/* Mobile Menu (Visible on Mobile/Tablet) */}
                <MobileMenu
                    onImport={() => setImportOpen(true)}
                    onExport={handleExport}
                    onCode={() => setCodePreviewOpen(true)}
                    onShare={() => setShareOpen(true)}
                    onSave={handleSave}
                    saving={saving}
                    readOnly={(project as any)?.currentUserRole === 'VIEWER'}
                    styles={styles}
                />
            </div>


            <div className={cn("flex-1 relative overflow-hidden flex", styles.container)}>
                <div className="flex-1 relative">
                    <DiagramEditor
                        projectId={id}
                        readOnly={(project as any)?.currentUserRole === 'VIEWER'}
                        initialContent={{
                            ...project.content,
                            metadata: {
                                ...(project.content?.metadata || {}),
                                dbType: project.type
                            }
                        }}
                    />
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
            <CodePreviewPanel open={codePreviewOpen} onClose={() => setCodePreviewOpen(false)} />
            <ShareProjectDialog open={shareOpen} onClose={() => setShareOpen(false)} />
        </div >
    );
}
