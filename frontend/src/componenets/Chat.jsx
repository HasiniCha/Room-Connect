import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../redux/slices/chatSlice';
import api from '../api/axios';

const Chat = ({ roomId, otherUser, propertyTitle }) => {
  const socket = useSocket();
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  
  const currentUser = useSelector(state => state.auth.user);


  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await api.get(`/api/chat/history/${roomId}`);
        setMessages(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load chat history:', error);
        setLoading(false);
      }
    };
    loadHistory();
  }, [roomId]);

 
  useEffect(() => {
    const markAsRead = async () => {
      try {
        await api.post(`/api/chat/read/${roomId}`);
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    };
    markAsRead();
  }, [roomId]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

 
  useEffect(() => {
    if (socket && roomId) {
      socket.emit('join_chat', roomId);
    }

    return () => {
      if (socket && roomId) {
        socket.emit('leave_chat', roomId);
      }
    };
  }, [socket, roomId]);


  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
      dispatch(addMessage({ roomId, message: newMessage }));
    });

    socket.on('user_typing', (data) => {
      if (data.userId !== currentUser?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket, currentUser, roomId, dispatch]);

  const sendMessage = () => {
    if (socket && message.trim()) {
      socket.emit('send_message', { roomId, message: message.trim() });
      setMessage('');
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', roomId);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
   
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-semibold">
          Chat with {otherUser?.firstName} {otherUser?.lastName}
        </h3>
        <p className="text-xs text-blue-100">
          {propertyTitle || otherUser?.role}
        </p>
      </div>

  
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ minHeight: '400px', maxHeight: '500px' }}>
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwnMessage = msg.senderId === currentUser?.id;
            return (
              <div
                key={idx}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p className="text-sm break-words">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        
   
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex gap-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default Chat;