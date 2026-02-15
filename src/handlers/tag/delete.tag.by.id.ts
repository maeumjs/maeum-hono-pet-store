import { createRoute } from '@hono/zod-openapi';

import { tagRepository } from '#/repository/database/tag.repository';
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
  },
});

export const deleteTagByIdHandler: RouteHandler<typeof deleteTagByIdRoute> = async (c) => {
  const result = await tagRepository.deleteTagById(Number.parseInt(c.req.param().id, 10));
  return c.json(result);
};
