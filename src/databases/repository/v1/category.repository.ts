import { eq } from 'drizzle-orm';
import { atOrThrow } from 'my-easy-fp';

import { container } from '#/loader';
import { categories } from '#/schema/database/schema.drizzle';

import type z from 'zod';

import type {
  CategoryInsertSchema,
  CategoryModifySchema,
  CategorySelectSchema,
  CategoryUpdateSchema,
} from '#/schema/database/schema.zod';

async function createCategory(
  tag: z.infer<typeof CategoryInsertSchema>,
): Promise<z.infer<typeof CategorySelectSchema>> {
  // Drizzle ORM으로 tag insert
  const result = await container.db
    .insert(categories)
    .values({
      name: tag.name,
    })
    // returning 은 sqlite3 DB만 사용 가능하다
    .returning();

  return atOrThrow(result, 0);
}

async function readCategoryById(id: number): Promise<z.infer<typeof CategorySelectSchema>> {
  // Drizzle ORM으로 tag select
  const result = await container.db.select().from(categories).where(eq(categories.id, id));

  return atOrThrow(result, 0);
}

async function updateCategoryById(
  id: number,
  tag: z.infer<typeof CategoryUpdateSchema>,
): Promise<z.infer<typeof CategorySelectSchema>> {
  // Drizzle ORM으로 tag update
  const result = await container.db
    .update(categories)
    .set({
      name: tag.name,
    })
    .where(eq(categories.id, id))
    // returning 은 sqlite3 DB만 사용 가능하다
    .returning();

  return atOrThrow(result, 0);
}

async function deleteCategoryById(
  id: number,
): Promise<z.infer<typeof CategorySelectSchema> | undefined> {
  // Drizzle ORM으로 tag select
  const result = await container.db.select().from(categories).where(eq(categories.id, id));

  if (result == null) {
    return undefined;
  }

  await container.db
    .delete(categories)
    .where(eq(categories.id, id))
    // returning 은 sqlite3 DB만 사용 가능하다
    .returning();

  return atOrThrow(result, 0);
}

async function modifyCategoryById(
  id: number,
  tag: z.infer<typeof CategoryModifySchema>,
): Promise<z.infer<typeof CategorySelectSchema>> {
  // Drizzle ORM으로 tag insert
  const result = await container.db
    .update(categories)
    .set({
      name: tag.name,
    })
    .where(eq(categories.id, id))
    // returning 은 sqlite3 DB만 사용 가능하다
    .returning();

  return atOrThrow(result, 0);
}

export const categoryRepository = {
  createCategory,
  readCategoryById,
  updateCategoryById,
  deleteCategoryById,
  modifyCategoryById,
};
