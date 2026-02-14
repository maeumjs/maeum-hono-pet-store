import z from 'zod';

import { ServerConfigurationSchema } from '#/schema/configuration/server.zod';

export const LogType = z.enum(['server-start', 'db-connect']);

export const ServerStartupLogSchema = z.object({
  type: LogType.extract(['server-start']),
  address: z.union([z.ipv4(), z.ipv6()]),
  port: ServerConfigurationSchema.shape.port,
  run_mode: ServerConfigurationSchema.shape.runMode,
  log_level: ServerConfigurationSchema.shape.log.shape.level,
});

export const DBConnectLogSchema = z.object({
  type: LogType.extract(['db-connect']),
  sqlite3: z.string(),
});

export const LogSchema = z.union([ServerStartupLogSchema, DBConnectLogSchema]);
