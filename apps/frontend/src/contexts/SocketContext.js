'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, refetch } = useAuth();
  const [socket, setSocket] = useState(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').trim().replace(/['"`]/g, '').replace(/\/+$/, '');

  const mounted = useRef(true);
  const socketRef = useRef(null);

  useEffect(() => {
    mounted.current = true;
    
    // Slight delay to avoid race conditions during React mount
    const timer = setTimeout(() => {
      if (!user || !mounted.current) return;

      const token = localStorage.getItem('accessToken');
      const newSocket = io(API_URL, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket'],
        upgrade: false,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        withCredentials: true,
        autoConnect: true
      });

      newSocket.on('connect', () => {
        if (mounted.current) {
          console.log('Applicant WebSocket connected');
          setSocket(newSocket);
        }
      });

      newSocket.on('notification:new', (data) => {
        if (mounted.current) {
          toast.success(data.message || 'New notification received!', {
            duration: 5000,
            position: 'top-right',
            icon: '🔔',
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
            },
          });
        }
      });

      const handleStatusUpdate = () => {
        if (mounted.current) {
          console.log('Application status update received, refetching user data...');
          refetch();
        }
      };

      newSocket.on('application:status_update', handleStatusUpdate);
      newSocket.on('application:update', handleStatusUpdate);

      socketRef.current = newSocket;
    }, 500); // 500ms delay

    return () => {
      mounted.current = false;
      clearTimeout(timer);
      if (socketRef.current) {
        // Only close if it's connected or after a delay to avoid "closed before established"
        const s = socketRef.current;
        setTimeout(() => {
          if (s) s.close();
        }, 100);
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [user, API_URL, refetch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
