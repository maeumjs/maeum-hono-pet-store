import { createRoute } from '@hono/zod-openapi';

import { tagRepository } from '#/databases/repository/v1/tag.repository';
import { TagSelectSchema, TagUpdateSchema } from '#/schema/database/schema.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const modifyTagByIdRoute = createRoute({
  method: 'patch',
  path: '/tag/{id}',
  // description, operationId를 적을 때 주의해야한다. Description과 함수 이름으로
  // create, read, update, delete 등이 어울릴 수 있겠지만 patch와 put을 구분하기 어렵고
  // head, option과 같은 특수한 목적의 method도 구분하기 어렵다.
  // 때문에 operationId와 handler function name도 method를 사용하는 것을 더 권장한다.
  description: 'Modify Tag',
  operationId: 'modifyTagById',
  tags: ['Tag'],
  request: {
    params: TagUpdateSchema.pick({ id: true }).openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: '1',
    }),
    body: {
      content: {
        'application/json': {
          schema: TagUpdateSchema.omit({ id: true }).openapi('Tag'),
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

export const modifyTagByIdHandler: RouteHandler<typeof modifyTagByIdRoute> = async (c) => {
  const body = await c.req.json();
  const params = c.req.param();

  const result = await tagRepository.modifyTagById(Number.parseInt(params.id, 10), body);

  return c.json(result);
};
