import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Pool, PoolConnection } from 'mysql2/promise';
import { getPool } from './pool';

export interface MigrationResult {
  migrationName: string;
  checksum: string;
  executionTimeMs: number;
  status: 'EXECUTED' | 'SKIPPED';
}

export interface MigrationSummary {
  success: boolean;
  executedCount: number;
  skippedCount: number;
  totalCount: number;
  results: MigrationResult[];
}

function calculateChecksum(content: string): string {
  return crypto.createHash('sha256').update(content.trim(), 'utf8').digest('hex');
}

export async function ensureSchemaMigrationsTable(connection: PoolConnection): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64) NOT NULL,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      execution_time_ms INT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;
  await connection.query(sql);
}

export async function getExecutedMigrationsMap(connection: PoolConnection): Promise<Map<string, string>> {
  await ensureSchemaMigrationsTable(connection);
  const [rows] = await connection.query<any[]>(
    'SELECT migration_name, checksum FROM schema_migrations ORDER BY id ASC'
  );
  const executedMap = new Map<string, string>();
  for (const row of rows) {
    executedMap.set(row.migration_name, row.checksum);
  }
  return executedMap;
}

export async function runMigrations(
  migrationsDir?: string,
  targetPool?: Pool
): Promise<MigrationSummary> {
  const pool = targetPool || getPool();
  const dir = migrationsDir || path.resolve(process.cwd(), 'src/db/migrations');

  if (!fs.existsSync(dir)) {
    throw new Error(`Migrations directory does not exist: "${dir}"`);
  }

  // Get and sort migration SQL files deterministically
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (files.length === 0) {
    console.warn(`[Migrator] No .sql migration files found in "${dir}"`);
    return {
      success: true,
      executedCount: 0,
      skippedCount: 0,
      totalCount: 0,
      results: [],
    };
  }

  const connection = await pool.getConnection();
  const results: MigrationResult[] = [];
  let executedCount = 0;
  let skippedCount = 0;

  try {
    const executedMap = await getExecutedMigrationsMap(connection);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const checksum = calculateChecksum(sqlContent);

      if (executedMap.has(file)) {
        const previousChecksum = executedMap.get(file);
        if (previousChecksum && previousChecksum !== checksum) {
          console.warn(
            `[Migrator Warning] Migration file "${file}" has changed since execution (checksum mismatch).`
          );
        }
        results.push({
          migrationName: file,
          checksum,
          executionTimeMs: 0,
          status: 'SKIPPED',
        });
        skippedCount++;
        continue;
      }

      console.log(`[Migrator] Executing migration: ${file}...`);
      const startTime = Date.now();

      // Split SQL statements by semicolon if multiple statements exist, filtering empty statements
      const statements = sqlContent
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      await connection.beginTransaction();
      try {
        for (const statement of statements) {
          await connection.query(statement);
        }

        const executionTimeMs = Date.now() - startTime;

        await connection.query(
          `INSERT INTO schema_migrations (migration_name, checksum, execution_time_ms) VALUES (?, ?, ?)`,
          [file, checksum, executionTimeMs]
        );

        await connection.commit();

        console.log(`[Migrator] Successfully executed ${file} (${executionTimeMs}ms)`);
        results.push({
          migrationName: file,
          checksum,
          executionTimeMs,
          status: 'EXECUTED',
        });
        executedCount++;
      } catch (migrationErr) {
        await connection.rollback();
        const errMsg = migrationErr instanceof Error ? migrationErr.message : String(migrationErr);
        console.error(`[Migrator Error] Migration "${file}" failed: ${errMsg}`);
        throw new Error(`Migration "${file}" failed: ${errMsg}`);
      }
    }

    return {
      success: true,
      executedCount,
      skippedCount,
      totalCount: files.length,
      results,
    };
  } finally {
    connection.release();
  }
}
