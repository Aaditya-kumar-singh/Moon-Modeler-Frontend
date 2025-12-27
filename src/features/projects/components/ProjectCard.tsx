'use client';

import { Card } from '@/components/ui/card';
import { Database, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Project } from '../api/projectsApi';

interface ProjectCardProps {
    project: Project;
    onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <Card
            className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
            onClick={onClick}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <Database className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{project.name}</h3>
                        <span className="text-xs text-gray-500 uppercase font-medium bg-gray-100 px-2 py-1 rounded">
                            {project.type}
                        </span>
                    </div>
                </div>
            </div>

            {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
            )}

            <div className="flex items-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                <Clock className="w-3 h-3 mr-1" />
                <span>
                    Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </span>
            </div>
        </Card>
    );
}
