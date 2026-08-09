import { getPool } from '../db/pool';

async function run() {
  const pool = getPool();
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email LIKE '%cust-demo-01%'");
    console.log("Customer:", rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
