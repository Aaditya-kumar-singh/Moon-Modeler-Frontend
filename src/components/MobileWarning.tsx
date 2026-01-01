'use client';

import { useState, useEffect } from 'react';
import { X, Monitor } from 'lucide-react';

export default function MobileWarning() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Show only on small screens
        if (window.innerWidth < 768) {
            // Check if already dismissed
            const dismissed = sessionStorage.getItem('mobile-warning-dismissed');
            if (!dismissed) {
                setVisible(true);
            }
        }
    }, []);

    if (!visible) return null;

    const handleDismiss = () => {
        setVisible(false);
        sessionStorage.setItem('mobile-warning-dismissed', 'true');
    };

    return (
        <div className="md:hidden bg-blue-50 border-b border-blue-100 p-3 relative animate-fade-in">
            <div className="flex items-start gap-3 pr-8">
                <div className="p-2 bg-blue-100 rounded-full shrink-0">
                    <Monitor className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                    <p className="text-sm font-medium text-blue-900">
                        Desktop Recommended
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                        For the best experience designing complex schemas, we recommend using a larger screen or desktop computer.
                    </p>
                </div>
            </div>
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 text-blue-400 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                aria-label="Dismiss warning"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
