'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { admin } = useAdminAuth(); // Force rebuild
  const [socket, setSocket] = useState(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').trim().replace(/['"`]/g, '').replace(/\/+$/, '');

  const socketRef = useRef(null);

  useEffect(() => {
    // Ensure any existing socket is closed if not admin
    if (!admin) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    // Reuse existing socket if available
    if (socketRef.current) {
      if (!socket) setSocket(socketRef.current);
      return;
    }

    const timer = setTimeout(() => {
      const token = localStorage.getItem('adminAccessToken');
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
        console.log('Successfully connected to WebSocket server');
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        // Silence transient errors
        if (error.message !== 'xhr poll error' && error.message !== 'websocket error') {
          console.debug('Admin Socket error:', error.message);
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('WebSocket Disconnected:', reason);
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.on('application:new', (data) => {
        toast.success(`New application from ${data.applicant_name}!`, {
          duration: 5000,
          position: 'top-right',
          icon: '📝'
        });
      });

      socketRef.current = newSocket;
    }, 1000); // 1s delay

    return () => {
      clearTimeout(timer);
      // Don't disconnect here to prevent race conditions during remount
    };
  }, [admin, API_URL, socket]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
