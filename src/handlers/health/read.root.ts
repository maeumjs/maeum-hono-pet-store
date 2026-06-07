import type { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { container } from "#app/loader.js";
import { ServerConfigurationSchema } from "#schema/configuration/server.zod.js";

const path = "/";

const method: RouteConfig["method"] = "get";

export const route = createRoute({
  method,
  path,
  description: "Server Health",
  operationId: "readRoot",
  tags: ["Common"],
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            server: ServerConfigurationSchema.omit({
              log: true,
            }),
          }),
        },
      },
      description: "Server Health",
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
