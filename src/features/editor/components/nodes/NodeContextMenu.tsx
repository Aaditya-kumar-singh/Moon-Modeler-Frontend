import { useRef, useEffect } from 'react';
import { useCanvasStore } from '@/features/editor/stores/canvasStore';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils/cn';

interface NodeContextMenuProps {
    x: number;
    y: number;
    nodeId: string;
    onClose: () => void;
}

const COLORS = [
    { name: 'Default', value: '' },
    { name: 'Blue', value: '#dbeafe' }, // blue-100
    { name: 'Green', value: '#dcfce7' }, // green-100
    { name: 'Red', value: '#fee2e2' },   // red-100
    { name: 'Yellow', value: '#fef9c3' }, // yellow-100
    { name: 'Purple', value: '#f3e8ff' }, // purple-100
    { name: 'Gray', value: '#f3f4f6' },   // gray-100
];

export default function NodeContextMenu({ x, y, nodeId, onClose }: NodeContextMenuProps) {
    const ref = useRef<HTMLDivElement>(null);
    const { updateNodeColor, deleteNode, metadata } = useCanvasStore();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleColorClick = (color: string) => {
        updateNodeColor(nodeId, color);
        onClose();
    };

    const handleDelete = () => {
        deleteNode(nodeId);
        onClose();
    };

    // Theme Logic for Context Menu
    const getThemeStyles = () => {
        const theme = metadata?.theme || 'default';
        switch (theme) {
            case 'dark':
                return {
                    menu: 'bg-slate-800 border-slate-700 shadow-2xl',
                    headerText: 'text-slate-400',
                    optionHover: 'hover:bg-slate-700',
                    divider: 'border-slate-700',
                    deleteBtn: 'text-red-400 hover:bg-red-900/20'
                };
            case 'ocean':
                return {
                    menu: 'bg-white border-cyan-100 shadow-xl',
                    headerText: 'text-cyan-600',
                    optionHover: 'hover:bg-cyan-50',
                    divider: 'border-cyan-100',
                    deleteBtn: 'text-red-500 hover:bg-red-50'
                };
            case 'sunset':
                return {
                    menu: 'bg-white border-orange-100 shadow-xl',
                    headerText: 'text-orange-600',
                    optionHover: 'hover:bg-orange-50',
                    divider: 'border-orange-100',
                    deleteBtn: 'text-red-500 hover:bg-red-50'
                };
            default:
                return {
                    menu: 'bg-white border-gray-200 shadow-xl',
                    headerText: 'text-gray-500',
                    optionHover: 'hover:bg-gray-50',
                    divider: 'border-gray-100',
                    deleteBtn: 'text-red-600 hover:bg-red-50'
                };
        }
    };

    const styles = getThemeStyles();

    return createPortal(
        <div
            ref={ref}
            className={cn("absolute z-50 rounded-lg w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-100 border", styles.menu)}
            style={{ top: y, left: x }}
        >
            <div className="p-1">
                <div className={cn("text-xs font-semibold px-2 py-1 uppercase", styles.headerText)}>Header Color</div>
                <div className="grid grid-cols-4 gap-1 p-1">
                    {COLORS.map((c) => (
                        <button
                            key={c.name}
                            className="w-8 h-8 rounded-md border border-gray-200/50 hover:scale-110 transition-transform shadow-sm"
                            style={{ backgroundColor: c.value || '#fff' }}
                            title={c.name}
                            onClick={() => handleColorClick(c.value)}
                        />
                    ))}
                </div>
            </div>

            <div className={cn("border-t my-1", styles.divider)}></div>

            <button
                className={cn("w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors", styles.deleteBtn)}
                onClick={handleDelete}
            >
                Delete Node
            </button>
        </div>,
        document.body
    );
}
