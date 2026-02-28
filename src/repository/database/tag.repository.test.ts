import { MySqlContainer } from '@testcontainers/mysql';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import * as schema from '#/schema/database/schema.drizzle';

import type { StartedMySqlContainer } from '@testcontainers/mysql';
import type { MySql2Database } from 'drizzle-orm/mysql2';

// ---------------------------------------------------------------------------
// Mock #/loader before importing tagRepository
// ---------------------------------------------------------------------------

let testDb: MySql2Database<typeof schema>;

vi.mock('#/loader', () => ({
  get container() {
    return { db: { writer: testDb, reader: testDb } };
  },
}));

const { tagRepository } = await import('#/repository/database/tag.repository');

// ---------------------------------------------------------------------------
// DDL
// ---------------------------------------------------------------------------
const CREATE_TAGS_TABLE = `
  CREATE TABLE IF NOT EXISTS \`tags\` (
    \`id\`   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`uuid\` BINARY(16)      NOT NULL UNIQUE,
    \`name\` VARCHAR(100)    NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('tagRepository', () => {
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

    await pool.query(CREATE_TAGS_TABLE);
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  // -------------------------------------------------------------------------
  it('creates a new tag and returns it', async () => {
    const tag = await tagRepository.createTag({ name: 'cute' });

    expect(tag.name).toBe('cute');
    expect(typeof tag.id).toBe('bigint');
    expect(tag.id > 0n).toBe(true);
  });

  // -------------------------------------------------------------------------
  it('reads a tag by id', async () => {
    const created = await tagRepository.createTag({ name: 'fluffy' });
    const found = await tagRepository.readTagById(created.id);

    expect(found.id).toEqual(created.id);
    expect(found.name).toBe('fluffy');
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when reading non-existent tag', async () => {
    await expect(tagRepository.readTagById(99999999n)).rejects.toThrow('Cannot found Tag');
  });

  // -------------------------------------------------------------------------
  it('reads multiple tags by ids', async () => {
    const [a, b] = await Promise.all([
      tagRepository.createTag({ name: 'small' }),
      tagRepository.createTag({ name: 'large' }),
    ]);

    const found = await tagRepository.readTagsByIds([a.id, b.id]);

    expect(found).toHaveLength(2);
    expect(found.map((t) => t.name).sort()).toEqual(['large', 'small']);
  });

  // -------------------------------------------------------------------------
  it('updates a tag name', async () => {
    const created = await tagRepository.createTag({ name: 'wild' });
    const updated = await tagRepository.updateTagById(created.id, { name: 'domesticated' });

    expect(updated.name).toBe('domesticated');
    expect(updated.id).toEqual(created.id);
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when updating a non-existent tag', async () => {
    await expect(tagRepository.updateTagById(99999998n, { name: 'ghost' })).rejects.toThrow(
      'Cannot found Tag',
    );
  });

  // -------------------------------------------------------------------------
  it('deletes a tag and returns the deleted record', async () => {
    const created = await tagRepository.createTag({ name: 'temporary' });
    const deleted = await tagRepository.deleteTagById(created.id);

    expect(deleted.id).toEqual(created.id);
    expect(deleted.name).toBe('temporary');

    // Verify it no longer exists
    const rows = await tagRepository.readNullableTagById(created.id);
    expect(rows).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when deleting a non-existent tag', async () => {
    await expect(tagRepository.deleteTagById(99999997n)).rejects.toThrow('Cannot found Tag');
  });

  // -------------------------------------------------------------------------
  it('modifies a tag name', async () => {
    const created = await tagRepository.createTag({ name: 'old' });
    const modified = await tagRepository.modifyTagById(created.id, { name: 'new' });

    expect(modified.name).toBe('new');
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when modifying a non-existent tag', async () => {
    await expect(tagRepository.modifyTagById(99999996n, { name: 'ghost' })).rejects.toThrow(
      'Cannot found Tag',
    );
  });
});
