import { io } from 'socket.io-client';

let socket = null;

export const initSocket = async (getIdToken) => {
  const url = process.env.REACT_APP_SOCKET_URL || 'https://blogchatglobalbackend.onrender.com/';
  let token = null;

  try {
    if (typeof getIdToken === 'function') {
      token = await getIdToken();
    }
  } catch (err) {
    console.warn('Failed to get ID token for socket auth:', err.message || err);
  }

  // Disconnect existing socket if any
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Create new socket connection
  socket = io(url, {
    auth: { token },
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 20000 // ✅ Increase timeout for slow Render startup
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('Socket connect_error:', err.message || err);
    // Try to reconnect with polling if websocket fails
    if (socket.io.opts.transports.includes('websocket')) {
      console.log('Falling back to polling transport');
      socket.io.opts.transports = ['polling'];
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => socket;
