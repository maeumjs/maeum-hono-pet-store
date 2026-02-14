import { z } from 'zod';

export const ServerConfigurationSchema = z.object({
  runMode: z.enum(['local', 'develop', 'production']),
  envMode: z.enum(['development', 'production']),
  logLevel: z.string(),
  port: z.number().min(1).max(0xffff),
});
