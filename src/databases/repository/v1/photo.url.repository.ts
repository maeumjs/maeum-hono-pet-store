import fs from 'node:fs';

import { atOrThrow } from 'my-easy-fp';
import pathe from 'pathe';

import { container } from '#/loader';
import { photoUrls } from '#/schema/database/schema.drizzle';

import type { z } from 'zod';

import type { PhotoUrlSelectSchema } from '#/schema/database/schema.zod';
import type { FileUploadSchema } from '#/schema/repository/schema.zod';

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

  const insertedPhotoUrls = await container.db
    .insert(photoUrls)
    .values({ url: photoUrl, petId: parseInt(files.petId, 10) })
    .returning();
  const insertedPhotoUrl = atOrThrow(insertedPhotoUrls, 0);

  return insertedPhotoUrl;
}

export const photoUrlRepository = { createPhotoUrl };
