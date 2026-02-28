import { describe, expect, it } from 'vitest';

import { UpdatePetRepositorySchema } from './update.pet.repository.schema';

describe('UpdatePetRepositorySchema', () => {
  it('should pass with valid update pet data using category id', () => {
    const validData = {
      name: 'Updated Pet',
      status: 1,
      category: { id: 1n },
      tags: [{ name: 'updated' }],
      photoUrls: ['http://example.com/updated.jpg'],
    };

    const result = UpdatePetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with category name instead of id', () => {
    const validData = {
      name: 'Updated Pet',
      status: 1,
      category: { name: 'Updated Category' },
      tags: [{ id: 1n }],
      photoUrls: [],
    };

    const result = UpdatePetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with mixed tag and category types', () => {
    const validData = {
      name: 'Mixed Pet',
      status: 2,
      category: { id: 2n },
      tags: [{ id: 1n }, { name: 'mixed' }],
      photoUrls: ['http://example.com/mixed1.jpg', 'http://example.com/mixed2.jpg'],
    };

    const result = UpdatePetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when required fields are missing', () => {
    const invalidData = {
      status: 1,
      category: { id: 1n },
      tags: [],
      photoUrls: [],
    };

    const result = UpdatePetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail when category has neither id nor name', () => {
    const invalidData = {
      name: 'Test',
      status: 1,
      category: {},
      tags: [],
      photoUrls: [],
    };

    const result = UpdatePetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should pass when category has both id and name (union allows extra fields)', () => {
    const validData = {
      name: 'Test',
      status: 1,
      category: { id: 1n, name: 'Both' },
      tags: [],
      photoUrls: [],
    };

    const result = UpdatePetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when tag has neither id nor name', () => {
    const invalidData = {
      name: 'Test',
      status: 1,
      category: { id: 1n },
      tags: [{}],
      photoUrls: [],
    };

    const result = UpdatePetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
