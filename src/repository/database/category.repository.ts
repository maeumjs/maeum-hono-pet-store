import { eq } from 'drizzle-orm';
import { atOrThrow, orThrow } from 'my-easy-fp';
import { v7 as uuidV7 } from 'uuid';

import { container } from '#/loader';
import { categories } from '#/schema/database/schema.drizzle';

import type z from 'zod';

import type { TDataSource } from '#/schema/database/schema.type';
import type {
  CategoryInsertSchema,
  CategoryModifySchema,
  CategorySelectSchema,
  CategoryUpdateSchema,
} from '#/schema/database/schema.zod';

async function readNullableCategoryById(
  id: bigint,
): Promise<z.infer<typeof CategorySelectSchema>[] | undefined> {
  // Drizzle ORM으로 tag select
  return container.db.select().from(categories).where(eq(categories.id, id));
}

async function readCategoryById(id: bigint): Promise<z.infer<typeof CategorySelectSchema>> {
  // Drizzle ORM으로 tag select
  const result = await readNullableCategoryById(id);
  return atOrThrow(result, 0);
}

async function createCategoryWithDs(
  db: TDataSource,
  tag: z.infer<typeof CategoryInsertSchema>,
): Promise<z.infer<typeof CategorySelectSchema>> {
  const uuid = uuidV7();

  // Drizzle ORM으로 tag insert
  const [result] = await db
    .insert(categories)
    .values({
      name: tag.name,
      uuid,
    })
    .$returningId();

  return readCategoryById(orThrow(result).id);
}

async function createCategory(
  tag: z.infer<typeof CategoryInsertSchema>,
): Promise<z.infer<typeof CategorySelectSchema>> {
  return createCategoryWithDs(container.db, tag);
}

async function updateCategoryById(
  id: bigint,
  tag: z.infer<typeof CategoryUpdateSchema>,
): Promise<z.infer<typeof CategorySelectSchema> | undefined> {
  const result = await readNullableCategoryById(id);

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag update
  await container.db
    .update(categories)
    .set({
      name: tag.name,
    })
    .where(eq(categories.id, id));

  return readCategoryById(id);
}

async function deleteCategoryById(
  id: bigint,
): Promise<z.infer<typeof CategorySelectSchema> | undefined> {
  const result = await readNullableCategoryById(id);

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag delete
  await container.db.delete(categories).where(eq(categories.id, id));

  return atOrThrow(result, 0);
}

async function modifyCategoryById(
  id: bigint,
  tag: z.infer<typeof CategoryModifySchema>,
): Promise<z.infer<typeof CategorySelectSchema> | undefined> {
  const result = await readNullableCategoryById(id);

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 category update
  await container.db.update(categories).set({ name: tag.name }).where(eq(categories.id, id));

  return readCategoryById(id);
}

export const categoryRepository = {
  createCategory,
  createCategoryWithDs,
  readCategoryById,
  readNullableCategoryById,
  updateCategoryById,
  deleteCategoryById,
  modifyCategoryById,
};
