const pool = require('../../db/postgres');

exports.sendNotification = async (userId, notification) => {
  try {
    console.log(`Notification to user ${userId}:`, notification.message);
    
   
    return { success: true, userId, notification };
  } catch (error) {
    console.error('Notification error:', error.message);
    return { success: false, error: error.message };
  }
};

exports.notifyBookingConfirmed = async (bookingId, tenantId, landlordId) => {
  try {
    const message = `Your booking #${bookingId} has been confirmed!`;
    

    await exports.sendNotification(tenantId, {
      type: 'booking_confirmed',
      message,
      bookingId
    });
    

    await exports.sendNotification(landlordId, {
      type: 'new_booking',
      message: `New booking received: #${bookingId}`,
      bookingId
    });
    
    return { success: true };
  } catch (error) {
    console.error(' Error sending booking notification:', error);
    return { success: false, error: error.message };
  }
};

exports.notifyPaymentSuccess = async (bookingId, userId, amount) => {
  try {
    await exports.sendNotification(userId, {
      type: 'payment_success',
      message: `Payment of $${amount} processed successfully for booking #${bookingId}`,
      bookingId,
      amount
    });
    
    return { success: true };
  } catch (error) {
    console.error(' Error sending payment notification:', error);
    return { success: false };
  }
};

exports.notifyMaintenanceRequest = async (requestId, landlordId, priority) => {
  try {
    await exports.sendNotification(landlordId, {
      type: 'maintenance_request',
      message: `New ${priority} priority maintenance request #${requestId}`,
      requestId,
      priority
    });
    
    return { success: true };
  } catch (error) {
    console.error(' Error sending maintenance notification:', error);
    return { success: false };
  }
};