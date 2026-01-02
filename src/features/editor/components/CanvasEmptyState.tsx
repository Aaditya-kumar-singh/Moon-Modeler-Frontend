import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { Database, Plus, FileInput, Braces } from 'lucide-react';

interface CanvasEmptyStateProps {
    theme: string;
    isMongo: boolean;
    onAdd: () => void;
    onImport: () => void;
}

export default function CanvasEmptyState({ theme, isMongo, onAdd, onImport }: CanvasEmptyStateProps) {
    const isDark = theme === 'dark';

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className={cn(
                "text-center p-8 rounded-2xl border flex flex-col items-center gap-4 pointer-events-auto shadow-xl max-w-sm mx-auto backdrop-blur-md transition-all duration-300",
                isDark
                    ? "bg-slate-800/80 border-slate-700 text-slate-300 shadow-slate-900/50"
                    : "bg-white/80 border-gray-200/50 text-gray-500 shadow-gray-200/50 hover:scale-105"
            )}>
                <div className={cn(
                    "p-4 rounded-full mb-2 transition-colors duration-300",
                    isDark ? "bg-slate-700/50" : "bg-gray-100/50",
                    isMongo && !isDark ? "bg-green-50" : ""
                )}>
                    {isMongo ? (
                        <Braces className={cn("w-10 h-10 transition-colors", isDark ? "text-green-400" : "text-green-600")} />
                    ) : (
                        <Database className={cn("w-10 h-10 opacity-50 transition-colors", isDark ? "text-blue-400" : "text-blue-600")} />
                    )}
                </div>
                <div className="space-y-2">
                    <h3 className={cn("text-xl font-bold tracking-tight", isDark ? "text-slate-200" : "text-gray-900")}>
                        {isMongo ? 'Start Designing NoSQL' : 'Start Designing SQL'}
                    </h3>
                    <p className="text-sm opacity-80 max-w-[240px] leading-relaxed">
                        {isMongo
                            ? "Add collections, define fields, or import a Mongoose schema to get started."
                            : "Add tables, define relations, or import a SQL dump to get started."
                        }
                    </p>
                </div>
                <div className="flex gap-3 mt-4 w-full">
                    <Button onClick={onAdd} size="lg" className={cn(
                        "flex-1 shadow-md transition-all active:scale-95 font-medium",
                        isMongo
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : (isDark ? "bg-blue-600 hover:bg-blue-500" : "bg-blue-600 hover:bg-blue-700")
                    )}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isMongo ? 'Add Collection' : 'Add Table'}
                    </Button>
                    <Button onClick={onImport} size="lg" variant="outline" className={cn(
                        "flex-1 shadow-sm transition-all active:scale-95 bg-white/50",
                        isDark ? "border-slate-600 hover:bg-slate-700 text-slate-300" : ""
                    )}>
                        <FileInput className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                </div>
            </div>
        </div>
    );
}
