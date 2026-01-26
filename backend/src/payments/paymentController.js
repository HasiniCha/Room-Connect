const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { publishToQueue } = require('../queue/rabbitmq'); 
const pool = require('../../db/postgres');
exports.createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;
    

    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND tenant_id = $2',
      [bookingId, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = result.rows[0];
    const amount = booking.monthly_rent * 100; 
    

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: { bookingId }
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
r
exports.webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const bookingId = paymentIntent.metadata.bookingId;
      
      await pool.query(
        'UPDATE bookings SET status = $1, stripe_payment_id = $2 WHERE id = $3',
        ['confirmed', paymentIntent.id, bookingId]
      );
      
  
      await publishToQueue('notifications', {
        type: 'payment_success',
        bookingId,
        message: 'Payment successful! Booking confirmed.'
      });
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};