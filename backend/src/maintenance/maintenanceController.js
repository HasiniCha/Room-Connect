const pool = require('../../db/postgres');
const { publishToQueue } = require('../queue/rabbitmq');

exports.createRequest = async (req, res) => {
  try {
    const { propertyId, title, description, priority = 'medium' } = req.body;
    const tenantId = req.user.id;
    

    if (!propertyId || !title || !description) {
      return res.status(400).json({ error: 'Property ID, title, and description are required' });
    }
    
   
    const bookingCheck = await pool.query(
      `SELECT * FROM bookings 
       WHERE property_id = $1 AND tenant_id = $2 AND status IN ('confirmed', 'active', 'pending')`,
      [propertyId, tenantId]
    );
    
    if (bookingCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No active booking for this property' });
    }
    
 
    const result = await pool.query(
      `INSERT INTO maintenance_requests (property_id, tenant_id, title, description, priority, status)
       VALUES ($1, $2, $3, $4, $5, 'open') RETURNING *`,
      [propertyId, tenantId, title, description, priority]
    );
    
    const request = result.rows[0];

    const propertyResult = await pool.query('SELECT landlord_id FROM properties WHERE id = $1', [propertyId]);
    const landlordId = propertyResult.rows[0].landlord_id;
    

    publishToQueue('maintenance-tasks', {
      type: 'new_request',
      requestId: request.id,
      landlordId,
      tenantId,
      title,
      priority
    }).catch(err => console.log('Queue publish skipped:', err.message));
    
    res.status(201).json(request);
  } catch (error) {
    console.error('Create maintenance request error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    
   
    if (!['open', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
 
    const checkResult = await pool.query(
      `SELECT m.*, p.landlord_id 
       FROM maintenance_requests m
       JOIN properties p ON m.property_id = p.id
       WHERE m.id = $1`,
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    const request = checkResult.rows[0];
    
    if (request.landlord_id !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
  
    const result = await pool.query(
      `UPDATE maintenance_requests 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    
  
    try {
      const io = global.io;
      if (io) {
        io.to(`user:${request.tenant_id}`).emit('maintenance_update', {
          requestId: id,
          status,
          message: `Your maintenance request has been updated to: ${status}`
        });
      }
    } catch (err) {
      console.log('Socket notification skipped:', err.message);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update maintenance status error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let query;
    if (role === 'tenant') {
      query = `SELECT m.*, p.title as property_title, p.address 
               FROM maintenance_requests m
               JOIN properties p ON m.property_id = p.id
               WHERE m.tenant_id = $1
               ORDER BY m.created_at DESC`;
    } else if (role === 'landlord') {

      query = `SELECT m.*, p.title as property_title, p.address, u.first_name, u.last_name
               FROM maintenance_requests m
               JOIN properties p ON m.property_id = p.id
               JOIN users u ON m.tenant_id = u.id
               WHERE p.landlord_id = $1
               ORDER BY 
                 CASE m.priority
                   WHEN 'urgent' THEN 1
                   WHEN 'high' THEN 2
                   WHEN 'medium' THEN 3
                   ELSE 4
                 END,
                 m.created_at DESC`;
    } else {
      return res.status(403).json({ error: 'Invalid role' });
    }
    
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get maintenance requests error:', error);
    res.status(500).json({ error: error.message });
  }
};