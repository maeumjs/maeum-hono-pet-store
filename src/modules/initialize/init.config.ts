import fs from 'node:fs';
import path from 'node:path';

import { parse } from 'jsonc-parser';

import { ConfigurationSchema } from '#/schema/configuration/configuration.zod';
import { ServerConfigurationSchema } from '#/schema/configuration/server.zod';

import type { z } from 'zod';

export async function initConfig(): Promise<z.infer<typeof ConfigurationSchema>> {
  const dirname = path.join(process.cwd(), 'resources', 'configs');
  const runMode = ServerConfigurationSchema.shape.runMode.parse(process.env.RUN_MODE);
  const filename = `config.${runMode}.json`;
  const configBuf = await fs.promises.readFile(path.join(dirname, filename));
  const parsed = parse(configBuf.toString());
  const valiated = ConfigurationSchema.parse(parsed);

  return valiated;
}
