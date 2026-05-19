require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./postgres');

const migrate = async () => {
  try {
    console.log('Running database migration...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('Migration complete!');
  } catch (error) {
    // Tables likely already exist - that's fine
    if (error.code === '42P07') {
      console.log('Tables already exist, skipping migration.');
    } else {
      console.error('Migration error:', error.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
};

migrate();
