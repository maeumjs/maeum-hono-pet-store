import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { petRepository, ReadPetRepositorySchema } from '#/repository/database/pet.repository';
import { SignedLongStringSchema } from '#/schema/common/long.string.zod';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const deletePetRoute = createRoute({
  method: 'delete',
  path: '/pet/{id}',
  description: 'Delete Pet',
  operationId: 'deletePetById',
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
      description: 'Pet delete successfully',
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

export const deletePetHandler: RouteHandler<typeof deletePetRoute> = async (c) => {
  const result = await petRepository.deletePet(BigInt(c.req.param().id));
  return c.json(result, 200);
};
