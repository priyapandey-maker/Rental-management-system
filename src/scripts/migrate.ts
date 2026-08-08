import { testConnection, closePool } from '../db/pool';
import { runMigrations } from '../db/migrator';

async function main() {
  console.log('=== RENTAL MANAGEMENT SYSTEM — MIGRATION RUNNER ===');

  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Fatal: Unable to connect to MySQL database. Aborting migrations.');
    process.exit(1);
  }

  try {
    const summary = await runMigrations();
    console.log('\n--- Migration Execution Summary ---');
    console.log(`Total Migration Files : ${summary.totalCount}`);
    console.log(`Executed              : ${summary.executedCount}`);
    console.log(`Skipped (Already Run) : ${summary.skippedCount}`);
    console.log('====================================================\n');
    await closePool();
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n[Migration Failure] ${message}`);
    await closePool();
    process.exit(1);
  }
}

main();
