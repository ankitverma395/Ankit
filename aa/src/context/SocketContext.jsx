import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, user } = useAuth();

  useEffect(() => {
    let newSocket;

    if (token) {
      // Pass token in 'auth' object for server-side middleware validation
      newSocket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
        transports: ['websocket'], // Faster, preferred over polling
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('⚡ Nexora Real-time Connected:', newSocket.id);
        
        // Example: Join a private user room for notifications
        if (user?._id) {
          newSocket.emit('join_user_room', user._id);
        }
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Socket Disconnected');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket Connection Error:', err.message);
      });

      setSocket(newSocket);

      // Cleanup on unmount or token change
      return () => {
        if (newSocket) {
          newSocket.off('connect');
          newSocket.off('disconnect');
          newSocket.off('connect_error');
          newSocket.close();
        }
      };
    } else {
      // If no token exists, ensure any existing socket is killed
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [token]); // Triggered whenever user logs in/out

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};