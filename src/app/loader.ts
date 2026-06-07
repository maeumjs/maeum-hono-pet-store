import { isError } from "my-easy-fp";

import { initApp } from "#modules/initialize/init.app.js";
import { initConfig } from "#modules/initialize/init.config.js";
import { initDb } from "#modules/initialize/init.db.js";
import { initDotEnv } from "#modules/initialize/init.dot.env.js";
import { initLog } from "#modules/initialize/init.log.js";
import { initPackageJson } from "#modules/initialize/init.package.json.js";

async function initialize(): Promise<{
  config: Awaited<ReturnType<typeof initConfig>>;
  packageJson: Awaited<ReturnType<typeof initPackageJson>>;
  logger: Awaited<ReturnType<typeof initLog>>;
  app: ReturnType<typeof initApp>;
  db: Awaited<ReturnType<typeof initDb>>;
}> {
  try {
    initDotEnv();
    const config = await initConfig();
    const logger = await initLog(config);
    const packageJson = await initPackageJson();
    const app = initApp();
    const db = await initDb(logger);

    return {
      config,
      packageJson,
      logger,
      app,
      db,
    };
  } catch (caught) {
    const err = isError(caught, new Error("unknown error raised"));
    console.log(err.message);
    console.log(err.stack);

    throw err;
  }
}

export const container = await initialize();
