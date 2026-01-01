import { useMemo } from 'react';
import { useCanvasStore } from '../stores/canvasStore';
import { generateMySQL, generateMongoose } from '../utils/codeGenerator';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CodePreviewPanelProps {
    open: boolean;
    onClose: () => void;
}

export default function CodePreviewPanel({ open, onClose }: CodePreviewPanelProps) {
    const { nodes, edges, metadata } = useCanvasStore();
    const [copied, setCopied] = useState(false);

    const code = useMemo(() => {
        if (!open) return '';
        if (!nodes.length) return '-- Start designing to see code';

        if (metadata.dbType === 'MONGODB') {
            return generateMongoose(nodes);
        } else {
            return generateMySQL(nodes, edges);
        }
    }, [nodes, edges, metadata.dbType, open]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success('Code copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const isDark = metadata.theme === 'dark';

    return (
        <div
            className={cn(
                "fixed right-0 top-0 bottom-0 w-[400px] shadow-2xl transform transition-transform duration-300 z-40 flex flex-col pointer-events-auto",
                open ? "translate-x-0" : "translate-x-full",
                // Theme styles
                isDark ? "bg-slate-900 border-l border-slate-700" : "bg-white border-l border-gray-200"
            )}
        >
            {/* Header */}
            <div className={cn(
                "p-4 border-b flex items-center justify-between",
                isDark ? "border-slate-800" : "border-gray-100"
            )}>
                <h3 className={cn("font-semibold", isDark ? "text-slate-100" : "text-gray-900")}>
                    {metadata.dbType === 'MONGODB' ? 'Mongoose Schemas' : 'MySQL Script'}
                </h3>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopy}
                        className={cn(isDark ? "text-slate-400 hover:text-slate-200" : "text-gray-500")}
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onClose}
                        className={cn(isDark ? "text-slate-400 hover:text-red-400" : "text-gray-500")}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                <pre className={cn(
                    "text-xs font-mono p-4 rounded-lg overflow-x-auto",
                    isDark ? "bg-slate-950 text-blue-300" : "bg-gray-50 text-gray-800"
                )}>
                    <code>{code}</code>
                </pre>
            </div>

            {/* Footer */}
            <div className={cn(
                "p-3 text-xs text-center border-t opacity-50",
                isDark ? "border-slate-800 text-slate-500" : "border-gray-100 text-gray-400"
            )}>
                Generated automatically based on current diagram
            </div>
        </div>
    );
}
