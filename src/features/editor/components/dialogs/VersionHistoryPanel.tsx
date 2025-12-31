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
    const [loading, setLoading] = useState(true);
    const [restoringId, setRestoringId] = useState<string | null>(null);
    const { setInitialContent } = useCanvasStore();

    useEffect(() => {
        loadVersions();
    }, [projectId]);

    const loadVersions = async () => {
        try {
            setLoading(true);
            const { versions } = await projectsApi.getVersions(projectId);
            setVersions(versions);
        } catch (error) {
            console.error('Failed to load versions:', error);
        } finally {
            setLoading(false);
        }
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
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 p-4 transform transition-transform z-50 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    History
                </h2>
                <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            ) : versions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No version history available.</p>
            ) : (
                <div className="space-y-4">
                    {versions.map((version) => (
                        <div key={version.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm">
                                    {format(new Date(version.createdAt), 'MMM d, h:mm a')}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {/* Calculated logic for 'ago' could go here */}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mb-3">
                                {version.description || 'Auto-saved version'}
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full h-8 text-xs"
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
                </div>
            )}
        </div>
    );
}
