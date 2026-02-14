import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { petRepository, ReadPetRepositorySchema } from '#/databases/repository/v1/pet.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';

import type { RouteHandler } from '@hono/zod-openapi';
// read.pet.by.id
export const readPetRoute = createRoute({
  method: 'get',
  path: '/pet/{id}',
  description: 'Read Pet',
  operationId: 'readPetById',
  tags: ['Pet'],
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
          schema: ReadPetRepositorySchema.openapi('Pet'),
        },
      },
      description: 'Pet read successfully',
    },
  },
});

export const readPetHandler: RouteHandler<typeof readPetRoute> = async (c) => {
  const result = await petRepository.readPetById(Number.parseInt(c.req.param().id, 10));
  return c.json(result);
};
