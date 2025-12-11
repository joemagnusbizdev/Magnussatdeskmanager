const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

router.get('/api/devices', async (req, res) => {
  try {
    const { available } = req.query;
    
    console.log('📡 Fetching devices...');
    
    let query = 'SELECT id, imei, device_name, device_type, sat_desk_name, sat_desk_email, status, battery_health, condition, created_at FROM devices';
    
    const params = [];
    
    if (available === 'true') {
      query += ' WHERE status = $1';
      params.push('available');
    }
    
    query += ' ORDER BY battery_health DESC, condition DESC';
    
    const result = await pool.query(query, params);
    
    console.log('✅ Found '+ result.rows.length +' devices');
    
    res.json({
      success: true,
      count: result.rows.length,
      devices: result.rows
    });
    
  } catch (error) {
    console.error('❌ Error fetching devices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch devices',
      message: error.message
    });
  }
});

module.exports = router;
