import { initDotEnv } from './src/modules/initialize/initDotEnv';
import { defineConfig } from 'drizzle-kit';

initDotEnv();

export default defineConfig({
  out: './drizzle',
  schema: ['./src/schema/Database/schema.drizzle.ts'],
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
