import { createRoute } from '@hono/zod-openapi';

import { categoryRepository } from '#/repository/database/category.repository';
import { CategorySelectSchema, CategoryUpdateSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const deleteCategoryByIdRoute = createRoute({
  method: 'delete',
  path: '/category/{id}',
  // description, operationId를 적을 때 주의해야한다. Description과 함수 이름으로
  // create, read, update, delete 등이 어울릴 수 있겠지만 patch와 put을 구분하기 어렵고
  // head, option과 같은 특수한 목적의 method도 구분하기 어렵다.
  // 때문에 operationId와 handler function name도 method를 사용하는 것을 더 권장한다.
  description: 'Delete Category',
  operationId: 'deleteCategoryById',
  tags: ['Category'],
  request: {
    params: CategoryUpdateSchema.pick({ id: true }).openapi({
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
      description: 'Tag created successfully',
    },
  },
});

export const deleteCategoryByIdHandler: RouteHandler<typeof deleteCategoryByIdRoute> = async (
  c,
) => {
  const result = await categoryRepository.deleteCategoryById(Number.parseInt(c.req.param().id, 10));
  return c.json(result);
};
