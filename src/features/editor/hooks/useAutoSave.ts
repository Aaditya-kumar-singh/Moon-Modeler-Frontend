import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { projectsApi } from '@/features/projects/api/projectsApi';

/**
 * Hook to auto-save diagram content to the backend.
 * Uses a debounce mechanism to prevent excessive API calls.
 */
export function useAutoSave(projectId: string, isEnabled: boolean = true) {
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedHash = useRef<string>('');
    const isFirstLoad = useRef<boolean>(true);
    const isSaving = useRef<boolean>(false);

    useEffect(() => {
        // Subscribe to store updates
        // We only persist nodes, edges, and metadata
        const unsub = useCanvasStore.subscribe((state) => {
            if (!isEnabled || !projectId || projectId === 'local-draft') return;

            // Clear existing timer
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Set new timer (Debounce 2000ms)
            saveTimeoutRef.current = setTimeout(async () => {
                const content = {
                    nodes: state.nodes,
                    edges: state.edges,
                    metadata: state.metadata
                };

                const currentHash = JSON.stringify(content);

                // Prevent saving on initial load
                if (isFirstLoad.current) {
                    lastSavedHash.current = currentHash;
                    isFirstLoad.current = false;
                    return;
                }

                // Prevent saving if content hasn't changed from last save
                if (currentHash === lastSavedHash.current) {
                    return;
                }

                // Wait if a save is already in progress to prevent connection flooding
                // This serializes the requests
                while (isSaving.current) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                try {
                    isSaving.current = true;
                    await projectsApi.update(projectId, { content });
                    lastSavedHash.current = currentHash;
                    // console.log('Auto-saved project:', projectId);
                } catch (error) {
                    console.error('Auto-save failed:', error);
                } finally {
                    isSaving.current = false;
                }
            }, 2000);
        });

        return () => {
            unsub();
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [projectId]);
}
