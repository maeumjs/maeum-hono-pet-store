import { z } from 'zod';

import {
  CategorySelectSchema,
  PetInsertSchema,
  PhotoUrlSelectSchema,
  TagSelectSchema,
} from '#/schema/database/schema.zod';

export const UpdatePetRepositorySchema = PetInsertSchema.omit({
  categoryId: true,
  id: true,
}).extend({
  category: z.union([
    CategorySelectSchema.pick({ id: true }),
    CategorySelectSchema.pick({ name: true }),
  ]),
  tags: z.array(
    z.union([TagSelectSchema.pick({ id: true }), TagSelectSchema.pick({ name: true })]),
  ),
  photoUrls: z.array(PhotoUrlSelectSchema.shape.url),
});
