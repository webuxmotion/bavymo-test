// src/contexts/SocketContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SERVER_URL =
  process.env.NODE_ENV === 'production' ? 'https://www.kazuar.com.ua' : 'http://localhost:8080';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [randomId, setRandomId] = useState(null);

  useEffect(() => {
    let socketIo = null;

    const setupSocket = async () => {
      // ✅ 1. Ensure server sets the randomId cookie (HTTP-only)
      const res = await fetch(`${SERVER_URL}/api/get-random-id`, { credentials: 'include' });
      const data = await res.json();
      setRandomId(data.randomId);

      // ✅ 2. Connect to Socket.IO with credentials to send the cookie automatically
      socketIo = io(SERVER_URL, { withCredentials: true });

      socketIo.on('connect', () => {
        setSocket(socketIo);
      });

      // In case server generates a new one dynamically
      socketIo.on('setRandomId', (id) => {
        setRandomId(id);
      });


      socketIo.on('disconnect', () => {
      });
    }



    setupSocket();

    return () => socketIo?.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, randomId }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);