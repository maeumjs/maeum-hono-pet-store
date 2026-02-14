import { eq } from 'drizzle-orm';
import { atOrThrow } from 'my-easy-fp';

import { container } from '#/loader';
import { tags } from '#/schema/database/schema.drizzle';

import type z from 'zod';

import type {
  TagInsertSchema,
  TagModifySchema,
  TagSelectSchema,
  TagUpdateSchema,
} from '#/schema/database/schema.zod';

async function createTag(
  tag: z.infer<typeof TagInsertSchema>,
): Promise<z.infer<typeof TagSelectSchema>> {
  // Drizzle ORM으로 tag insert
  const result = await container.db
    .insert(tags)
    .values({
      name: tag.name,
    })
    // returning 은 sqlite3 DB만 사용 가능하다
    .returning();

  return atOrThrow(result, 0);
}

async function readTagById(id: number): Promise<z.infer<typeof TagSelectSchema>> {
  // Drizzle ORM으로 tag select
  const result = await container.db.select().from(tags).where(eq(tags.id, id));

  return atOrThrow(result, 0);
}

async function updateTagById(
  id: number,
  tag: z.infer<typeof TagUpdateSchema>,
): Promise<z.infer<typeof TagSelectSchema>> {
  // Drizzle ORM으로 tag update
  const result = await container.db
    .update(tags)
    .set({
      name: tag.name,
    })
    .where(eq(tags.id, id))
    // returning 은 sqlite3 DB만 사용 가능하다
    .returning();

  return atOrThrow(result, 0);
}

async function deleteTagById(id: number): Promise<z.infer<typeof TagSelectSchema> | undefined> {
  // Drizzle ORM으로 tag select
  const result = await container.db.select().from(tags).where(eq(tags.id, id));

  if (result == null) {
    return undefined;
  }

  await container.db
    .delete(tags)
    .where(eq(tags.id, id))
    // returning 은 sqlite3 DB만 사용 가능하다
    .returning();

  return atOrThrow(result, 0);
}

async function modifyTagById(
  id: number,
  tag: z.infer<typeof TagModifySchema>,
): Promise<z.infer<typeof TagSelectSchema>> {
  // Drizzle ORM으로 tag insert
  const result = await container.db
    .update(tags)
    .set({
      name: tag.name,
    })
    .where(eq(tags.id, id))
    // returning 은 sqlite3 DB만 사용 가능하다
    .returning();

  return atOrThrow(result, 0);
}

export const tagRepository = {
  createTag,
  readTagById,
  updateTagById,
  deleteTagById,
  modifyTagById,
};
