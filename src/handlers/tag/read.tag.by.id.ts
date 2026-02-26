import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { tagRepository } from '#/repository/database/tag.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
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
    404: {
      content: {
        'application/json': {
          schema: RestErrorSchema.openapi('Error'),
        },
      },
      description: 'Tag not found',
    },
    500: {
      content: {
        'application/json': {
          schema: RestErrorSchema.openapi('Error'),
        },
      },
      description: 'Internal Server Error',
    },
  },
});

export const readTagByIdHandler: RouteHandler<typeof readTagByIdRoute> = async (c) => {
  const results = await tagRepository.readNullableTagById(BigInt(c.req.param().id));
  const result = results?.at(0);

  if (result == null) {
    return c.json({ code: 'not found', message: 'tag not found' }, 404);
  }

  return c.json(result, 200);
};
