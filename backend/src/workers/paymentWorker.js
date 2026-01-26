const { connect, consumeQueue } = require('../queue/rabbitmq');

const startPaymentWorker = async () => {
  await connect(); // <-- ensure connection
  await consumeQueue('payment-processing', async (message) => {
    console.log('Processing payment:', message);
    await sendNotification(message.userId, { type: 'payment_update', message: `Payment of $${message.amount} processed successfully` });
  });
};

startPaymentWorker();
