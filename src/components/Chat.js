import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getSocket } from '../socket';

const Chat = ({ user }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // For private chat
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({
    global: [],
    private: {} // { userId: messages[] }
  });
  const [typingUsers, setTypingUsers] = useState({
    global: new Set(),
    private: new Set()
  });
  const typingTimeoutRef = useRef(null);
  const socket = getSocket();
  const messagesListRef = useRef(null);

  // Connect user to chat
  useEffect(() => {
    if (socket && user) {
      socket.emit('user:connect', {
        username: user.displayName || user.email
      });
    }
  }, [socket, user]);

  // Listen for online users updates
  useEffect(() => {
    if (!socket) return;

    socket.on('users:online', (users) => {
      setOnlineUsers(users.filter(u => u.uid !== user.uid));
    });

    return () => socket.off('users:online');
  }, [socket, user]);

  // Listen for messages
  useEffect(() => {
    if (!socket) return;

    socket.on('chat:global', (msg) => {
      setMessages(prev => ({
        ...prev,
        global: [...prev.global, msg]
      }));
    });

    socket.on('chat:private', (msg) => {
      const otherUserId = msg.sender.uid === user.uid ? msg.recipient.uid : msg.sender.uid;
      setMessages(prev => ({
        ...prev,
        private: {
          ...prev.private,
          [otherUserId]: [...(prev.private[otherUserId] || []), msg]
        }
      }));
    });

    return () => {
      socket.off('chat:global');
      socket.off('chat:private');
    };
  }, [socket, user]);

  // Auto-scroll to bottom when messages change or when switching conversation
  useEffect(() => {
    const el = messagesListRef.current;
    if (!el) return;
    // wait a tick for DOM to update
    const t = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 0);
    return () => clearTimeout(t);
  }, [messages, selectedUser]);

  // Handle typing indicators
  useEffect(() => {
    if (!socket) return;

    socket.on('chat:typing', ({ userId, username, isTyping, private: isPrivate }) => {
      setTypingUsers(prev => {
        if (isPrivate) {
          return {
            ...prev,
            private: isTyping 
              ? new Set(prev.private).add(userId)
              : new Set([...prev.private].filter(id => id !== userId))
          };
        }
        return {
          ...prev,
          global: isTyping
            ? new Set(prev.global).add(userId)
            : new Set([...prev.global].filter(id => id !== userId))
        };
      });
    });

    return () => socket.off('chat:typing');
  }, [socket]);

  // Handle typing notification
  const handleTyping = useCallback((isPrivate = false) => {
    if (!socket) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('chat:typing', {
      isTyping: true,
      recipientId: isPrivate ? selectedUser?.uid : null
    });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', {
        isTyping: false,
        recipientId: isPrivate ? selectedUser?.uid : null
      });
    }, 1000);
  }, [socket, selectedUser]);

  // Send message
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socket) return;

    if (selectedUser) {
      socket.emit('chat:private', {
        recipientId: selectedUser.uid,
        message: {
          text: message,
        }
      });
    } else {
      socket.emit('chat:global', {
        text: message
      });
    }

    setMessage('');
  };

  const getCurrentMessages = () => {
    if (selectedUser) {
      return messages.private[selectedUser.uid] || [];
    }
    return messages.global;
  };

  const getTypingIndicator = () => {
    const typingSet = selectedUser ? typingUsers.private : typingUsers.global;
    const typingUsersArr = [...typingSet];
    if (typingUsersArr.length === 0) return null;

    const typingUsernames = typingUsersArr
      .map(uid => onlineUsers.find(u => u.uid === uid)?.username)
      .filter(Boolean);

    if (typingUsernames.length === 0) return null;
    
    return (
      <div className="typing-indicator">
        {typingUsernames.join(', ')} {typingUsernames.length === 1 ? 'is' : 'are'} typing...
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="online-users">
        <h3>Online Users</h3>
        <ul>
          <li 
            className={!selectedUser ? 'active' : ''} 
            onClick={() => setSelectedUser(null)}
          >
            Global Chat
          </li>
          {onlineUsers.map(u => (
            <li 
              key={u.uid}
              className={selectedUser?.uid === u.uid ? 'active' : ''}
              onClick={() => setSelectedUser(u)}
            >
              {u.username}
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-messages">
        <div className="messages-header">
          {selectedUser ? `Chat with ${selectedUser.username}` : 'Global Chat'}
        </div>

  <div className="messages-list" ref={messagesListRef}>
          {getCurrentMessages().map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.sender.uid === user.uid ? 'own' : ''}`}
            >
              <div className="message-sender">{msg.sender.username}</div>
              <div className="message-text">{msg.text}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {getTypingIndicator()}
        </div>

        <form onSubmit={sendMessage} className="message-input">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping(!!selectedUser);
            }}
            placeholder="Type a message..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;