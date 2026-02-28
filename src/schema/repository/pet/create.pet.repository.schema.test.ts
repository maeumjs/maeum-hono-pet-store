import { describe, expect, it } from 'vitest';

import { CreatePetRepositorySchema } from './create.pet.repository.schema';

describe('CreatePetRepositorySchema', () => {
  it('should pass with valid create pet data using category name', () => {
    const validData = {
      name: 'Fluffy',
      status: 1,
      category: { name: 'Dogs' },
      tags: [{ name: 'friendly' }],
      photoUrls: ['http://example.com/photo1.jpg'],
    };

    const result = CreatePetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with tag id instead of name', () => {
    const validData = {
      name: 'Rex',
      status: 1,
      category: { name: 'Dogs' },
      tags: [{ id: 1n }],
      photoUrls: [],
    };

    const result = CreatePetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with mixed tag types', () => {
    const validData = {
      name: 'Buddy',
      status: 2,
      category: { name: 'Cats' },
      tags: [{ id: 1n }, { name: 'playful' }],
      photoUrls: ['http://example.com/photo1.jpg', 'http://example.com/photo2.jpg'],
    };

    const result = CreatePetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when required fields are missing', () => {
    const invalidData = {
      status: 1,
      category: { name: 'Dogs' },
      tags: [],
      photoUrls: [],
    };

    const result = CreatePetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail when category is missing name', () => {
    const invalidData = {
      name: 'Test',
      status: 1,
      category: {},
      tags: [],
      photoUrls: [],
    };

    const result = CreatePetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail when tag has neither id nor name', () => {
    const invalidData = {
      name: 'Test',
      status: 1,
      category: { name: 'Dogs' },
      tags: [{}],
      photoUrls: [],
    };

    const result = CreatePetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
