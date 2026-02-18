import fs from 'node:fs';

import { eq } from 'drizzle-orm';
import { atOrThrow, orThrow } from 'my-easy-fp';
import pathe from 'pathe';
import { v7 as uuidV7 } from 'uuid';

import { container } from '#/loader';
import { photoUrls } from '#/schema/database/schema.drizzle';

import type { z } from 'zod';

import type { PhotoUrlSelectSchema } from '#/schema/database/schema.zod';
import type { FileUploadSchema } from '#/schema/repository/repository.zod';

async function readNullablePhotoUrlById(
  id: bigint,
): Promise<z.infer<typeof PhotoUrlSelectSchema>[] | undefined> {
  // Drizzle ORM으로 tag select
  return container.db.writer.select().from(photoUrls).where(eq(photoUrls.id, id));
}

async function readPhotoUrlById(id: bigint): Promise<z.infer<typeof PhotoUrlSelectSchema>> {
  // Drizzle ORM으로 tag select
  const result = await readNullablePhotoUrlById(id);
  return atOrThrow(result, 0);
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
  const insertedPhotoUrl = readPhotoUrlById(insertedPhotoUrlId.id);

  return insertedPhotoUrl;
}

export const photoUrlRepository = { readNullablePhotoUrlById, readPhotoUrlById, createPhotoUrl };
