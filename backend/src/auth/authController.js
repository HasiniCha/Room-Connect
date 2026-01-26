const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../db/postgres');


exports.register = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone } = req.body;
    

    if (!email || !password || !role || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    

    if (!['landlord', 'tenant'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be landlord or tenant' });
    }
    

    const passwordHash = await bcrypt.hash(password, 10);
    

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, role, first_name, last_name, phone, verified, created_at`,
      [email, passwordHash, role, firstName, lastName, phone || null]
    );
    
    const user = result.rows[0];
    

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      message: 'Registration successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        verified: user.verified
      },
      token 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
 
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    

    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    
    res.json({ 
      message: 'Login successful',
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        verified: user.verified
      },
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT id, email, role, first_name, last_name, phone, verified, created_at 
       FROM users WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    
    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      verified: user.verified,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};


exports.logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};