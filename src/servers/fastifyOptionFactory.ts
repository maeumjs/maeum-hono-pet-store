import { createServer } from 'node:http';

import { CE_DI as SCHEMA_CONTROLLER } from '@maeum/schema-controller';
import { getGenReqID } from '@maeum/tools';
import fastify from 'fastify';

import { container } from '#/modules/di/container';

import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import type { FastifyServerOptions } from 'fastify';

type THttpServerFactory = (
  handler: (req: IncomingMessage, res: ServerResponse) => void,
  _option: FastifyServerOptions,
) => Server;

/**
 * HTTP serverFactory
 */
function httpServerFactory(handler: (req: IncomingMessage, res: ServerResponse) => void): Server {
  const newServer = createServer((req, res) => handler(req, res));
  newServer.keepAliveTimeout = 120 * 100;
  return newServer;
}

export function fastifyOptionFactory() {
  const option: FastifyServerOptions & { serverFactory: THttpServerFactory } = {
    ignoreTrailingSlash: true,
    serverFactory: httpServerFactory,
    genReqId: getGenReqID('tid'),
  };

  const server = fastify(option);
  const schemaController = container.resolve(SCHEMA_CONTROLLER.SCHEMA);
  server.setSchemaController(schemaController.getFastifyController(server));

  return { fastify: server, option };
}
