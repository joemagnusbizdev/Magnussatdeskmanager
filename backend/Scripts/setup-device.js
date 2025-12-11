const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDevice() {
  console.log('🚀 Setting up SatDesk 22...');
  
  try {
    // Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        imei VARCHAR(20) UNIQUE NOT NULL,
        device_name VARCHAR(100) NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        sat_desk_name VARCHAR(100) NOT NULL,
        sat_desk_email VARCHAR(255),
        status VARCHAR(20) DEFAULT 'available',
        battery_health INTEGER DEFAULT 100,
        condition VARCHAR(20) DEFAULT 'excellent',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ Table created');

    // Insert device
    const result = await pool.query(`
      INSERT INTO devices (imei, device_name, device_type, sat_desk_name, sat_desk_email, status, battery_health, condition, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (imei) DO NOTHING
      RETURNING *
    `, ['301434036796280', 'SatDesk 22 - InReach Mini 2', 'InReach Mini 2', 'Satdesk 22', 'satdesk22@magnus.co.il', 'available', 100, 'excellent', 'Active SatDesk']);

    console.log('✅ Device added:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

setupDevice();
