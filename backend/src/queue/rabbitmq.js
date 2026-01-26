const amqp = require('amqplib');

let channel = null;
let connection = null;

exports.connect = async () => {
  try {
    if (connection) {
      console.log('RabbitMQ already connected');
      return;
    }
    
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
    connection = await amqp.connect(rabbitmqUrl);
    channel = await connection.createChannel();
    

    await channel.assertQueue('payment-processing', { durable: true });
    await channel.assertQueue('notifications', { durable: true });
    await channel.assertQueue('maintenance-tasks', { durable: true });
    await channel.assertQueue('email-queue', { durable: true });
    
    console.log('RabbitMQ connected and queues created');
    
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });
    
    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      connection = null;
      channel = null;
    });
    
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error.message);
    console.log('Continuing without RabbitMQ...');
  }
};

exports.publishToQueue = async (queueName, message) => {
  try {
    if (!channel) {
      console.warn(`RabbitMQ not connected, skipping message to ${queueName}`);
      return false;
    }
    
    channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );
    
    console.log(`Message sent to queue: ${queueName}`);
    return true;
  } catch (error) {
    console.error('Error publishing to queue:', error.message);
    return false;
  }
};

exports.consumeQueue = async (queueName, callback) => {
  try {
    if (!channel) {
      console.warn(`RabbitMQ not connected, cannot consume ${queueName}`);
      return;
    }
    
    await channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          await callback(content);
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          channel.nack(msg, false, false); 
        }
      }
    });
    
    console.log(`👂 Listening to queue: ${queueName}`);
  } catch (error) {
    console.error(`Error consuming queue ${queueName}:`, error.message);
  }
};

exports.getChannel = () => channel;
exports.getConnection = () => connection;