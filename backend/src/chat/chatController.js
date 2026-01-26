const ChatMessage = require('../models/ChatMessage');
const pool = require('../../db/postgres');

exports.getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    console.log(` Loading chat history for room: ${roomId}, user: ${userId}`);

    
    const messages = await ChatMessage.find({ roomId })
      .sort({ timestamp: 1 })
      .limit(100);

    console.log(`Found ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`Loading chat rooms for user: ${userId}, role: ${userRole}`);

    let query;
    if (userRole === 'tenant') {
      
      query = `
        SELECT 
          b.id as booking_id,
          CONCAT('booking-', b.id) as room_id,
          p.title as property_title,
          p.landlord_id,
          u.first_name || ' ' || u.last_name as other_user_name,
          'landlord' as other_user_role
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u ON p.landlord_id = u.id
        WHERE b.tenant_id = $1 AND b.status IN ('confirmed', 'active', 'pending')
        ORDER BY b.created_at DESC
      `;
    } else {
    
      query = `
        SELECT 
          b.id as booking_id,
          CONCAT('booking-', b.id) as room_id,
          p.title as property_title,
          b.tenant_id,
          u.first_name || ' ' || u.last_name as other_user_name,
          'tenant' as other_user_role
        FROM bookings b
        JOIN properties p ON b.property_id = p.id
        JOIN users u ON b.tenant_id = u.id
        WHERE p.landlord_id = $1 AND b.status IN ('confirmed', 'active', 'pending')
        ORDER BY b.created_at DESC
      `;
    }

    const result = await pool.query(query, [userId]);

 
    const roomsWithUnread = await Promise.all(
      result.rows.map(async (room) => {
        const unreadCount = await ChatMessage.countDocuments({
          roomId: room.room_id,
          senderId: { $ne: userId.toString() },
          read: false,
        });
        return { ...room, unread_count: unreadCount };
      })
    );

    console.log(` Found ${roomsWithUnread.length} chat rooms`);
    res.json(roomsWithUnread);
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user.id;

    console.log(` Marking messages as read in room: ${roomId} for user: ${userId}`);

    const result = await ChatMessage.updateMany(
      { 
        roomId, 
        senderId: { $ne: userId.toString() },
        read: false 
      },
      { $set: { read: true } }
    );

    console.log(` Marked ${result.modifiedCount} messages as read`);
    res.json({ success: true, count: result.modifiedCount });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ error: error.message });
  }
};
