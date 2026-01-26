import React from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../hooks/useSocket';

const NotificationBell = () => {
  const socket = useSocket();
  const notifications = useSelector(state => state.notifications.items);
  const unreadCount = useSelector(state => state.notifications.unread);
  
  useEffect(() => {
    if (socket) {
      socket.on('notification', (notification) => {
        dispatch(addNotification(notification));
      });
    }
  }, [socket]);
  
  return (
    <div className="relative">
      <button className="relative">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};