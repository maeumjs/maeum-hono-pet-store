import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import {
  petRepository,
  ReadPetRepositorySchema,
  UpdatePetRepositorySchema,
} from '#/repository/database/pet.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const updatePetRoute = createRoute({
  method: 'put',
  path: '/pet/{id}',
  description: 'Update Pet',
  operationId: 'updatePetById',
  tags: ['Pet'],
  request: {
    params: z.object({ id: SignedLongStringSchema }).openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: '1',
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdatePetRepositorySchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ReadPetRepositorySchema.openapi('Pet'),
        },
      },
      description: 'Pet update successfully',
    },
  },
});

export const updatePetHandler: RouteHandler<typeof updatePetRoute> = async (c) => {
  const body = await c.req.json();
  const result = await petRepository.updatePet(Number.parseInt(c.req.param().id, 10), body);
  return c.json(result);
};
