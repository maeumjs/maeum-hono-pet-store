import { createRoute } from '@hono/zod-openapi';

import { categoryRepository } from '#/repository/database/category.repository';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
import { CategoryResponseSchema } from '#/schema/database/schema.response.zod';
import { CategoryInsertSchema } from '#/schema/database/schema.zod';

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
          schema: CategoryResponseSchema.openapi('Category'),
        },
      },
      description: 'Category created successfully',
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

export const createCategoryHandler: RouteHandler<typeof createCategoryRoute> = async (c) => {
  const body = await c.req.json();
  const result = await categoryRepository.createCategory(body);

  return c.json(CategoryResponseSchema.parse(result), 200);
};
