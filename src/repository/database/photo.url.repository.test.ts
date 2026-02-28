import fs from 'node:fs';

import { MySqlContainer } from '@testcontainers/mysql';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { afterAll, assert, beforeAll, describe, expect, it, vi } from 'vitest';

import * as schema from '#/schema/database/schema.drizzle';

import type { StartedMySqlContainer } from '@testcontainers/mysql';
import type { MySql2Database } from 'drizzle-orm/mysql2';

// ---------------------------------------------------------------------------
// Mock #/loader before importing repositories
// ---------------------------------------------------------------------------

let testDb: MySql2Database<typeof schema>;

vi.mock('#/loader', () => ({
  get container() {
    return {
      db: { writer: testDb, reader: testDb },
      config: { server: { port: 3000 } },
    };
  },
}));

// Mock fs.promises so createPhotoUrl does not touch the real filesystem
vi.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
vi.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);

const { photoUrlRepository } = await import('#/repository/database/photo.url.repository');
const { petRepository } = await import('#/repository/database/pet.repository');

// ---------------------------------------------------------------------------
// DDL — all tables required by petRepository (used to seed photo_url rows)
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

describe('photoUrlRepository', () => {
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
  it('reads a photo url by id', async () => {
    const pet = await petRepository.createPet({
      name: 'PetWithPhoto',
      status: 1,
      category: { name: 'Cat' },
      tags: [],
      photoUrls: ['http://example.com/photo1.jpg'],
    });

    const firstPhoto = pet.photoUrls.at(0);
    assert(firstPhoto != null);
    const found = await photoUrlRepository.readPhotoUrlById(firstPhoto.id);

    expect(found.id).toEqual(firstPhoto.id);
    expect(found.url).toBe('http://example.com/photo1.jpg');
    expect(found.petId).toEqual(pet.id);
  });

  // -------------------------------------------------------------------------
  it('throws NotFoundError when reading non-existent photo url', async () => {
    await expect(photoUrlRepository.readPhotoUrlById(99999999n)).rejects.toThrow(
      'Cannot found PhotoUrl',
    );
  });

  // -------------------------------------------------------------------------
  it('returns empty array for readNullablePhotoUrlById when not found', async () => {
    const result = await photoUrlRepository.readNullablePhotoUrlById(99999998n);

    expect(result).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  it('returns the record for readNullablePhotoUrlById when found', async () => {
    const pet = await petRepository.createPet({
      name: 'PetWithPhoto2',
      status: 1,
      category: { name: 'Dog' },
      tags: [],
      photoUrls: ['http://example.com/photo2.jpg'],
    });

    const firstPhoto = pet.photoUrls.at(0);
    assert(firstPhoto != null);
    const result = await photoUrlRepository.readNullablePhotoUrlById(firstPhoto.id);

    const firstResult = result?.at(0);
    assert(firstResult != null);
    expect(firstResult.url).toBe('http://example.com/photo2.jpg');
  });

  // -------------------------------------------------------------------------
  it('reads a photo url via writer db (writer branch)', async () => {
    // line 26: use === 'writer' branch in readNullablePhotoUrlById
    const pet = await petRepository.createPet({
      name: 'PetWithPhoto3',
      status: 1,
      category: { name: 'Turtle' },
      tags: [],
      photoUrls: ['http://example.com/photo3.jpg'],
    });

    const firstPhoto = pet.photoUrls.at(0);
    assert(firstPhoto != null);

    const result = await photoUrlRepository.readNullablePhotoUrlById(firstPhoto.id, 'writer');
    const firstResult = result?.at(0);
    assert(firstResult != null);
    expect(firstResult.url).toBe('http://example.com/photo3.jpg');

    const found = await photoUrlRepository.readPhotoUrlById(firstPhoto.id, 'writer');
    expect(found.id).toEqual(firstPhoto.id);
  });

  // -------------------------------------------------------------------------
  it('creates a photo url from an uploaded file', async () => {
    // lines 41-60: createPhotoUrl (fs mocked above)
    const pet = await petRepository.createPet({
      name: 'PetForUpload',
      status: 1,
      category: { name: 'Frog' },
      tags: [],
      photoUrls: [],
    });

    const mockFile = {
      name: 'test-image.jpg',
      stream: () => Buffer.from('fake-image-data'),
    } as unknown as File;

    const created = await photoUrlRepository.createPhotoUrl({
      file: mockFile,
      petId: pet.id.toString(),
    });

    expect(created.url).toContain('test-image.jpg');
    expect(created.petId).toEqual(pet.id);
  });
});
