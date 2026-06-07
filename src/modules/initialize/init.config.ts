import fs from "node:fs";
import path from "node:path";

import { parse } from "jsonc-parser";
import type { z } from "zod";
import { ConfigurationSchema } from "#schema/configuration/configuration.zod.js";
import { ServerConfigurationSchema } from "#schema/configuration/server.zod.js";

export async function initConfig(): Promise<z.infer<typeof ConfigurationSchema>> {
  const extname = "jsonc";
  const dirname = path.join(process.cwd(), "resources", "configs");
  const runMode = ServerConfigurationSchema.shape.runMode.parse(process.env.RUN_MODE);
  const filename = `config.${runMode}.${extname}`;
  const configBuf = await fs.promises.readFile(path.join(dirname, filename));
  const parsed = parse(configBuf.toString());
  const valiated = ConfigurationSchema.parse(parsed);

  return valiated;
}
