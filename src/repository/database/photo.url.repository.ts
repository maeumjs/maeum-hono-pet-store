import fs from 'node:fs';

import { eq } from 'drizzle-orm';
import { atOrThrow, orThrow } from 'my-easy-fp';
import pathe from 'pathe';
import { v7 as uuidV7 } from 'uuid';

import { container } from '#/loader';
import { NotFoundError } from '#/modules/error/not.found.error';
import { photoUrls } from '#/schema/database/schema.drizzle';

import type { z } from 'zod';

import type { PhotoUrlSelectSchema } from '#/schema/database/schema.zod';
import type { FileUploadSchema } from '#/schema/repository/repository.zod';

async function readNullablePhotoUrlById(
  id: bigint,
  use: keyof typeof container.db = 'reader',
): Promise<z.infer<typeof PhotoUrlSelectSchema>[] | undefined> {
  // Drizzle ORM으로 photo url select
  if (use == null || use === 'reader') {
    return container.db.reader.select().from(photoUrls).where(eq(photoUrls.id, id));
  }

  return container.db.writer.select().from(photoUrls).where(eq(photoUrls.id, id));
}

async function readPhotoUrlById(
  id: bigint,
  use: keyof typeof container.db = 'reader',
): Promise<z.infer<typeof PhotoUrlSelectSchema>> {
  // Drizzle ORM으로 photo url select
  const result = await readNullablePhotoUrlById(id, use);
  return atOrThrow(result, 0, new NotFoundError(`Cannot found PhotoUrl(${id.toString()})`));
}

export async function createPhotoUrl(
  files: z.infer<typeof FileUploadSchema>,
): Promise<z.infer<typeof PhotoUrlSelectSchema>> {
  const cwd = pathe.resolve(process.cwd());
  const imagePath = pathe.join(cwd, 'public', 'images');
  const filePath = pathe.join(cwd, 'public', 'images', files.file.name);
  const photoUrl = [
    [`http://localhost`, `${container.config.server.port}`].join(':'),
    'static',
    files.file.name,
  ].join('/');

  await fs.promises.mkdir(imagePath, { recursive: true });
  await fs.promises.writeFile(filePath, files.file.stream());

  const [nullableInsertedPhotoUrlId] = await container.db.writer
    .insert(photoUrls)
    .values({ url: photoUrl, uuid: uuidV7(), petId: BigInt(files.petId) })
    .$returningId();
  const insertedPhotoUrlId = orThrow(nullableInsertedPhotoUrlId);
  const insertedPhotoUrl = readPhotoUrlById(insertedPhotoUrlId.id, 'writer');

  return insertedPhotoUrl;
}

export const photoUrlRepository = { readNullablePhotoUrlById, readPhotoUrlById, createPhotoUrl };
