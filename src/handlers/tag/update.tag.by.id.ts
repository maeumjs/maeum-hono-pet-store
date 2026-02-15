import { createRoute } from '@hono/zod-openapi';

import { tagRepository } from '#/repository/database/tag.repository';
import { TagSelectSchema, TagUpdateSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const updateTagByIdRoute = createRoute({
  method: 'put',
  path: '/tag/{id}',
  description: 'Update Tag',
  operationId: 'updateTagById',
  tags: ['Tag'],
  request: {
    params: TagUpdateSchema.pick({ id: true }).openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: '1',
    }),
    body: {
      content: {
        'application/json': {
          schema: TagUpdateSchema.omit({ id: true }),
        },
      },
    },
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

export const updateTagByIdHandler: RouteHandler<typeof updateTagByIdRoute> = async (c) => {
  const body = await c.req.json();
  const params = c.req.param();

  const result = await tagRepository.updateTagById(Number.parseInt(params.id, 10), body);

  return c.json(result);
};
