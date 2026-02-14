import { createRoute } from '@hono/zod-openapi';

import { categoryRepository } from '#/repository/database/v1/category.repository';
import { CategoryInsertSchema, CategorySelectSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const createCategoryRoute = createRoute({
  method: 'post',
  path: '/category',
  description: 'Create Category',
  operationId: 'createCategory',
  tags: ['Category'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CategoryInsertSchema.openapi('Category'),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: CategorySelectSchema.openapi('Category'),
        },
      },
      description: 'Category created successfully',
    },
  },
});

export const createCategoryHandler: RouteHandler<typeof createCategoryRoute> = async (c) => {
  const body = await c.req.json();
  const result = await categoryRepository.createCategory(body);

  return c.json(result);
};
