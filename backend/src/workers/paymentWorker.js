const { connect, consumeQueue } = require('../queue/rabbitmq');
const { sendNotification } = require('../notifications/notificationService');

const startPaymentWorker = async () => {
  try {
    await connect();
    await consumeQueue('payment-processing', async (message) => {
      console.log('Processing payment:', message);
      await sendNotification(message.userId, {
        type: 'payment_update',
        message: `Payment of $${message.amount} processed successfully`
      });
    });
    console.log('Payment worker started');
  } catch (error) {
    console.error('Payment worker failed to start:', error.message);
  }
};

startPaymentWorker();
