import { createRoute } from '@hono/zod-openapi';

import { tagRepository } from '#/repository/database/tag.repository';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
import { TagResponseSchema } from '#/schema/database/schema.response.zod';
import { TagInsertSchema } from '#/schema/database/schema.zod';

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
          schema: TagResponseSchema.openapi('Tag'),
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

export const createTagHandler: RouteHandler<typeof createTagRoute> = async (c) => {
  const body = await c.req.json();
  const result = await tagRepository.createTag(body);
  return c.json(TagResponseSchema.parse(result), 200);
};
