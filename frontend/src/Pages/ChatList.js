import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ChatList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await api.get('/api/chat/rooms');
        setRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load chat rooms:', error);
        setLoading(false);
      }
    };
    loadRooms();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      
      {rooms.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No active chats</p>
          <p className="text-sm text-gray-500 mt-2">
            Chats will appear here when you have active bookings
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.room_id}
              onClick={() => navigate(`/chat/${room.room_id}`, { 
                state: { 
                  otherUser: { 
                    firstName: room.other_user_name.split(' ')[0],
                    lastName: room.other_user_name.split(' ')[1] || '',
                    role: room.other_user_role 
                  },
                  propertyTitle: room.property_title
                }
              })}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{room.other_user_name}</h3>
                  <p className="text-gray-600 text-sm">{room.property_title}</p>
                  <p className="text-xs text-gray-500 capitalize">{room.other_user_role}</p>
                </div>
                {room.unread_count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {room.unread_count}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;