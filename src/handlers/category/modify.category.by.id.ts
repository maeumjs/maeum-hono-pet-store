import { createRoute } from '@hono/zod-openapi';

import { categoryRepository } from '#/repository/database/category.repository';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
import { CategorySelectSchema, CategoryUpdateSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const modifyCategoryByIdRoute = createRoute({
  method: 'patch',
  path: '/category/{id}',
  description: 'Modify Category',
  operationId: 'modifyCategoryById',
  tags: ['Category'],
  request: {
    params: CategoryUpdateSchema.pick({ id: true }).openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: '1',
    }),
    body: {
      content: {
        'application/json': {
          schema: CategoryUpdateSchema.omit({ id: true }),
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

export const modifyCategoryByIdHandler: RouteHandler<typeof modifyCategoryByIdRoute> = async (
  c,
) => {
  const body = await c.req.json();
  const params = c.req.param();
  const result = await categoryRepository.modifyCategoryById(BigInt(params.id), body);

  return c.json(result, 200);
};
