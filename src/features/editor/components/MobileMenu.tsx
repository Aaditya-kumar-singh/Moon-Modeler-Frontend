'use client';

import { useState } from 'react';
import { Menu, X, Search, Code, Database, Download, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCanvasStore } from '../stores/canvasStore';
import { cn } from '@/lib/utils/cn';

interface MobileMenuProps {
    onImport: () => void;
    onExport: () => void;
    onCode: () => void;
    onShare: () => void;
    onSave: () => void;
    saving: boolean;
    readOnly: boolean;
    styles: any; // Theme styles
}

export default function MobileMenu({
    onImport,
    onExport,
    onCode,
    onShare,
    onSave,
    saving,
    readOnly,
    styles
}: MobileMenuProps) {
    const [open, setOpen] = useState(false);
    const { metadata, setTheme, setEdgeStyle, setSearchTerm } = useCanvasStore();

    return (
        <div className="lg:hidden">
            <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className={styles.text}>
                <Menu className="w-5 h-5" />
            </Button>

            {/* Overlay */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-fade-in"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <div className={cn(
                "fixed inset-y-0 right-0 w-[280px] shadow-2xl z-[60] transform transition-transform duration-300 ease-in-out flex flex-col p-6",
                open ? "translate-x-0" : "translate-x-full",
                styles.container
            )}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className={cn("text-lg font-semibold", styles.text)}>Menu</h2>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className={styles.button}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="space-y-6 flex-1 overflow-y-auto">

                    {/* Search */}
                    <div className="space-y-2">
                        <label className={cn("text-xs font-semibold uppercase", styles.subText)}>Search</label>
                        <div className="relative">
                            <Search className={cn("w-4 h-4 absolute left-3 top-2.5", styles.icon)} />
                            <input
                                type="text"
                                placeholder="Search nodes..."
                                className={cn("w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-all", styles.input)}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Appearance */}
                    <div className="space-y-3">
                        <label className={cn("text-xs font-semibold uppercase", styles.subText)}>Appearance</label>
                        <select
                            className={cn("w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 bg-transparent", styles.input)}
                            value={metadata?.theme || 'default'}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            <option value="default">Default Theme</option>
                            <option value="ocean">Ocean Theme</option>
                            <option value="sunset">Sunset Theme</option>
                            <option value="dark">Dark Theme</option>
                        </select>
                        <select
                            className={cn("w-full text-sm border rounded-md px-3 py-2 focus:outline-none focus:ring-2 bg-transparent", styles.input)}
                            value={metadata?.edgeStyle || 'step'}
                            onChange={(e) => setEdgeStyle(e.target.value)}
                        >
                            <option value="step">Step Lines</option>
                            <option value="bezier">Bezier Curves</option>
                            <option value="straight">Straight Lines</option>
                        </select>
                    </div>

                    <div className="h-px bg-gray-100 my-2" />

                    {/* Actions */}
                    <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start" onClick={() => { onCode(); setOpen(false); }}>
                            <Code className="w-4 h-4 mr-2" />
                            View Code
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => { onImport(); setOpen(false); }}>
                            <Database className="w-4 h-4 mr-2" />
                            Import SQL/JSON
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => { onExport(); setOpen(false); }}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Diagram
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => { onShare(); setOpen(false); }}>
                            <Users className="w-4 h-4 mr-2" />
                            Share Project
                        </Button>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="pt-6 mt-auto border-t">
                    <Button
                        className="w-full"
                        size="lg"
                        onClick={() => { onSave(); setOpen(false); }}
                        disabled={saving || readOnly}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : readOnly ? 'Read Only' : 'Save Project'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
