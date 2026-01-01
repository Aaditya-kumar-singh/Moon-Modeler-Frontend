'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Database, Code, Search } from 'lucide-react';
import DiagramEditor from '@/features/editor/components/DiagramEditor';
import PropertiesPanel from '@/features/editor/components/PropertiesPanel';
import ImportDialog from '@/features/editor/components/ImportDialog';
import { useCanvasStore } from '@/features/editor/stores/canvasStore';
import CodePreviewPanel from '@/features/editor/components/CodePreviewPanel';
import { cn } from '@/lib/utils/cn';

// Local Editor Page - No Cloud Persistence
export default function LocalEditorPage() {
    const router = useRouter();
    const [importOpen, setImportOpen] = useState(false);
    const [codePreviewOpen, setCodePreviewOpen] = useState(false);

    // We use a fixed ID for local storage persistence if we wanted to implement it later
    // For now, it's ephemeral or we could wire it to localStorage
    const LOCAL_PROJECT_ID = 'local-draft';

    const { metadata } = useCanvasStore();

    // Initialize blank state on mount
    useEffect(() => {
        useCanvasStore.getState().setInitialContent({
            nodes: [],
            edges: [],
            metadata: { version: 1, dbType: 'MYSQL', theme: 'default' }
        });
        useCanvasStore.getState().setProjectId(LOCAL_PROJECT_ID);
    }, []);

    const handleImportSubmit = async (connectionString: string) => {
        // Mock import or reuse existing logic if it doesn't strictly depend on Backend API
        // actually projectsApi.importFromDb calls backend.
        // For local mode, we might need a separate endpoint or just warn user.
        alert("Import requires a cloud session for security. Please sign up to import DBs.");
    };

    // Theme Logic (duplicated from [id]/page.tsx - refactor candidate)
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
                    <Button variant="ghost" size="sm" onClick={() => router.push('/')} className={styles.text}>
                        <ArrowLeft className={cn("w-4 h-4 mr-2", styles.icon)} />
                        Exit
                    </Button>
                    <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md opacity-50 grayscale" />
                        <div>
                            <h1 className={cn("font-semibold transition-colors", styles.text)}>Local Draft</h1>
                            <span className={cn("text-xs uppercase transition-colors bg-yellow-100 text-yellow-800 px-1 rounded", styles.subText)}>Playground</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    {/* Toolbar Actions */}
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
                            className={cn("pl-8 pr-4 py-1 text-xs border rounded focus:outline-none focus:ring-1 transition-colors w-32 focus:w-56 transition-all", styles.input)}
                            onChange={(e) => useCanvasStore.getState().setSearchTerm(e.target.value)}
                        />
                    </div>

                    <Button variant="outline" size="sm" onClick={() => setCodePreviewOpen(!codePreviewOpen)} className={cn("mr-2 transition-colors", styles.button)}>
                        <Code className={cn("w-4 h-4 mr-2", styles.icon)} />
                        Code
                    </Button>
                    <Button variant="default" size="sm" onClick={() => router.push('/register')} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30">
                        Sign Up to Save
                    </Button>
                </div>
            </div>


            <div className={cn("flex-1 relative overflow-hidden flex", styles.container)}>
                <div className="flex-1 relative">
                    <DiagramEditor projectId={LOCAL_PROJECT_ID} initialContent={{
                        nodes: [], edges: [], metadata: { dbType: 'MYSQL' }
                    }} />
                </div>
                <PropertiesPanel />
            </div>

            <CodePreviewPanel open={codePreviewOpen} onClose={() => setCodePreviewOpen(false)} />
        </div >
    );
}
