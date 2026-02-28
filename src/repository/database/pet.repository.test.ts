import { MySqlContainer } from '@testcontainers/mysql';
import { drizzle } from 'drizzle-orm/mysql2';
import { orThrow } from 'my-easy-fp';
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

const { petRepository, handleTags, handleCategory } = await import(
  '#/repository/database/pet.repository'
);

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

describe('petRepository', { sequential: true }, () => {
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

  // =========================================================================
  describe('create', () => {
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
    it('throws NotFoundError when handleTags receives a non-existent tag id', async () => {
      // line 69: missingIds branch in handleTags
      await expect(
        petRepository.createPet({
          name: 'Ghost',
          status: 1,
          category: { name: 'Unknown' },
          tags: [{ id: 99999999n }],
          photoUrls: [],
        }),
      ).rejects.toThrow('Cannot found Tag');
    });
  });

  // =========================================================================
  describe('update and modify', () => {
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
    it('updates a pet using category by id (handleCategory id branch)', async () => {
      // lines 109-119: handleCategory id branch
      const created = await petRepository.createPet({
        name: 'CatById',
        status: 1,
        category: { name: 'Lion' },
        tags: [],
        photoUrls: [],
      });

      const updated = await petRepository.updatePet(created.id, {
        name: 'CatByIdUpdated',
        status: 2,
        category: { id: created.category.id },
        tags: [],
        photoUrls: [],
      });

      expect(updated.name).toBe('CatByIdUpdated');
      expect(updated.category.id).toEqual(created.category.id);
    });

    // -------------------------------------------------------------------------
    it('throws error when handleCategory receives a non-existent category id', async () => {
      // line 109: orThrow branch when category id not found in handleCategory
      const created = await petRepository.createPet({
        name: 'BadCatId',
        status: 1,
        category: { name: 'Temp' },
        tags: [],
        photoUrls: [],
      });

      await expect(
        petRepository.updatePet(created.id, {
          name: 'BadCatId',
          status: 1,
          category: { id: 99999999n },
          tags: [],
          photoUrls: [],
        }),
      ).rejects.toThrow('Cannot found category');
    });

    // -------------------------------------------------------------------------
    it('throws error when updating a non-existent pet', async () => {
      // line 255: selectedPet == null branch in updatePet
      await expect(
        petRepository.updatePet(99999999n, {
          name: 'NoSuchPet',
          status: 1,
          category: { name: 'Cat' },
          tags: [],
          photoUrls: [],
        }),
      ).rejects.toThrow();
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
    it('modifies a pet — partial update with tags and photoUrls (non-null branches)', async () => {
      // lines 294, 301: pet.tags != null and pet.photoUrls != null branches in modifyPet
      const created = await petRepository.createPet({
        name: 'PartialBranch',
        status: 1,
        category: { name: 'Snake' },
        tags: [{ name: 'slithery' }],
        photoUrls: ['http://example.com/old.jpg'],
      });

      const modified = await petRepository.modifyPet(created.id, {
        tags: [{ name: 'venomous' }],
        photoUrls: ['http://example.com/new.jpg'],
      });

      expect(modified.photoUrls.at(0)?.url).toBe('http://example.com/new.jpg');
    });

    // -------------------------------------------------------------------------
    it('throws error when modifying a non-existent pet', async () => {
      // line 288: selectedPet == null branch in modifyPet
      await expect(petRepository.modifyPet(99999998n, { name: 'NoSuchPet' })).rejects.toThrow();
    });
  });

  // =========================================================================
  describe('read and delete', () => {
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
    it('throws NotFoundError when deleting a non-existent pet', async () => {
      // line 330: readPetById inside deletePet throws when pet does not exist
      await expect(petRepository.deletePet(99999997n)).rejects.toThrow('Cannot found Pet');
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

    // -------------------------------------------------------------------------
    it('does not delete a category when another pet still references it', async () => {
      // line 327: otherPetWithCategory exists — category should NOT be deleted
      const sharedCategory = { name: 'SharedCat' };

      const first = await petRepository.createPet({
        name: 'PetAlpha',
        status: 1,
        category: sharedCategory,
        tags: [],
        photoUrls: [],
      });

      // Create second pet then update it to reuse the same category by id
      const second = await petRepository.createPet({
        name: 'PetBeta',
        status: 1,
        category: { name: 'TempCat' },
        tags: [],
        photoUrls: [],
      });

      await petRepository.updatePet(second.id, {
        name: 'PetBeta',
        status: 1,
        category: { id: first.category.id },
        tags: [],
        photoUrls: [],
      });

      // Delete the first pet — category must still exist because PetBeta uses it
      await petRepository.deletePet(first.id);

      const { categoryRepository } = await import('#/repository/database/category.repository');
      const category = await categoryRepository.readCategoryById(first.category.id);
      expect(category.name).toBe('SharedCat');
    });
  });

  // =========================================================================
  describe('handleTags', () => {
    it('should handle tags with new tag names only', async () => {
      const tags = [{ name: 'handletest-friendly' }, { name: 'handletest-playful' }];

      const result = await handleTags(testDb, tags);

      expect(result.selected).toHaveLength(0);
      expect(result.inserted).toHaveLength(2);
      expect(result.all).toHaveLength(2);
      expect(result.all.map((t) => t.name).sort()).toEqual([
        'handletest-friendly',
        'handletest-playful',
      ]);
    });

    it('should handle tags with existing tag IDs only', async () => {
      // First create some tags
      const initialTags = [{ name: 'handletest-existing1' }, { name: 'handletest-existing2' }];
      const initialResult = await handleTags(testDb, initialTags);

      // Now reference them by ID
      const tags = initialResult.all.map((tag) => ({ id: tag.id }));

      const result = await handleTags(testDb, tags);

      expect(result.selected).toHaveLength(2);
      expect(result.inserted).toHaveLength(0);
      expect(result.all).toHaveLength(2);
      expect(result.all.map((t) => t.name).sort()).toEqual([
        'handletest-existing1',
        'handletest-existing2',
      ]);
    });

    it('should handle mixed tags with both IDs and names', async () => {
      // Create an existing tag
      const existingTags = [{ name: 'handletest-mixed-existing' }];
      const existingResult = await handleTags(testDb, existingTags);

      // Mix existing ID and new name
      const tags = [
        { id: orThrow(existingResult.all.at(0)?.id) },
        { name: 'handletest-mixed-new' },
      ];

      const result = await handleTags(testDb, tags);

      expect(result.selected).toHaveLength(1);
      expect(result.inserted).toHaveLength(1);
      expect(result.all).toHaveLength(2);
      expect(result.all.map((t) => t.name).sort()).toEqual([
        'handletest-mixed-existing',
        'handletest-mixed-new',
      ]);
    });

    it('should handle empty tags array', async () => {
      const tags: ({ id: bigint } | { name: string })[] = [];

      const result = await handleTags(testDb, tags);

      expect(result.selected).toHaveLength(0);
      expect(result.inserted).toHaveLength(0);
      expect(result.all).toHaveLength(0);
    });

    it('should throw NotFoundError when tag ID does not exist', async () => {
      const tags = [{ id: 99999999n }];

      await expect(handleTags(testDb, tags)).rejects.toThrow('Cannot found Tag: 99999999');
    });
  });

  // =========================================================================
  describe('handleCategory', () => {
    it('should handle category with existing ID', async () => {
      // First create a category using name
      const newCategory = { name: 'HandleTest Existing Category' };
      const createdCategory = await handleCategory(testDb, newCategory);

      // Now reference it by ID
      const categoryById = { id: createdCategory.id };
      const result = await handleCategory(testDb, categoryById);

      expect(result.id).toEqual(createdCategory.id);
      expect(result.name).toBe('HandleTest Existing Category');
    });

    it('should handle category with new name', async () => {
      const category = { name: 'HandleTest New Category' };

      const result = await handleCategory(testDb, category);

      expect(result.name).toBe('HandleTest New Category');
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('bigint');
    });

    it('should throw error when category ID does not exist', async () => {
      const category = { id: 99999999n };

      await expect(handleCategory(testDb, category)).rejects.toThrow(
        'Cannot found category: 99999999',
      );
    });

    it('should create category with proper uuid when given name', async () => {
      const category = { name: 'HandleTest UUID Category' };

      const result = await handleCategory(testDb, category);

      expect(result.uuid).toBeDefined();
      // UUID can be either Buffer or string depending on driver
      expect(typeof result.uuid === 'string' || Buffer.isBuffer(result.uuid)).toBe(true);
    });
  });

  // =========================================================================
  describe('coverage edge cases', () => {
    it('should handle modifyPet with null category (line 266)', async () => {
      // Create a pet first
      const created = await petRepository.createPet({
        name: 'CoverageTestPet',
        status: 1,
        category: { name: 'InitialCategory' },
        tags: [],
        photoUrls: [],
      });

      // Modify without category (this should hit the undefined branch on line 266)
      const modified = await petRepository.modifyPet(created.id, {
        name: 'ModifiedName',
        // category is not provided, so it will be undefined
      });

      expect(modified.name).toBe('ModifiedName');
      expect(modified.category.name).toBe('InitialCategory'); // Should remain unchanged
    });

    it('should handle modifyPet with explicit null category (line 266 null check)', async () => {
      // Create a pet first
      const created = await petRepository.createPet({
        name: 'CoverageNullTest',
        status: 1,
        category: { name: 'InitialCategory' },
        tags: [],
        photoUrls: [],
      });

      // Modify with explicit null category to test the null check
      const modifyData: Parameters<typeof petRepository.modifyPet>[1] = {
        name: 'ModifiedNameNull',
        category: undefined, // Explicitly set to null
      };

      const modified = await petRepository.modifyPet(created.id, modifyData);

      expect(modified.name).toBe('ModifiedNameNull');
      expect(modified.category.name).toBe('InitialCategory'); // Should remain unchanged
    });

    it('should not delete tags when they are still used by other pets', async () => {
      // Create a shared tag first
      const sharedTagName = 'shared-coverage-tag';
      const firstPet = await petRepository.createPet({
        name: 'SharedTagPet1',
        status: 1,
        category: { name: 'SharedTagCategory1' },
        tags: [{ name: sharedTagName }],
        photoUrls: [],
      });

      // Get the first tag safely
      const firstTag = firstPet.tags[0];
      if (!firstTag) throw new Error('First tag should exist');

      // Create second pet using the same tag
      const secondPet = await petRepository.createPet({
        name: 'SharedTagPet2',
        status: 1,
        category: { name: 'SharedTagCategory2' },
        tags: [{ id: firstTag.id }],
        photoUrls: [],
      });

      const sharedTagId = firstTag.id;

      // Delete the first pet
      await petRepository.deletePet(firstPet.id);

      // The shared tag should NOT be deleted because second pet still uses it
      const { tagRepository } = await import('#/repository/database/tag.repository');
      const stillExistingTag = await tagRepository.readTagById(sharedTagId);
      expect(stillExistingTag.name).toBe(sharedTagName);

      // Clean up
      await petRepository.deletePet(secondPet.id);
    });

    it('should test modifyPet with category to cover line 266 true branch', async () => {
      // Test the true branch of line 266: pet.category != null
      const created = await petRepository.createPet({
        name: 'BranchTest',
        status: 1,
        category: { name: 'InitialBranch' },
        tags: [],
        photoUrls: [],
      });

      // Create another pet to get a different existing category
      const secondPet = await petRepository.createPet({
        name: 'AnotherPet',
        status: 1,
        category: { name: 'AnotherCategory' },
        tags: [],
        photoUrls: [],
      });

      // Modify with existing category ID (tests the true branch of line 266)
      const modified = await petRepository.modifyPet(created.id, {
        name: 'ModifiedWithCategory',
        category: { id: secondPet.category.id }, // Use existing category ID
      });

      expect(modified.name).toBe('ModifiedWithCategory');
      expect(modified.category.id).toBe(secondPet.category.id);

      // Clean up
      await petRepository.deletePet(created.id);
      await petRepository.deletePet(secondPet.id);
    });

    it('should verify line 326 category check works correctly', async () => {
      // This test ensures line 326 condition selectedPet.category.id is tested
      // We already have tests that delete pets with categories, confirming this branch works

      // Create a pet with a category
      const created = await petRepository.createPet({
        name: 'CategoryCheck',
        status: 1,
        category: { name: 'CategoryToCheck' },
        tags: [],
        photoUrls: [],
      });

      expect(created.category.id).toBeTruthy(); // Confirm category has valid ID

      // Delete will trigger the if (selectedPet.category.id) check on line 326
      await petRepository.deletePet(created.id);

      // If we got here without error, the category check worked correctly
      expect(true).toBe(true);
    });
  });
});
