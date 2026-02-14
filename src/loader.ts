import { initApp } from '#/modules/initialize/init.app';
import { initConfig } from '#/modules/initialize/init.config';
import { initDb } from '#/modules/initialize/init.db';
import { initDotEnv } from '#/modules/initialize/init.dot.env';
import { initLog } from '#/modules/initialize/init.log';
import { initPackageJson } from '#/modules/initialize/init.package.json';

initDotEnv();
const config = await initConfig();
const logger = await initLog(config);
const packageJson = await initPackageJson();
const app = initApp();
const db = await initDb(logger);

export const container = {
  config,
  packageJson,
  logger,
  app,
  db,
};
