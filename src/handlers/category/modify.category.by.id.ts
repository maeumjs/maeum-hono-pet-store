import { createRoute } from '@hono/zod-openapi';

import { categoryRepository } from '#/repository/database/category.repository';
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
  },
});

export const modifyCategoryByIdHandler: RouteHandler<typeof modifyCategoryByIdRoute> = async (
  c,
) => {
  const body = await c.req.json();
  const params = c.req.param();
  const result = await categoryRepository.modifyCategoryById(BigInt(params.id), body);

  return c.json(result);
};
