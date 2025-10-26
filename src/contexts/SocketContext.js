import React, { createContext, useContext, useEffect, useState } from 'react';
import { initSocket } from '../socket';
import { auth } from '../firebase/config';

const defaultContextValue = {
  socket: null,
  onlineUsers: [],
  messages: { global: [], private: {} },
  connectUser: () => {},
  sendGlobalMessage: () => {},
  sendPrivateMessage: () => {},
  sendTypingStatus: () => {}
};

const SocketContext = createContext(defaultContextValue);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState({
    global: [],
    private: {} // { userId: messages[] }
  });

  useEffect(() => {
    let mounted = true;
    let currentSocket = null;

    const setup = async () => {
      try {
        const getIdToken = async () => {
          const user = auth.currentUser;
          if (!user) return null;
          return await user.getIdToken(true);
        };

        currentSocket = await initSocket(getIdToken);
        
        if (currentSocket && mounted) {
          setSocket(currentSocket);

          // Listen for online users updates
          currentSocket.on('users:online', (users) => {
            if (mounted && auth.currentUser) {
              setOnlineUsers(users.filter(u => u.uid !== auth.currentUser.uid));
            }
          });

          // Listen for messages
          currentSocket.on('chat:global', (msg) => {
            if (mounted) {
              setMessages(prev => ({
                ...prev,
                global: [...prev.global, msg]
              }));
            }
          });

          currentSocket.on('chat:private', (msg) => {
            if (mounted && auth.currentUser) {
              const otherUserId = msg.sender.uid === auth.currentUser.uid 
                ? msg.recipient.uid 
                : msg.sender.uid;
              
              setMessages(prev => ({
                ...prev,
                private: {
                  ...prev.private,
                  [otherUserId]: [...(prev.private[otherUserId] || []), msg]
                }
              }));
            }
          });

          currentSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            if (mounted) {
              setSocket(null);
              setOnlineUsers([]);
            }
          });

          currentSocket.on('connect', () => {
            console.log('Socket connected:', currentSocket.id);
            if (mounted && auth.currentUser) {
              currentSocket.emit('user:connect', {
                username: auth.currentUser.displayName || auth.currentUser.email
              });
            }
          });
        }
      } catch (error) {
        console.error('Socket setup error:', error);
      }
    };

    setup();

    return () => {
      mounted = false;
      if (currentSocket) {
        currentSocket.off('users:online');
        currentSocket.off('chat:global');
        currentSocket.off('chat:private');
        currentSocket.off('disconnect');
        currentSocket.off('connect');
        currentSocket.disconnect();
      }
    };
  }, []);

  // Methods for chat functionality
  const connectUser = (userData) => {
    if (socket) {
      socket.emit('user:connect', {
        ...userData,
        username: auth.currentUser?.displayName || auth.currentUser?.email
      });
    }
  };

  const sendGlobalMessage = (message) => {
    if (socket) {
      socket.emit('chat:global', message);
    }
  };

  const sendPrivateMessage = (recipientId, message) => {
    if (socket) {
      socket.emit('chat:private', { recipientId, message });
    }
  };

  const sendTypingStatus = (isTyping, recipientId = null) => {
    if (socket) {
      socket.emit('chat:typing', { isTyping, recipientId });
    }
  };

  const contextValue = {
    socket,
    onlineUsers,
    messages,
    connectUser,
    sendGlobalMessage,
    sendPrivateMessage,
    sendTypingStatus
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
