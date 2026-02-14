import { initApp } from '#/modules/initialize/initApp';
import { initConfig } from '#/modules/initialize/initConfig';
import { initDb } from '#/modules/initialize/initDb';
import { initDotEnv } from '#/modules/initialize/initDotEnv';
import { initPackageJson } from '#/modules/initialize/initPackageJson';

/**
 * 초기화 순서를 지켜주세요,
 *
 * ConfigContainer는 SchemaController를 사용합니다
 * EncryptContiner는 DotenvContainer를 사용합니다
 */
/* 01 */ initDotEnv();
// const options = getServerBootstrapOptions(container);
// /* 02 */ await makeAsyncSchemaController(container, options.schema);
// /* 04 */ await makeAsyncI18nContainer(container, options.i18n);
// /* 05 */ makeSyncLoggers(container, 'winston', options.loggers);
// /* 06 */ makeErrorController(container, options.errors);
// /* 07 */ makeEncryptioner(container, { key: process.env.ENV_ENCRYPTION_KEY });
const config = await initConfig();
const packageJson = await initPackageJson();
const app = initApp();
const db = await initDb();

export const container = {
  config,
  packageJson,
  app,
  db,
};
