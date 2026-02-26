import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { petRepository } from '#/repository/database/pet.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
import { PetResponseSchema } from '#/schema/database/schema.response.zod';

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
          schema: PetResponseSchema.openapi('Pet'),
        },
      },
      description: 'Pet read successfully',
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

export const readPetHandler: RouteHandler<typeof readPetRoute> = async (c) => {
  const result = await petRepository.readPetById(BigInt(c.req.param().id));
  return c.json(PetResponseSchema.parse(result), 200);
};
