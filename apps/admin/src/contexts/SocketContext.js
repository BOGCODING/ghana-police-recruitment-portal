'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { admin } = useAdminAuth(); // Force rebuild
  const [socket, setSocket] = useState(null);
  const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').trim().replace(/['"`]/g, '').replace(/\/+$/, '');

  useEffect(() => {
    if (admin) {
      const newSocket = io(API_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Successfully connected to WebSocket server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket Connection Error:', error.message);
        // Attempt to reconnect manually if it's a transport error
        if (error.message === 'xhr poll error') {
          newSocket.io.opts.transports = ['polling', 'websocket'];
        }
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('WebSocket Disconnected:', reason);
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
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

      newSocket.on('stats:update', (data) => {
        // Handle global stats updates if needed
      });

      setSocket(newSocket);

      return () => {
        console.log('Closing WebSocket connection');
        newSocket.close();
      };
    }
  }, [admin, API_URL]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
