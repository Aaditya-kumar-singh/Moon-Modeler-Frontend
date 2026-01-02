import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { projectsApi } from '@/features/projects/api/projectsApi';
import { useCanvasStore } from '@/features/editor/stores/canvasStore';
import { Button } from '@/components/ui/button';
import { RotateCcw, Clock, Loader2 } from 'lucide-react';

interface VersionHistoryPanelProps {
    projectId: string;
    onClose: () => void;
}

interface ProjectVersion {
    id: string;
    createdAt: string;
    description?: string;
}

export default function VersionHistoryPanel({ projectId, onClose }: VersionHistoryPanelProps) {
    const [versions, setVersions] = useState<ProjectVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const { setInitialContent, metadata } = useCanvasStore();

    // Theme logic
    const getThemeStyles = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'dark':
                return {
                    container: 'bg-slate-900 border-slate-700',
                    header: 'border-slate-700 text-slate-100',
                    card: 'border-slate-700 bg-slate-800 hover:bg-slate-700/50',
                    text: 'text-slate-300',
                    subText: 'text-slate-400',
                    button: 'border-slate-600 text-slate-300 hover:bg-slate-800'
                };
            case 'ocean':
                return {
                    container: 'bg-white border-cyan-100',
                    header: 'border-cyan-100 text-cyan-900',
                    card: 'border-cyan-100 bg-cyan-50/20 hover:bg-cyan-50',
                    text: 'text-cyan-800',
                    subText: 'text-cyan-600',
                    button: 'border-cyan-200 text-cyan-700 hover:bg-cyan-50'
                };
            case 'sunset':
                return {
                    container: 'bg-white border-orange-100',
                    header: 'border-orange-100 text-orange-900',
                    card: 'border-orange-100 bg-orange-50/20 hover:bg-orange-50',
                    text: 'text-orange-800',
                    subText: 'text-orange-600',
                    button: 'border-orange-200 text-orange-700 hover:bg-orange-50'
                };
            default:
                return {
                    container: 'bg-white border-gray-200',
                    header: 'border-gray-200 text-gray-900',
                    card: 'border-gray-200 bg-white hover:bg-gray-50',
                    text: 'text-gray-600',
                    subText: 'text-gray-400',
                    button: 'border-gray-200 text-gray-700 hover:bg-gray-50'
                };
        }
    };

    const styles = getThemeStyles();

    useEffect(() => {
        setVersions([]);
        setPage(1);
        setHasMore(true);
        loadVersions(1);
    }, [projectId]);

    const loadVersions = async (pageNum: number) => {
        try {
            setLoading(true);
            const limit = 5;
            const res = await projectsApi.getVersions(projectId, { page: pageNum, limit });

            setVersions(prev => pageNum === 1 ? res.versions : [...prev, ...res.versions]);
            setHasMore(pageNum < res.meta.totalPages);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to load versions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        loadVersions(page + 1);
    };

    const handleRestore = async (versionId: string) => {
        if (!confirm('Are you sure you want to restore this version? Current unsaved changes might be lost.')) return;

        try {
            setRestoringId(versionId);
            const project = await projectsApi.restoreVersion(projectId, versionId);
            setInitialContent(project.content);
            alert('Version restored successfully!');
            onClose();
        } catch (error) {
            console.error('Failed to restore version:', error);
            alert('Failed to restore version');
        } finally {
            setRestoringId(null);
        }
    };

    return (
        <div className={`fixed inset-y-0 right-0 w-80 shadow-xl border-l p-4 transform transition-transform z-50 overflow-y-auto ${styles.container}`}>
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${styles.header}`}>
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    History
                </h2>
                <Button variant="ghost" size="sm" onClick={onClose} className={styles.text}>Close</Button>
            </div>

            {loading && page === 1 ? (
                <div className="flex justify-center py-8">
                    <Loader2 className={`w-6 h-6 animate-spin ${styles.subText}`} />
                </div>
            ) : versions.length === 0 ? (
                <p className={`text-center py-8 ${styles.subText}`}>No version history available.</p>
            ) : (
                <div className="space-y-4">
                    {versions.map((version) => (
                        <div key={version.id} className={`border rounded-lg p-3 transition-colors ${styles.card}`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`font-medium text-sm ${styles.text}`}>
                                    {format(new Date(version.createdAt), 'MMM d, h:mm a')}
                                </span>
                            </div>
                            <p className={`text-xs mb-3 ${styles.subText}`}>
                                {version.description || 'Auto-saved version'}
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className={`w-full h-8 text-xs ${styles.button}`}
                                onClick={() => handleRestore(version.id)}
                                disabled={!!restoringId}
                            >
                                {restoringId === version.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                ) : (
                                    <RotateCcw className="w-3 h-3 mr-2" />
                                )}
                                Restore
                            </Button>
                        </div>
                    ))}

                    {hasMore && (
                        <Button
                            variant="outline"
                            className={`w-full ${styles.button}`}
                            onClick={handleLoadMore}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Load More
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
