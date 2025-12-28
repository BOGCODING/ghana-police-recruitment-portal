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

  const socketRef = useRef(null);

  useEffect(() => {
    // If no user, ensure any existing socket is closed
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // If socket already exists for this user, do nothing
    if (socketRef.current) {
      // Re-broadcast the active socket to make sure it's in state
      if (!socket) setSocket(socketRef.current);
      return;
    }
    
    // Slight delay to allow the app to stabilize
    const timer = setTimeout(() => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const newSocket = io(API_URL, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 1000,
        withCredentials: true,
        autoConnect: true
      });

      newSocket.on('connect', () => {
        console.log('Applicant WebSocket connected');
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        // Only log if it's not a transient 'closed' error during mount
        if (error.message !== 'xhr poll error' && error.message !== 'websocket error') {
          console.debug('Socket.io connection error:', error.message);
        }
      });

      newSocket.on('notification:new', (data) => {
        toast.success(data.message || 'New notification received!', {
          duration: 5000,
          position: 'top-right',
          icon: '🔔',
          style: {
            background: '#333', color: '#fff', borderRadius: '10px',
          },
        });
      });

      const handleStatusUpdate = () => {
        console.log('Application status update received, refetching user data...');
        refetch();
      };

      newSocket.on('application:status_update', handleStatusUpdate);
      newSocket.on('application:update', handleStatusUpdate);

      socketRef.current = newSocket;
    }, 1000); // 1s delay for stability

    return () => {
      clearTimeout(timer);
      // NOTE: We DON'T disconnect here on every minor remount.
      // We only disconnect when the user logs out or if the provider itself is destroyed permanently.
      // This eliminates the "closed before established" race condition.
    };
  }, [user, API_URL, refetch, socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
