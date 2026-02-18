import { eq, inArray } from 'drizzle-orm';
import { atOrThrow, orThrow } from 'my-easy-fp';
import { v7 as uuidV7 } from 'uuid';

import { container } from '#/loader';
import { tags } from '#/schema/database/schema.drizzle';

import type z from 'zod';

import type {
  TagInsertSchema,
  TagModifySchema,
  TagSelectSchema,
  TagUpdateSchema,
} from '#/schema/database/schema.zod';

async function readNullableTagById(
  id: bigint,
): Promise<z.infer<typeof TagSelectSchema>[] | undefined> {
  // Drizzle ORM으로 tag select
  return container.db.select().from(tags).where(eq(tags.id, id));
}

async function readTagById(id: bigint): Promise<z.infer<typeof TagSelectSchema>> {
  // Drizzle ORM으로 tag select
  const result = await readNullableTagById(id);

  return atOrThrow(result, 0);
}

async function readTagsByIds(ids: bigint[]): Promise<z.infer<typeof TagSelectSchema>[]> {
  // Drizzle ORM으로 tag select
  return container.db.select().from(tags).where(inArray(tags.id, ids));
}

async function createTag(
  tag: z.infer<typeof TagInsertSchema>,
): Promise<z.infer<typeof TagSelectSchema>> {
  const uuid = uuidV7();

  // Drizzle ORM으로 tag insert
  const [result] = await container.db.insert(tags).values({ uuid, name: tag.name }).$returningId();

  return readTagById(orThrow(result).id);
}

async function updateTagById(
  id: bigint,
  tag: z.infer<typeof TagUpdateSchema>,
): Promise<z.infer<typeof TagSelectSchema> | undefined> {
  const result = await readNullableTagById(id);

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag update
  await container.db
    .update(tags)
    .set({
      name: tag.name,
    })
    .where(eq(tags.id, id));

  return readTagById(id);
}

async function deleteTagById(id: bigint): Promise<z.infer<typeof TagSelectSchema> | undefined> {
  const result = await readNullableTagById(id);

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag delete
  await container.db.delete(tags).where(eq(tags.id, id));

  return atOrThrow(result, 0);
}

async function modifyTagById(
  id: bigint,
  tag: z.infer<typeof TagModifySchema>,
): Promise<z.infer<typeof TagSelectSchema> | undefined> {
  const result = await readNullableTagById(id);

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag update
  await container.db.update(tags).set({ name: tag.name }).where(eq(tags.id, id));

  return atOrThrow(result, 0);
}

export const tagRepository = {
  createTag,
  readTagById,
  readNullableTagById,
  readTagsByIds,
  updateTagById,
  deleteTagById,
  modifyTagById,
};
