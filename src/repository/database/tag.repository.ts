import { eq, inArray } from 'drizzle-orm';
import { atOrThrow, orThrow } from 'my-easy-fp';

import { container } from '#/loader';
import { NotFoundError } from '#/modules/error/not.found.error';
import { uuidV7Binary } from '#/modules/uuid/uuid.buffer';
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
  use: keyof typeof container.db = 'reader',
): Promise<z.infer<typeof TagSelectSchema>[] | undefined> {
  // Drizzle ORM으로 tag select
  if (use == null || use === 'reader') {
    return container.db.reader.select().from(tags).where(eq(tags.id, id));
  }

  return container.db.writer.select().from(tags).where(eq(tags.id, id));
}

async function readTagById(
  id: bigint,
  use: keyof typeof container.db = 'reader',
): Promise<z.infer<typeof TagSelectSchema>> {
  // Drizzle ORM으로 tag select
  const result = await readNullableTagById(id, use);
  return atOrThrow(result, 0, new NotFoundError(`Cannot found Tag(${id.toString()})`));
}

async function readTagsByIds(
  ids: bigint[],
  use: keyof typeof container.db = 'reader',
): Promise<z.infer<typeof TagSelectSchema>[]> {
  // Drizzle ORM으로 tag select
  if (use == null || use === 'reader') {
    return container.db.reader.select().from(tags).where(inArray(tags.id, ids));
  }

  return container.db.writer.select().from(tags).where(inArray(tags.id, ids));
}

async function createTag(
  tag: z.infer<typeof TagInsertSchema>,
): Promise<z.infer<typeof TagSelectSchema>> {
  // Drizzle ORM으로 tag insert
  const [result] = await container.db.writer
    .insert(tags)
    .values({ uuid: uuidV7Binary(), name: tag.name })
    .$returningId();

  return readTagById(orThrow(result).id, 'writer');
}

async function updateTagById(
  id: bigint,
  tag: z.infer<typeof TagUpdateSchema>,
): Promise<z.infer<typeof TagSelectSchema> | undefined> {
  const result = await readNullableTagById(id, 'writer');

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag update
  await container.db.writer
    .update(tags)
    .set({
      name: tag.name,
    })
    .where(eq(tags.id, id));

  return readTagById(id, 'writer');
}

async function deleteTagById(id: bigint): Promise<z.infer<typeof TagSelectSchema> | undefined> {
  const result = await readNullableTagById(id, 'writer');

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag delete
  await container.db.writer.delete(tags).where(eq(tags.id, id));

  return atOrThrow(result, 0);
}

async function modifyTagById(
  id: bigint,
  tag: z.infer<typeof TagModifySchema>,
): Promise<z.infer<typeof TagSelectSchema> | undefined> {
  const result = await readNullableTagById(id, 'writer');

  if (result == null) {
    return undefined;
  }

  // Drizzle ORM으로 tag update
  await container.db.writer.update(tags).set({ name: tag.name }).where(eq(tags.id, id));

  return readTagById(id, 'writer');
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
