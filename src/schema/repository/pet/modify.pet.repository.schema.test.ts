import { assert, describe, expect, it } from 'vitest';

import { ModifyPetRepositorySchema } from './modify.pet.repository.schema';

describe('ModifyPetRepositorySchema', () => {
  it('should pass with partial update data - name only', () => {
    const validData = {
      name: 'Modified Pet',
    };

    const result = ModifyPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with partial update data - status only', () => {
    const validData = {
      status: 1,
    };

    const result = ModifyPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with partial update data - category only', () => {
    const validData = {
      category: { id: 1n },
    };

    const result = ModifyPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with partial update data - tags only', () => {
    const validData = {
      tags: [{ name: 'modified' }],
    };

    const result = ModifyPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with partial update data - photoUrls only', () => {
    const validData = {
      photoUrls: ['http://example.com/modified.jpg'],
    };

    const result = ModifyPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with multiple partial fields', () => {
    const validData = {
      name: 'Partially Modified',
      status: 2,
      tags: [{ id: 1n }, { name: 'partial' }],
    };

    const result = ModifyPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with all fields provided', () => {
    const validData = {
      name: 'Fully Modified',
      status: 1,
      category: { name: 'Modified Category' },
      tags: [{ id: 1n }],
      photoUrls: ['http://example.com/full.jpg'],
    };

    const result = ModifyPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when no fields are provided (empty object)', () => {
    const invalidData = {};

    const result = ModifyPetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      assert(firstIssue);
      expect(firstIssue.message).toBe('At least one field must be provided');
    }
  });

  it('should fail when all fields are undefined', () => {
    const invalidData = {
      name: undefined,
      status: undefined,
      category: undefined,
      tags: undefined,
      photoUrls: undefined,
    };

    const result = ModifyPetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      assert(firstIssue);
      expect(firstIssue.message).toBe('At least one field must be provided');
    }
  });

  it('should fail when category is provided but invalid', () => {
    const invalidData = {
      category: {},
    };

    const result = ModifyPetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail when tag is provided but invalid', () => {
    const invalidData = {
      tags: [{}],
    };

    const result = ModifyPetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
