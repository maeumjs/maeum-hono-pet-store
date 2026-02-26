import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { categoryRepository } from '#/repository/database/category.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
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

export const readCategoryByIdHandler: RouteHandler<typeof readCategoryByIdRoute> = async (c) => {
  const result = await categoryRepository.readCategoryById(BigInt(c.req.param().id));
  return c.json(result, 200);
};
