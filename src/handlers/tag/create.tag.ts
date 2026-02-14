import { createRoute } from '@hono/zod-openapi';

import { tagRepository } from '#/repository/database/v1/tag.repository';
import { TagInsertSchema, TagSelectSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const createTagRoute = createRoute({
  method: 'post',
  path: '/tag',
  description: 'Create Tag',
  operationId: 'createTag',
  tags: ['Tag'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: TagInsertSchema.openapi('Tag'),
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

export const createTagHandler: RouteHandler<typeof createTagRoute> = async (c) => {
  const body = await c.req.json();
  const result = await tagRepository.createTag(body);
  return c.json(result);
};
