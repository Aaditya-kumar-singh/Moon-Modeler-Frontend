import { memo } from 'react';
import { useStore } from 'reactflow';

interface AlignmentGuidesProps {
    guides: { type: 'horizontal' | 'vertical', pos: number }[];
}

const AlignmentGuides = ({ guides }: AlignmentGuidesProps) => {
    // We need zoom/transform to render correctly if we were drawing on SVG overlay?
    // But if we put this INSIDE ReactFlow, it scales automatically?
    // Actually, simple absolute divs on top of the canvas might be easiest, but they need to move with pan/zoom.
    // Better to use an SVG overlay *inside* the viewport or specific panel.
    // If we use standard HTML overlay, we need to map positions.
    // If we stick it as a child of ReactFlow, it's in the renderer coordinate system.

    // Let's assume this component is placed INSIDE ReactFlow as a child.
    // But standard children are usually slot-based.

    // Correct way: Use a custom layer or just SVG absolute positioned.

    if (guides.length === 0) return null;

    return (
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
            {guides.map((g, i) => {
                if (g.type === 'horizontal') {
                    // Draw horizontal line across a large space, or just dynamic?
                    // Infinte line for now
                    return (
                        <line
                            key={i}
                            x1={-10000} y1={g.pos}
                            x2={10000} y2={g.pos}
                            stroke="#ef4444"
                            strokeWidth={1}
                            strokeDasharray="4 2"
                        />
                    );
                } else {
                    return (
                        <line
                            key={i}
                            x1={g.pos} y1={-10000}
                            x2={g.pos} y2={10000}
                            stroke="#ef4444"
                            strokeWidth={1}
                            strokeDasharray="4 2"
                        />
                    );
                }
            })}
        </svg>
    );
};

export default memo(AlignmentGuides);
