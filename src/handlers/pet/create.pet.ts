import { createRoute } from '@hono/zod-openapi';

import {
  CreatePetRepositorySchema,
  petRepository,
  ReadPetRepositorySchema,
} from '#/repository/database/pet.repository';

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
          schema: ReadPetRepositorySchema.openapi('Pet'),
        },
      },
      description: 'Pet created successfully',
    },
  },
});

export const createPetHandler: RouteHandler<typeof createPetRoute> = async (c) => {
  const body = await c.req.json();
  const result = await petRepository.createPet(body);

  return c.json(result);
};
