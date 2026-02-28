import { z } from 'zod';

import {
  CategorySelectSchema,
  PetSelectSchema,
  PhotoUrlSelectSchema,
  TagSelectSchema,
} from '#/schema/database/schema.zod';

export const ReadPetRepositorySchema = PetSelectSchema.omit({ categoryId: true }).extend({
  category: CategorySelectSchema,
  tags: z.array(TagSelectSchema),
  photoUrls: z.array(PhotoUrlSelectSchema.omit({ petId: true })),
});
