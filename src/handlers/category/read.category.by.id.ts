import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { categoryRepository } from '#/repository/database/v1/category.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';
import { CategorySelectSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const readCategoryByIdRoute = createRoute({
  method: 'get',
  path: '/category/{id}',
  description: 'Read Category By ID(PK)',
  operationId: 'readCategoryById',
  tags: ['Category'],
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
          schema: CategorySelectSchema.openapi('Category'),
        },
      },
      description: 'Tag read successfully',
    },
  },
});

export const readCategoryByIdHandler: RouteHandler<typeof readCategoryByIdRoute> = async (c) => {
  const result = await categoryRepository.readCategoryById(Number.parseInt(c.req.param().id, 10));
  return c.json(result);
};
