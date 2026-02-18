import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod';

import { categories, pets, photoUrls, tags } from '#/schema/database/schema.drizzle';

// ------------------------------------------------------------------------------------------
// Category Schema
// ------------------------------------------------------------------------------------------
export const CategoryInsertSchema = createInsertSchema(categories, {
  name: (schema) => schema.min(1).max(100),
}).omit({ uuid: true });

export const CategorySelectSchema = createSelectSchema(categories);

export const CategoryUpdateSchema = createUpdateSchema(categories, {
  name: (schema) => schema.min(1).max(100),
});

export const CategoryModifySchema = CategoryUpdateSchema.partial();

// ------------------------------------------------------------------------------------------
// Tag Schema
// ------------------------------------------------------------------------------------------
export const TagInsertSchema = createInsertSchema(tags, {
  name: (schema) => schema.min(1).max(100),
}).omit({ uuid: true });

export const TagSelectSchema = createSelectSchema(tags);

export const TagUpdateSchema = createUpdateSchema(tags, {
  name: (schema) => schema.min(1).max(100),
});

export const TagModifySchema = createUpdateSchema(tags, {
  name: (schema) => schema.min(1).max(100).optional(),
});

// ------------------------------------------------------------------------------------------
// PhotoUrl Schema
// ------------------------------------------------------------------------------------------

export const PhotoUrlSelectSchema = createSelectSchema(photoUrls);

// ------------------------------------------------------------------------------------------
// Pet Schema
// ------------------------------------------------------------------------------------------
export const PetInsertSchema = createInsertSchema(pets, {
  name: (schema) => schema.min(1).max(100),
}).omit({ uuid: true });

export const PetSelectSchema = createSelectSchema(pets);

export const PetUpdateSchema = createUpdateSchema(pets, {
  name: (schema) => schema.min(1).max(100),
});

export const PetModifySchema = createUpdateSchema(pets, {
  name: (schema) => schema.min(1).max(100).optional(),
});
