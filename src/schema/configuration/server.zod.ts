import { z } from 'zod';

export const ServerConfigurationSchema = z.object({
  runMode: z.enum(['local', 'develop', 'production']),
  envMode: z.enum(['development', 'production']),
  port: z.number().min(1).max(0xffff),
  log: z.object({
    dir: z.string().default('logs'),
    level: z.enum(['error', 'warn', 'info', 'debug']),
  }),
});
