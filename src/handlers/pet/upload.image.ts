import { createRoute } from '@hono/zod-openapi';

import { photoUrlRepository } from '#/databases/repository/v1/photo.url.repository';
import { PhotoUrlSelectSchema } from '#/schema/database/schema.zod';
import { FileUploadSchema } from '#/schema/repository/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const uploadImageRoute = createRoute({
  method: 'post',
  path: '/pets/uploadImage',
  tags: ['Pet'],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          // 파일 업로드는 반드시 multipart/form-data
          schema: FileUploadSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: PhotoUrlSelectSchema.openapi('PhtoUrl'),
        },
      },
      description: '사진 업로드 성공',
    },
    400: {
      description: '잘못된 파일 형식이거나 요청이 부적절함',
    },
  },
});

export const uploadImageHandler: RouteHandler<typeof uploadImageRoute> = async (c) => {
  const form = c.req.valid('form');
  const result = await photoUrlRepository.createPhotoUrl(form);

  return c.json(result);
};
