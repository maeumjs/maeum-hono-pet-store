import { eq } from 'drizzle-orm';
import { atOrThrow, orThrow } from 'my-easy-fp';

import { container } from '#/loader';
import { NotFoundError } from '#/modules/error/not.found.error';
import { uuidV7Binary } from '#/modules/uuid/uuid.buffer';
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
  use: keyof typeof container.db = 'reader',
): Promise<z.infer<typeof CategorySelectSchema>[]> {
  // Drizzle ORM으로 tag select
  if (use == null || use === 'reader') {
    return container.db.reader.select().from(categories).where(eq(categories.id, id));
  }

  return container.db.writer.select().from(categories).where(eq(categories.id, id));
}

async function readCategoryById(
  id: bigint,
  use: keyof typeof container.db = 'reader',
): Promise<z.infer<typeof CategorySelectSchema>> {
  // Drizzle ORM으로 tag select
  const result = await readNullableCategoryById(id, use);
  return atOrThrow(result, 0, new NotFoundError(`Cannot found Category(${id.toString()})`));
}

async function createCategoryWithDs(
  db: TDataSource,
  tag: z.infer<typeof CategoryInsertSchema>,
): Promise<z.infer<typeof CategorySelectSchema>> {
  // Drizzle ORM으로 tag insert
  const [result] = await db
    .insert(categories)
    .values({
      name: tag.name,
      uuid: uuidV7Binary(),
    })
    .$returningId();

  const { id } = orThrow(result);
  const rows = await db.select().from(categories).where(eq(categories.id, id));
  return atOrThrow(rows, 0, new NotFoundError(`Cannot found Category(${id.toString()})`));
}

async function createCategory(
  tag: z.infer<typeof CategoryInsertSchema>,
): Promise<z.infer<typeof CategorySelectSchema>> {
  return createCategoryWithDs(container.db.writer, tag);
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
  await container.db.writer
    .update(categories)
    .set({
      name: tag.name,
    })
    .where(eq(categories.id, id));

  return readCategoryById(id, 'writer');
}

async function deleteCategoryById(
  id: bigint,
): Promise<z.infer<typeof CategorySelectSchema> | undefined> {
  const result = await readNullableCategoryById(id);

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag delete
  await container.db.writer.delete(categories).where(eq(categories.id, id));

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
  await container.db.writer.update(categories).set({ name: tag.name }).where(eq(categories.id, id));

  return readCategoryById(id, 'writer');
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
