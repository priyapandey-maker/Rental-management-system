import { getPool } from '../db/pool';

async function run() {
  const pool = getPool();
  try {
    await pool.query("UPDATE IGNORE users SET email = REPLACE(email, 'rentalms.local', 'assetflow.local')");
    await pool.query("UPDATE IGNORE customers SET email = REPLACE(email, 'rentalms.local', 'assetflow.local')");
    await pool.query("UPDATE IGNORE vendors SET email = REPLACE(email, 'rentalms.local', 'assetflow.local')");
    
    // Check results
    const [rows] = await pool.query("SELECT email FROM users WHERE email LIKE '%assetflow.local'");
    console.log("Updated users:", rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
