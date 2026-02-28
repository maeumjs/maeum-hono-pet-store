import { MySqlContainer } from '@testcontainers/mysql';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { afterAll, assert, beforeAll, describe, expect, it, vi } from 'vitest';

import * as schema from '#/schema/database/schema.drizzle';

import type { StartedMySqlContainer } from '@testcontainers/mysql';
import type { MySql2Database } from 'drizzle-orm/mysql2';

// ---------------------------------------------------------------------------
// Mock #/loader before importing categoryRepository so that repository
// functions use the test container's db instead of the real singleton.
// ---------------------------------------------------------------------------

let testDb: MySql2Database<typeof schema>;

vi.mock('#/loader', () => ({
  get container() {
    return { db: { writer: testDb, reader: testDb } };
  },
}));

// Import after mock is registered
const { categoryRepository } = await import('#/repository/database/category.repository');

// ---------------------------------------------------------------------------
// DDL — mirrors schema.drizzle.ts for the categories table
// ---------------------------------------------------------------------------
const CREATE_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS \`categories\` (
    \`id\`   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`uuid\` BINARY(16)      NOT NULL UNIQUE,
    \`name\` VARCHAR(100)    NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('categoryRepository', () => {
  let container: StartedMySqlContainer;
  let pool: mysql.Pool;

  beforeAll(async () => {
    container = await new MySqlContainer('mysql:8.0')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withUserPassword('test_pass')
      .withRootPassword('root_pass')
      .start();

    pool = mysql.createPool({
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      user: container.getUsername(),
      password: container.getUserPassword(),
      waitForConnections: true,
      connectionLimit: 5,
    });

    testDb = drizzle(pool, { schema, mode: 'default' });

    await pool.query(CREATE_CATEGORIES_TABLE);
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  // -------------------------------------------------------------------------
  it('creates a new category and returns it', async () => {
    const category = await categoryRepository.createCategory({ name: 'Dogs' });

    expect(category.name).toBe('Dogs');
    expect(typeof category.id).toBe('bigint');
    expect(category.id > 0n).toBe(true);
  });

  // -------------------------------------------------------------------------
  it('reads a category by id', async () => {
    const created = await categoryRepository.createCategory({ name: 'Cats' });
    const found = await categoryRepository.readCategoryById(created.id);

    expect(found.id).toEqual(created.id);
    expect(found.name).toBe('Cats');
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when reading non-existent category', async () => {
    await expect(categoryRepository.readCategoryById(99999999n)).rejects.toThrow(
      'Cannot found Category',
    );
  });

  // -------------------------------------------------------------------------
  it('updates a category name', async () => {
    const created = await categoryRepository.createCategory({ name: 'Birds' });
    const updated = await categoryRepository.updateCategoryById(created.id, {
      name: 'Exotic Birds',
    });

    assert(updated != null);
    expect(updated.name).toBe('Exotic Birds');
    expect(updated.id).toEqual(created.id);
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when updating a non-existent category', async () => {
    await expect(
      categoryRepository.updateCategoryById(99999998n, { name: 'Ghost' }),
    ).rejects.toThrow('Cannot found Category');
  });

  // -------------------------------------------------------------------------
  it('deletes a category and returns the deleted record', async () => {
    const created = await categoryRepository.createCategory({ name: 'Fish' });
    const deleted = await categoryRepository.deleteCategoryById(created.id);

    assert(deleted != null);
    expect(deleted.id).toEqual(created.id);
    expect(deleted.name).toBe('Fish');

    // Verify it no longer exists
    const rows = await categoryRepository.readNullableCategoryById(created.id);
    expect(rows).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when deleting a non-existent category', async () => {
    await expect(categoryRepository.deleteCategoryById(99999997n)).rejects.toThrow(
      'Cannot found Category',
    );
  });

  // -------------------------------------------------------------------------
  it('modifies a category name', async () => {
    const created = await categoryRepository.createCategory({ name: 'Reptiles' });
    const modified = await categoryRepository.modifyCategoryById(created.id, {
      name: 'Exotic Reptiles',
    });

    assert(modified != null);
    expect(modified.name).toBe('Exotic Reptiles');
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when modifying a non-existent category', async () => {
    await expect(
      categoryRepository.modifyCategoryById(99999996n, { name: 'Ghost' }),
    ).rejects.toThrow('Cannot found Category');
  });

  // -------------------------------------------------------------------------
  it('creates multiple categories with unique ids', async () => {
    const [a, b] = await Promise.all([
      categoryRepository.createCategory({ name: 'Amphibians' }),
      categoryRepository.createCategory({ name: 'Invertebrates' }),
    ]);

    expect(a.id).not.toEqual(b.id);
    expect(a.uuid).not.toEqual(b.uuid);
  });
});
