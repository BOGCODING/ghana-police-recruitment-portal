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

  const mounted = useRef(true);
  const socketRef = useRef(null);

  useEffect(() => {
    mounted.current = true;

    // Slight delay to avoid race conditions during React mount
    const timer = setTimeout(() => {
      if (!admin || !mounted.current) return;

      const token = localStorage.getItem('adminAccessToken');
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
          console.log('Successfully connected to WebSocket server');
          setSocket(newSocket);
        }
      });

      newSocket.on('connect_error', (error) => {
        if (mounted.current) {
          console.error('WebSocket Connection Error:', error.message);
          // Attempt to reconnect manually if it's a transport error
          if (error.message === 'xhr poll error') {
            newSocket.io.opts.transports = ['polling', 'websocket'];
          }
        }
      });

      newSocket.on('disconnect', (reason) => {
        if (mounted.current) {
          console.warn('WebSocket Disconnected:', reason);
          if (reason === 'io server disconnect') {
            newSocket.connect();
          }
        }
      });

      newSocket.on('application:new', (data) => {
        if (mounted.current) {
          toast.success(`New application from ${data.applicant_name}!`, {
            duration: 5000,
            position: 'top-right',
            icon: '📝'
          });
        }
      });

      socketRef.current = newSocket;
    }, 500); // 500ms delay

    return () => {
      mounted.current = false;
      clearTimeout(timer);
      if (socketRef.current) {
        const s = socketRef.current;
        setTimeout(() => {
          if (s) s.close();
        }, 100);
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [admin, API_URL]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
