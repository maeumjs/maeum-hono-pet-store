import { MySqlContainer } from '@testcontainers/mysql';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { afterAll, assert, beforeAll, describe, expect, it, vi } from 'vitest';

import * as schema from '#/schema/database/schema.drizzle';

import type { StartedMySqlContainer } from '@testcontainers/mysql';
import type { MySql2Database } from 'drizzle-orm/mysql2';

// ---------------------------------------------------------------------------
// Mock #/loader before importing petRepository / categoryRepository
// ---------------------------------------------------------------------------

let testDb: MySql2Database<typeof schema>;

vi.mock('#/loader', () => ({
  get container() {
    return { db: { writer: testDb, reader: testDb } };
  },
}));

const { petRepository } = await import('#/repository/database/pet.repository');

// ---------------------------------------------------------------------------
// DDL — all tables required by petRepository (transactions touch all of them)
// ---------------------------------------------------------------------------
const DDL = `
  CREATE TABLE IF NOT EXISTS \`categories\` (
    \`id\`   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`uuid\` BINARY(16)      NOT NULL UNIQUE,
    \`name\` VARCHAR(100)    NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS \`tags\` (
    \`id\`   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`uuid\` BINARY(16)      NOT NULL UNIQUE,
    \`name\` VARCHAR(100)    NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS \`pets\` (
    \`id\`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`uuid\`        BINARY(16)      NOT NULL UNIQUE,
    \`name\`        VARCHAR(100)    NOT NULL,
    \`status\`      INT             NOT NULL,
    \`category_id\` BIGINT UNSIGNED NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS \`photo_urls\` (
    \`id\`     BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    \`uuid\`   BINARY(16)      NOT NULL UNIQUE,
    \`url\`    VARCHAR(500)    NOT NULL,
    \`pet_id\` BIGINT UNSIGNED NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

  CREATE TABLE IF NOT EXISTS \`pets_to_tags\` (
    \`pet_id\` BIGINT UNSIGNED NOT NULL,
    \`tag_id\` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (\`pet_id\`, \`tag_id\`),
    INDEX \`idx__pet_id\` (\`pet_id\`),
    INDEX \`idx__tag_id\` (\`tag_id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`;

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('petRepository', () => {
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
      connectionLimit: 10,
      multipleStatements: true,
    });

    testDb = drizzle(pool, { schema, mode: 'default' });

    await pool.query(DDL);
  }, 60_000);

  afterAll(async () => {
    await pool.end();
    await container.stop();
  });

  // -------------------------------------------------------------------------
  it('creates a pet with a new category and new tags', async () => {
    const pet = await petRepository.createPet({
      name: 'Nabi',
      status: 1,
      category: { name: 'Cat' },
      tags: [{ name: 'cute' }, { name: 'fluffy' }],
      photoUrls: ['http://example.com/nabi.jpg'],
    });

    expect(pet.name).toBe('Nabi');
    expect(pet.status).toBe(1);
    expect(pet.category.name).toBe('Cat');
    expect(pet.tags).toHaveLength(2);
    expect(pet.tags.map((t) => t.name).sort()).toEqual(['cute', 'fluffy']);
    expect(pet.photoUrls).toHaveLength(1);
    expect(pet.photoUrls.at(0)?.url).toBe('http://example.com/nabi.jpg');
  });

  // -------------------------------------------------------------------------
  it('reads a pet by id', async () => {
    const created = await petRepository.createPet({
      name: 'Momo',
      status: 2,
      category: { name: 'Dog' },
      tags: [{ name: 'loyal' }],
      photoUrls: [],
    });

    const found = await petRepository.readPetById(created.id);

    assert(found != null);
    expect(found.id).toEqual(created.id);
    expect(found.name).toBe('Momo');
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when reading non-existent pet', async () => {
    await expect(petRepository.readPetById(99999999n)).rejects.toThrow('Cannot found Pet');
  });

  // -------------------------------------------------------------------------
  it('updates a pet — replaces name, status, category, tags, photoUrls', async () => {
    const created = await petRepository.createPet({
      name: 'Coco',
      status: 1,
      category: { name: 'Hamster' },
      tags: [{ name: 'small' }],
      photoUrls: ['http://example.com/old.jpg'],
    });

    const updated = await petRepository.updatePet(created.id, {
      name: 'CocoPlusCo',
      status: 3,
      category: { id: created.category.id },
      tags: [{ name: 'tiny' }],
      photoUrls: ['http://example.com/new.jpg'],
    });

    expect(updated.name).toBe('CocoPlusCo');
    expect(updated.status).toBe(3);
    expect(updated.photoUrls.at(0)?.url).toBe('http://example.com/new.jpg');
  });

  // -------------------------------------------------------------------------
  it('modifies a pet — partial update of name only', async () => {
    const created = await petRepository.createPet({
      name: 'Bori',
      status: 1,
      category: { name: 'Rabbit' },
      tags: [],
      photoUrls: [],
    });

    const modified = await petRepository.modifyPet(created.id, { name: 'BoriNew' });

    expect(modified.name).toBe('BoriNew');
    expect(modified.status).toBe(1);
  });

  // -------------------------------------------------------------------------
  it('deletes a pet and returns the snapshot', async () => {
    const created = await petRepository.createPet({
      name: 'Ttori',
      status: 1,
      category: { name: 'Bird' },
      tags: [{ name: 'noisy' }],
      photoUrls: ['http://example.com/ttori.jpg'],
    });

    const deleted = await petRepository.deletePet(created.id);

    expect(deleted.id).toEqual(created.id);
    expect(deleted.name).toBe('Ttori');

    // Verify it no longer exists
    await expect(petRepository.readPetById(created.id)).rejects.toThrow('Cannot found Pet');
  });

  // -------------------------------------------------------------------------
  it('creates a pet with existing tags (by id)', async () => {
    // First create a pet to produce a tag
    const first = await petRepository.createPet({
      name: 'TagOwner',
      status: 1,
      category: { name: 'Fish' },
      tags: [{ name: 'scaly' }],
      photoUrls: [],
    });

    const existingTagId = first.tags.at(0)?.id;

    assert(existingTagId != null);

    // Second pet references the existing tag by id
    const second = await petRepository.createPet({
      name: 'TagBorrower',
      status: 1,
      category: { name: 'Fish2' },
      tags: [{ id: existingTagId }],
      photoUrls: [],
    });

    expect(second.tags.at(0)?.id).toEqual(existingTagId);
  });

  // -------------------------------------------------------------------------
  it('dangling tags are deleted when a pet is deleted', async () => {
    const created = await petRepository.createPet({
      name: 'Dangler',
      status: 1,
      category: { name: 'Parrot' },
      tags: [{ name: 'unique-tag-xyz' }],
      photoUrls: [],
    });

    const tagId = created.tags.at(0)?.id;

    assert(tagId != null);

    await petRepository.deletePet(created.id);

    // The tag should be gone since no other pet references it
    const { tagRepository } = await import('#/repository/database/tag.repository');
    await expect(tagRepository.readTagById(tagId)).rejects.toThrow('Cannot found Tag');
  });
});
