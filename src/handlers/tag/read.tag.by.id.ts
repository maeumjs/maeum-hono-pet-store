import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { tagRepository } from '#/repository/database/v1/tag.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';
import { TagSelectSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const readTagByIdRoute = createRoute({
  method: 'get',
  path: '/tag/{id}',
  description: 'Read Tag By ID(PK)',
  operationId: 'readTagById',
  tags: ['Tag'],
  request: {
    params: z.object({ id: SignedLongStringSchema }).openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: '1',
    }),
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: TagSelectSchema.openapi('Tag'),
        },
      },
      description: 'Tag read successfully',
    },
  },
});

export const readTagByIdHandler: RouteHandler<typeof readTagByIdRoute> = async (c) => {
  const result = await tagRepository.readTagById(Number.parseInt(c.req.param().id, 10));
  return c.json(result);
};
