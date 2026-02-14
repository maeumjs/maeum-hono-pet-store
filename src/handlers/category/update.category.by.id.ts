import { createRoute } from '@hono/zod-openapi';

import { categoryRepository } from '#/repository/database/v1/category.repository';
import { CategorySelectSchema, CategoryUpdateSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const updateCategoryByIdRoute = createRoute({
  method: 'put',
  path: '/category/{id}',
  // description, operationId를 적을 때 주의해야한다. Description과 함수 이름으로
  // create, read, update, delete 등이 어울릴 수 있겠지만 patch와 put을 구분하기 어렵고
  // head, option과 같은 특수한 목적의 method도 구분하기 어렵다.
  // 때문에 operationId와 handler function name도 method를 사용하는 것을 더 권장한다.
  description: 'Update Category',
  operationId: 'updateCategoryById',
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

export const updateCategoryByIdHandler: RouteHandler<typeof updateCategoryByIdRoute> = async (
  c,
) => {
  const body = await c.req.json();
  const result = await categoryRepository.updateCategoryById(
    Number.parseInt(c.req.param().id, 10),
    body,
  );

  return c.json(result);
};
