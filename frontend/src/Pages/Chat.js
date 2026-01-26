
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { addMessage } from '../redux/slices/chatSlice';

const Chat = ({ roomId, otherUser, propertyTitle }) => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const messages = useSelector((state) => state.chat.messages[roomId] || []);
  const user = useSelector((state) => state.auth.user);
  

  const currentUserId = user?.id || localStorage.getItem('userId');


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  useEffect(() => {
 
    const token = localStorage.getItem('token') || user?.token;

    if (!token) {
      console.error(' No authentication token found');
      setConnectionError('Please log in to use chat');
      return;
    }

    console.log('Connecting to Socket.IO...');


    const socket = io('http://localhost:3001', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

 
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      setConnectionError(null);
      
     
      socket.emit('join_chat', roomId);
      console.log(`Joined room: ${roomId}`);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
      setConnectionError('Connection failed. Please check your login.');
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

  
    socket.on('new_message', (newMessage) => {
      console.log('New message received:', newMessage);
      dispatch(addMessage({ roomId, message: newMessage }));
    });

    socket.on('user_typing', ({ username }) => {
      console.log(`${username} is typing...`);
      setIsTyping(true);
      
 
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
  
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      alert(`Error: ${error.message}`);
    });


    return () => {
      console.log('Disconnecting socket...');
      socket.emit('leave_chat', roomId);
      socket.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId, dispatch, user]);


  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/chat/${roomId}/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const history = await response.json();
          console.log('Loaded chat history:', history.length, 'messages');
          
      
          history.forEach((msg) => {
            dispatch(addMessage({ roomId, message: msg }));
          });
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    loadChatHistory();
  }, [roomId, dispatch]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    if (!socketRef.current || !isConnected) {
      alert('Not connected to chat server. Please refresh the page.');
      return;
    }

    console.log('Sending message:', message);


    socketRef.current.emit('send_message', {
      roomId,
      message: message.trim()
    });


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
          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Connected
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                Disconnected
              </span>
            )}
          </div>
        </div>
      </div>

 
      {connectionError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">
          <p className="font-bold">Connection Error</p>
          <p className="text-sm">{connectionError}</p>
        </div>
      )}

  
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.senderId === currentUserId;
            
            return (
              <div
                key={msg._id || index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1">
                      {msg.senderName || 'User'}
                    </p>
                  )}
                  <p className="break-words">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg">
              <p className="text-sm italic">
                {otherUser?.firstName || 'User'} is typing
                <span className="typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

 
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            placeholder="Type your message..."
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
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Connecting to chat server...
          </p>
        )}
      </form>


      <style jsx>{`
        .typing-dots span {
          animation: typing 1.4s infinite;
          opacity: 0;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;