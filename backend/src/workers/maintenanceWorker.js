const { consumeQueue } = require('../queue/rabbitmq');
const pool = require('../db/postgres');

const startMaintenanceWorker = async () => {
  await consumeQueue('maintenance-tasks', async (message) => {
    console.log('Processing maintenance task:', message);
    
    if (message.type === 'new_request') {
      // Send notification to landlord
      const io = global.io; // Assuming io is globally available
      io.to(`user:${message.landlordId}`).emit('notification', {
        type: 'maintenance_request',
        title: 'New Maintenance Request',
        message: `New ${message.priority} priority request: ${message.title}`,
        requestId: message.requestId
      });
      
      // Log the task
      console.log(`Notified landlord ${message.landlordId} about request ${message.requestId}`);
    }
  });
};

module.exports = { startMaintenanceWorker };