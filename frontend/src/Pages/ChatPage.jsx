
import React, { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Chat from '../Pages/Chat';

const ChatPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const otherUser = location.state?.otherUser || { 
    firstName: 'User', 
    lastName: '', 
    role: 'User' 
  };
  const propertyTitle = location.state?.propertyTitle;

  useEffect(() => {
    console.log('ChatPage roomId:', roomId);
    console.log('Other user:', otherUser);
    console.log('Property title:', propertyTitle);
    
    if (!roomId) {
      console.error('No roomId found!');
      alert('Invalid chat room. Redirecting...');
      navigate('/dashboard');
    }
  }, [roomId, otherUser, propertyTitle, navigate]);

 
  if (!roomId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500">Loading chat room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Chat 
          roomId={roomId} 
          otherUser={otherUser}
          propertyTitle={propertyTitle}
        />
      </div>
    </div>
  );
};

export default ChatPage;