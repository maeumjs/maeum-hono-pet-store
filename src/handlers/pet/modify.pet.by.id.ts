import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import {
  ModifyPetRepositorySchema,
  petRepository,
  ReadPetRepositorySchema,
} from '#/repository/database/pet.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const modifyPetRoute = createRoute({
  method: 'patch',
  path: '/pet/{id}',
  description: 'Modify Pet',
  operationId: 'modifyPetById',
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
          schema: ModifyPetRepositorySchema,
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
      description: 'Pet modify successfully',
    },
  },
});

export const modifyPetHandler: RouteHandler<typeof modifyPetRoute> = async (c) => {
  const body = await c.req.json();
  const result = await petRepository.modifyPet(BigInt(c.req.param().id), body);
  return c.json(result);
};
