import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCanvasStore } from '../stores/canvasStore';
import { DiagramEvent } from '@/types/events';

export const useCollaboration = (projectId: string) => {
    const { setSocket, setProjectId, applyEvent } = useCanvasStore();

    useEffect(() => {
        if (!projectId) return;

        setProjectId(projectId);

        const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002', {
            path: '/api/socket/io',
            addTrailingSlash: false,
        });

        socket.on('connect', () => {
            console.log('Connected to collaboration server', socket.id);
            socket.emit('join-room', projectId);
        });

        socket.on('remote-event', (event: DiagramEvent) => {
            console.log('Received remote event', event);
            applyEvent(event);
        });

        setSocket(socket);

        return () => {
            socket.disconnect();
            setSocket(null);
        };
    }, [projectId, setSocket, setProjectId, applyEvent]);
};
