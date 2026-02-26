import { createRoute } from '@hono/zod-openapi';

import { tagRepository } from '#/repository/database/tag.repository';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
import { TagSelectSchema, TagUpdateSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const deleteTagByIdRoute = createRoute({
  method: 'delete',
  path: '/tag/{id}',
  description: 'Delete Tag',
  operationId: 'deleteTagById',
  tags: ['Tag'],
  request: {
    params: TagUpdateSchema.pick({ id: true }).openapi({
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
      description: 'Tag created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: RestErrorSchema.openapi('Error'),
        },
      },
      description: 'Request parameter error or authorization error',
    },
    404: {
      content: {
        'application/json': {
          schema: RestErrorSchema.openapi('Error'),
        },
      },
      description: 'Not found',
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

export const deleteTagByIdHandler: RouteHandler<typeof deleteTagByIdRoute> = async (c) => {
  const result = await tagRepository.deleteTagById(BigInt(c.req.param().id));
  return c.json(result, 200);
};
