import { getPool } from '../db/pool';

async function run() {
  const pool = getPool();
  try {
    const [rows] = await pool.query('SELECT email, password_hash, user_type FROM users');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
