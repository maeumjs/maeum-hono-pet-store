import { z } from '@hono/zod-openapi';

import { SignedLongStringSchema } from '#/schema/common/long.string.zod';

// 파일 업로드를 위한 스키마
export const FileUploadSchema = z.object({
  file: z.instanceof(File).openapi({
    type: 'string',
    format: 'binary',
    description: '업로드할 이미지 파일 (jpg, png, webp)',
  }),
  petId: SignedLongStringSchema.openapi({
    example: 123,
    description: '사진을 업로드하는 Pet의 ID',
  }),
});
