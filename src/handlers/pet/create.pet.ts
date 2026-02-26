import { createRoute } from '@hono/zod-openapi';

import { CreatePetRepositorySchema, petRepository } from '#/repository/database/pet.repository';
import { RestErrorSchema } from '#/schema/common/rest.error.zod';
import { PetResponseSchema } from '#/schema/database/schema.response.zod';

import type { RouteHandler } from '@hono/zod-openapi';

export const createPetRoute = createRoute({
  method: 'post',
  path: '/pet',
  description: 'Create Pet',
  operationId: 'createPet',
  tags: ['Pet'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreatePetRepositorySchema,
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
      description: 'Pet created successfully',
    },
    400: {
      content: {
        'application/json': {
          schema: RestErrorSchema.openapi('Error'),
        },
      },
      description: 'Request parameter error or authorization error',
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

export const createPetHandler: RouteHandler<typeof createPetRoute> = async (c) => {
  const body = await c.req.json();
  const result = await petRepository.createPet(body);

  return c.json(PetResponseSchema.parse(result), 200);
};
