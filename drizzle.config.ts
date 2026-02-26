import { defineConfig } from 'drizzle-kit';
import { orThrow } from 'my-easy-fp';

import { initDotEnv } from './src/modules/initialize/init.dot.env';

initDotEnv();

const host = orThrow(process.env.DB_PET_STORE_HOST, new Error('Cannot found host'));
const port = parseInt(orThrow(process.env.DB_PET_STORE_PORT, new Error('Cannot found port')), 10);
const database = orThrow(process.env.DB_PET_STORE_DB, new Error('Cannot found db'));
const user = orThrow(process.env.DB_PET_STORE_USERNAME, new Error('Cannot found username'));
const password = orThrow(process.env.DB_PET_STORE_PASSWORD, new Error('Cannot found passwordd'));

console.log('Start drizzle-kit');
console.log('hostname', `${host}:${port}`);
console.log('database', database);
console.log('user', user);

export default defineConfig({
  out: './drizzle',
  schema: ['./src/schema/database/schema.drizzle.ts'],
  dialect: 'mysql',
  dbCredentials: { host, port, database, user, password },
});
