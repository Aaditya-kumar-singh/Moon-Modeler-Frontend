import { Node, Edge, Position } from 'reactflow';

/**
 * Determines the best source and target handles for two nodes based on their relative positions.
 */
export const getSmartHandleIds = (sourceNode: Node, targetNode: Node) => {
    const sBounds = {
        left: sourceNode.position.x,
        top: sourceNode.position.y,
        right: sourceNode.position.x + (sourceNode.width || 200),
        bottom: sourceNode.position.y + (sourceNode.height || 100),
        centerX: sourceNode.position.x + (sourceNode.width || 200) / 2,
        centerY: sourceNode.position.y + (sourceNode.height || 100) / 2,
    };

    const tBounds = {
        left: targetNode.position.x,
        top: targetNode.position.y,
        right: targetNode.position.x + (targetNode.width || 200),
        bottom: targetNode.position.y + (targetNode.height || 100),
        centerX: targetNode.position.x + (targetNode.width || 200) / 2,
        centerY: targetNode.position.y + (targetNode.height || 100) / 2,
    };

    let sourcePos = Position.Right;
    let targetPos = Position.Left;

    // Calculate angle or deltas
    const dx = tBounds.centerX - sBounds.centerX;
    const dy = tBounds.centerY - sBounds.centerY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
        // Horizontal orientation
        if (dx > 0) {
            sourcePos = Position.Right;
            targetPos = Position.Left;
        } else {
            sourcePos = Position.Left;
            targetPos = Position.Right;
        }
    } else {
        // Vertical orientation
        if (dy > 0) {
            sourcePos = Position.Bottom;
            targetPos = Position.Top;
        } else {
            sourcePos = Position.Top;
            targetPos = Position.Bottom;
        }
    }

    return {
        sourceHandle: `${sourceNode.id}-source-${sourcePos.toLowerCase()}`,
        targetHandle: `${targetNode.id}-source-${targetPos.toLowerCase()}`
    };
};
