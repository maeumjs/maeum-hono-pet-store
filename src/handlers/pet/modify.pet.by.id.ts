import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { ModifyPetRepositorySchema, petRepository } from '#/repository/database/pet.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
import { PetResponseSchema } from '#/schema/database/schema.response.zod';

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
          schema: PetResponseSchema.openapi('Pet'),
        },
      },
      description: 'Pet modify successfully',
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

export const modifyPetHandler: RouteHandler<typeof modifyPetRoute> = async (c) => {
  const body = await c.req.json();
  const result = await petRepository.modifyPet(BigInt(c.req.param().id), body);
  return c.json(PetResponseSchema.parse(result), 200);
};
