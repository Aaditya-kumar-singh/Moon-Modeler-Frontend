import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Node, ReactFlowState, useStore } from 'reactflow';

export function useSmartGuides() {
    // Current guide positions (if any)
    const [guides, setGuides] = useState<{ type: 'horizontal' | 'vertical', pos: number }[]>([]);

    const onNodeDrag = useCallback((event: React.MouseEvent, node: Node, nodes: Node[]) => {
        const Threshold = 5;
        const newGuides: { type: 'horizontal' | 'vertical', pos: number }[] = [];

        // Check against other nodes
        nodes.forEach((n) => {
            if (n.id === node.id) return; // Don't snap to self

            const nodeLeft = node.position.x;
            const nodeRight = node.position.x + (node.width || 0);
            const nodeCenterX = node.position.x + (node.width || 0) / 2;

            const nodeTop = node.position.y;
            const nodeBottom = node.position.y + (node.height || 0);
            const nodeCenterY = node.position.y + (node.height || 0) / 2;

            const nLeft = n.position.x;
            const nRight = n.position.x + (n.width || 0);
            const nCenterX = n.position.x + (n.width || 0) / 2;

            const nTop = n.position.y;
            const nBottom = n.position.y + (n.height || 0);
            const nCenterY = n.position.y + (n.height || 0) / 2;

            // X-Axis Snapping (Vertical Lines)
            if (Math.abs(nodeLeft - nLeft) < Threshold) {
                // Snap Left to Left
                // We can't actually *force* the position easily in this handler without setting state up
                // But we can show the guide.
                // React flow enables snapping logic if we use their internal helpers, but let's just show guides for now.
                newGuides.push({ type: 'vertical', pos: nLeft });
            } else if (Math.abs(nodeRight - nRight) < Threshold) {
                newGuides.push({ type: 'vertical', pos: nRight });
            } else if (Math.abs(nodeCenterX - nCenterX) < Threshold) {
                newGuides.push({ type: 'vertical', pos: nCenterX });
            }

            // Y-Axis Snapping (Horizontal Lines)
            if (Math.abs(nodeTop - nTop) < Threshold) {
                newGuides.push({ type: 'horizontal', pos: nTop });
            } else if (Math.abs(nodeBottom - nBottom) < Threshold) {
                newGuides.push({ type: 'horizontal', pos: nBottom });
            } else if (Math.abs(nodeCenterY - nCenterY) < Threshold) {
                newGuides.push({ type: 'horizontal', pos: nCenterY });
            }
        });

        // Dedup guides
        const uniqueGuides = Array.from(new Set(newGuides.map(g => JSON.stringify(g)))).map(s => JSON.parse(s));
        setGuides(uniqueGuides);
    }, []);

    const onNodeDragStop = useCallback(() => {
        setGuides([]);
    }, []);

    return { guides, onNodeDrag, onNodeDragStop };
}
