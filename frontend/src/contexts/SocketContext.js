// src/contexts/SocketContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SERVER_URL =
  process.env.NODE_ENV === 'production' ? 'https://kazuar.com.ua' : 'http://localhost:8080';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketIo = null;

    const setupSocket = async () => {
      // ✅ 1. Ensure server sets the randomId cookie (HTTP-only)
      await fetch(`${SERVER_URL}/get-random-id`, { credentials: 'include' });

      // ✅ 2. Connect to Socket.IO with credentials to send the cookie automatically
      socketIo = io(SERVER_URL, { withCredentials: true });

      socketIo.on('connect', () => {
        setSocket(socketIo);
      });

      socketIo.on('disconnect', () => {
      });
    }

    setupSocket();

    return () => socketIo?.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);