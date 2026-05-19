import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { clearMessages, addMessage } from '../redux/slices/chatSlice';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

const Chat = ({ roomId, otherUser, propertyTitle }) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const messages = useSelector((state) => state.chat.messages[roomId] || []);
  const user = useSelector((state) => state.auth.user);

  // user.id is a number from PostgreSQL; senderId in MongoDB is stored as a string
  const currentUserId = user?.id?.toString();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history once
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${SOCKET_URL}/api/chat/${roomId}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const history = await response.json();
          // Clear first to avoid duplicates on re-render
          dispatch(clearMessages(roomId));
          history.forEach((msg) => dispatch(addMessage({ roomId, message: msg })));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadChatHistory();
  }, [roomId, dispatch]);

  // Socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setConnectionError('Please log in to use chat');
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      socket.emit('join_chat', roomId);
    });

    socket.on('connect_error', (error) => {
      setIsConnected(false);
      setConnectionError('Connection failed. Please refresh the page.');
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('new_message', (newMessage) => {
      dispatch(addMessage({ roomId, message: newMessage }));
    });

    socket.on('user_typing', ({ username }) => {
      setIsTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.emit('leave_chat', roomId);
      socket.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [roomId, dispatch]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current || !isConnected) return;
    socketRef.current.emit('send_message', { roomId, message: message.trim() });
    setMessage('');
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', roomId);
    }
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg shadow-lg bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {otherUser?.firstName || 'User'} {otherUser?.lastName || ''}
            </h2>
            {propertyTitle && (
              <p className="text-sm text-blue-100">Re: {propertyTitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                Disconnected
              </span>
            )}
          </div>
        </div>
      </div>

      {connectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          {connectionError}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {!historyLoaded ? (
          <div className="text-center text-gray-500 mt-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg.senderId?.toString() === currentUserId;
            return (
              <div key={msg._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}>
                  {!isOwn && (
                    <p className="text-xs font-semibold mb-1">{msg.senderName || 'User'}</p>
                  )}
                  <p className="break-words">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm italic">
              {otherUser?.firstName || 'User'} is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder={isConnected ? 'Type your message...' : 'Connecting...'}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!message.trim() || !isConnected}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
