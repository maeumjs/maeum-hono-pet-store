import { isError } from 'my-easy-fp';

import { initApp } from '#/modules/initialize/init.app';
import { initConfig } from '#/modules/initialize/init.config';
import { initDb } from '#/modules/initialize/init.db';
import { initDotEnv } from '#/modules/initialize/init.dot.env';
import { initLog } from '#/modules/initialize/init.log';
import { initPackageJson } from '#/modules/initialize/init.package.json';

import type { AsyncReturnType } from 'type-fest';

async function initialize(): Promise<{
  config: AsyncReturnType<typeof initConfig>;
  packageJson: AsyncReturnType<typeof initPackageJson>;
  logger: AsyncReturnType<typeof initLog>;
  app: ReturnType<typeof initApp>;
  db: AsyncReturnType<typeof initDb>;
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
    const err = isError(caught, new Error('unknown error raised'));
    console.log(err.message);
    console.log(err.stack);

    throw err;
  }
}

export const container = await initialize();
