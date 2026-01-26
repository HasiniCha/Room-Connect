const pool = require('../../db/postgres');

exports.createBooking = async (req, res) => {
  try {
    const { propertyId, startDate, endDate } = req.body;
    const tenantId = req.user.id;
    

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Property ID, start date, and end date are required' });
    }
    
    
    const propertyResult = await pool.query(
      'SELECT * FROM properties WHERE id = $1',
      [propertyId]
    );
    
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const property = propertyResult.rows[0];
    
    if (!property.monthly_rent) {
      return res.status(400).json({ error: 'Property does not have rent information' });
    }

    const conflictCheck = await pool.query(
      `SELECT * FROM bookings 
       WHERE property_id = $1 
       AND status IN ('confirmed', 'active', 'pending')
       AND (
         (start_date <= $2 AND end_date >= $2) OR
         (start_date <= $3 AND end_date >= $3) OR
         (start_date >= $2 AND end_date <= $3)
       )`,
      [propertyId, startDate, endDate]
    );
    
    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Property already booked for these dates' });
    }
    
   
    const result = await pool.query(
      `INSERT INTO bookings (property_id, tenant_id, start_date, end_date, monthly_rent, status)
       VALUES ($1, $2, $3, $4, $5, 'pending') RETURNING *`,
      [propertyId, tenantId, startDate, endDate, property.monthly_rent]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT b.*, p.title, p.address, p.city 
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.tenant_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: error.message });
  }
};
exports.getLandlordBookings = async (req, res) => {
  try {
    const landlordId = req.user.id;
    
    const result = await pool.query(
      `SELECT 
        b.*,
        p.title,
        p.address,
        p.city,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.tenant_id = u.id
      WHERE p.landlord_id = $1
      ORDER BY 
        CASE b.status 
          WHEN 'pending' THEN 1
          WHEN 'confirmed' THEN 2
          WHEN 'active' THEN 3
          ELSE 4
        END,
        b.created_at DESC`,
      [landlordId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get landlord bookings error:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const landlordId = req.user.id;

 
    const validStatuses = ['pending', 'confirmed', 'active', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }


    const checkResult = await pool.query(
      `SELECT b.*, p.landlord_id, b.tenant_id
       FROM bookings b
       JOIN properties p ON b.property_id = p.id
       WHERE b.id = $1`,
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = checkResult.rows[0];

    if (booking.landlord_id !== landlordId) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }

    const result = await pool.query(
      `UPDATE bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

  
    try {
      const io = global.io;
      if (io) {
        io.to(`user:${booking.tenant_id}`).emit('booking_update', {
          bookingId: id,
          status,
          message: `Your booking has been ${status}`,
        });
      }
    } catch (err) {
      console.log('Socket notification skipped:', err.message);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: error.message });
  }
};
