// src/contexts/SocketContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const SERVER_URL =
    process.env.NODE_ENV === 'production'
      ? '/'           // relative URL
      : 'http://localhost:8080'; // development

  useEffect(() => {

    const socketIo = io(SERVER_URL); // connect to your server


    socketIo.on('connect', () => {
      setSocket(socketIo);
      console.log('Connected to Socket.IO server, id:', socketIo.id);
    });

    socketIo.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    return () => socketIo.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);