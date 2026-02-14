import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { orThrow } from 'my-easy-fp';
import pathe from 'pathe';

// eslint-disable-next-line import-x/no-namespace
import * as schema from '#/schema/database/schema.drizzle';

import type { LibSQLDatabase } from 'drizzle-orm/libsql';

export async function initDb(): Promise<LibSQLDatabase<typeof schema>> {
  const dbPath = orThrow(process.env.DB_FILE_NAME);

  // Convert relative path to absolute path based on project root
  const absDbPath = pathe.resolve(dbPath);

  // Ensure the directory exists
  const dbDirPath = pathe.dirname(absDbPath);
  await fs.promises.mkdir(dbDirPath, { recursive: true });

  const client = createClient({ url: pathToFileURL(absDbPath).href });
  const db = drizzle({ client, schema });
  // await db.$client.sync();
  return db;
}
