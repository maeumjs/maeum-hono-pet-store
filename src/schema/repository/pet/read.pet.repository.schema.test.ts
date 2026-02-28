import { describe, expect, it } from 'vitest';

import { ReadPetRepositorySchema } from './read.pet.repository.schema';

describe('ReadPetRepositorySchema', () => {
  it('should pass with complete read pet data', () => {
    const validData = {
      id: 1n,
      uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
      name: 'Read Pet',
      status: 1,
      category: {
        id: 1n,
        uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
        name: 'Dogs',
      },
      tags: [
        {
          id: 1n,
          uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
          name: 'friendly',
        },
      ],
      photoUrls: [
        {
          id: 1n,
          uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
          url: 'http://example.com/photo1.jpg',
        },
      ],
    };

    const result = ReadPetRepositorySchema.safeParse(validData);
    if (!result.success) {
      console.log('Schema errors:', result.error.issues);
    }
    expect(result.success).toBe(true);
  });

  it('should pass with empty tags and photoUrls arrays', () => {
    const validData = {
      id: 2n,
      uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
      name: 'Simple Pet',
      status: 1,
      category: {
        id: 2n,
        uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
        name: 'Cats',
      },
      tags: [],
      photoUrls: [],
    };

    const result = ReadPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass with multiple tags and photoUrls', () => {
    const validData = {
      id: 3n,
      uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
      name: 'Multi Pet',
      status: 2,
      category: {
        id: 3n,
        uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
        name: 'Birds',
      },
      tags: [
        {
          id: 1n,
          uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
          name: 'colorful',
        },
        {
          id: 2n,
          uuid: '02020304-0506-0708-090a-0b0c0d0e0f10',
          name: 'singing',
        },
      ],
      photoUrls: [
        {
          id: 1n,
          uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
          url: 'http://example.com/bird1.jpg',
        },
        {
          id: 2n,
          uuid: '02020304-0506-0708-090a-0b0c0d0e0f10',
          url: 'http://example.com/bird2.jpg',
        },
      ],
    };

    const result = ReadPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when required fields are missing', () => {
    const invalidData = {
      uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
      name: 'Incomplete Pet',
      status: 1,
      tags: [],
      photoUrls: [],
    };

    const result = ReadPetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should fail when category is missing', () => {
    const invalidData = {
      id: 1n,
      uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
      name: 'No Category Pet',
      status: 1,
      tags: [],
      photoUrls: [],
    };

    const result = ReadPetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should pass when categoryId is included (omit allows extra fields)', () => {
    const validData = {
      id: 1n,
      uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
      name: 'Valid Pet',
      status: 1,
      categoryId: 1n,
      category: {
        id: 1n,
        uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
        name: 'Dogs',
      },
      tags: [],
      photoUrls: [],
    };

    const result = ReadPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should pass when photoUrl includes petId (omit allows extra fields)', () => {
    const validData = {
      id: 1n,
      uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
      name: 'Valid Pet',
      status: 1,
      category: {
        id: 1n,
        uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
        name: 'Dogs',
      },
      tags: [],
      photoUrls: [
        {
          id: 1n,
          uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
          url: 'http://example.com/photo1.jpg',
          petId: 1n,
        },
      ],
    };

    const result = ReadPetRepositorySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when tag structure is invalid', () => {
    const invalidData = {
      id: 1n,
      uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
      name: 'Invalid Pet',
      status: 1,
      category: {
        id: 1n,
        uuid: '01020304-0506-0708-090a-0b0c0d0e0f10',
        name: 'Dogs',
      },
      tags: [{ name: 'incomplete tag' }],
      photoUrls: [],
    };

    const result = ReadPetRepositorySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
