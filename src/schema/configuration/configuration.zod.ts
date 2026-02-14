import { z } from 'zod';

import { ServerConfigurationSchema } from '#/schema/configuration/server.zod';

export const ConfigurationSchema = z.object({
  server: ServerConfigurationSchema,
});
