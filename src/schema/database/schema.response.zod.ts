import { z } from 'zod';

import { BigIntToStringSchema } from '#/schema/common/long.string.zod';
import {
  CategorySelectSchema,
  PhotoUrlSelectSchema,
  TagSelectSchema,
} from '#/schema/database/schema.zod';

// ------------------------------------------------------------------------------------------
// Response schemas: bigint id fields are serialized as string for JSON compatibility
// ------------------------------------------------------------------------------------------

export const CategoryResponseSchema = CategorySelectSchema.extend({
  id: BigIntToStringSchema,
}).omit({ uuid: true });

export const TagResponseSchema = TagSelectSchema.extend({
  id: BigIntToStringSchema,
}).omit({ uuid: true });

export const PhotoUrlResponseSchema = PhotoUrlSelectSchema.extend({
  id: BigIntToStringSchema,
  petId: BigIntToStringSchema,
}).omit({ uuid: true });

export const PetResponseSchema = z.object({
  id: BigIntToStringSchema,
  name: z.string(),
  status: z.number(),
  category: CategoryResponseSchema,
  tags: z.array(TagResponseSchema),
  photoUrls: z.array(PhotoUrlResponseSchema),
});
