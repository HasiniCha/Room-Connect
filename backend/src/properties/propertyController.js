// backend/src/properties/propertyController.js
const pool = require('../../db/postgres'); 

// Create Property (Landlord only)
exports.createProperty = async (req, res) => {
  try {
    // Accept both camelCase and snake_case
    const { 
      title, 
      description, 
      address, 
      city, 
      monthlyRent, 
      monthly_rent,
      depositAmount, 
      deposit_amount,
      rooms,
      status
    } = req.body;
    
    const landlordId = req.user.id;
    
    // Use whichever format was sent
    const rent = monthlyRent || monthly_rent;
    const deposit = depositAmount || deposit_amount;
    
    // Validate required fields
    if (!title || !rent) {
      return res.status(400).json({ error: 'Title and monthly rent are required' });
    }
    
    const result = await pool.query(
      `INSERT INTO properties (landlord_id, title, description, address, city, monthly_rent, deposit_amount, rooms, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [landlordId, title, description, address, city, rent, deposit, rooms, status || 'available']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get All Properties (with filters)
exports.getProperties = async (req, res) => {
  try {
    const { city, minRent, maxRent, rooms } = req.query;
    
    let query = 'SELECT * FROM properties WHERE status = $1';
    const params = ['available'];
    let paramCount = 1;
    
    if (city) {
      paramCount++;
      query += ` AND city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }
    
    if (minRent) {
      paramCount++;
      query += ` AND monthly_rent >= $${paramCount}`;
      params.push(minRent);
    }
    
    if (maxRent) {
      paramCount++;
      query += ` AND monthly_rent <= $${paramCount}`;
      params.push(maxRent);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Property by ID
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: error.message });
  }
};