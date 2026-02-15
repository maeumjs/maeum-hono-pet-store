import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

import { container } from '#/loader';
import { ServerConfigurationSchema } from '#/schema/configuration/server.zod';

import type { RouteConfig, RouteHandler } from '@hono/zod-openapi';

const path = '/health';

const method: RouteConfig['method'] = 'get';

export const route = createRoute({
  method,
  path,
  description: 'Server Health',
  operationId: 'readHealth',
  tags: ['Common'],
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            server: ServerConfigurationSchema.omit({
              log: true,
            }),
          }),
        },
      },
      description: 'Server Health',
    },
  },
});

export const handler: RouteHandler<typeof route> = async (c) =>
  c.json({
    server: {
      envMode: container.config.server.envMode,
      runMode: container.config.server.runMode,
      port: container.config.server.port,
    },
  });
