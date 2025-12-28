'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, refetch } = useAuth();
  const [socket, setSocket] = useState(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').trim().replace(/['"`]/g, '').replace(/\/+$/, '');

  useEffect(() => {
    if (user) {
      const newSocket = io(API_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Applicant WebSocket connected');
      });

      newSocket.on('notification:new', (data) => {
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
      });

      const handleStatusUpdate = () => {
        console.log('Application status update received, refetching user data...');
        refetch();
      };

      newSocket.on('application:status_update', handleStatusUpdate);
      newSocket.on('application:update', handleStatusUpdate);

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user, API_URL, refetch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
