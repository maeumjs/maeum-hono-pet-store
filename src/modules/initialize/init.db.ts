import { drizzle } from 'drizzle-orm/mysql2'; // mysql2용 drizzle
import { orThrow } from 'my-easy-fp';
import mysql from 'mysql2/promise'; // mysql2 드라이버

import { applyRequestIdCommentMiddleware } from '#/modules/database/request.id.comment.middleware';
import { loggerRepository } from '#/repository/logger/logger.respository';
// eslint-disable-next-line import-x/no-namespace
import * as schema from '#/schema/database/schema.drizzle';

import type { MySql2Database } from 'drizzle-orm/mysql2'; // 타입 변경

import type { initLog } from '#/modules/initialize/init.log';

export async function initDb(
  logger: Awaited<ReturnType<typeof initLog>>,
): Promise<{ writer: MySql2Database<typeof schema>; reader: MySql2Database<typeof schema> }> {
  const host = orThrow(process.env.DB_PET_STORE_MASTER_HOST, new Error('Cannot found host'));
  const port = parseInt(
    orThrow(process.env.DB_PET_STORE_MASTER_PORT, new Error('Cannot found port')),
    10,
  );
  const database = orThrow(process.env.DB_PET_STORE_MASTER_DB, new Error('Cannot found db'));
  const user = orThrow(
    process.env.DB_PET_STORE_MASTER_USERNAME,
    new Error('Cannot found username'),
  );
  const password = orThrow(
    process.env.DB_PET_STORE_MASTER_PASSWORD,
    new Error('Cannot found passwordd'),
  );

  const hostSlave = orThrow(process.env.DB_PET_STORE_MASTER_HOST, new Error('Cannot found host'));
  const portSlave = parseInt(
    orThrow(process.env.DB_PET_STORE_MASTER_PORT, new Error('Cannot found port')),
    10,
  );
  const databaseSlave = orThrow(process.env.DB_PET_STORE_MASTER_DB, new Error('Cannot found db'));
  const userSlave = orThrow(
    process.env.DB_PET_STORE_MASTER_USERNAME,
    new Error('Cannot found username'),
  );
  const passwordSlave = orThrow(
    process.env.DB_PET_STORE_MASTER_PASSWORD,
    new Error('Cannot found passwordd'),
  );

  // 1. mysql2 writer 커넥션 풀 생성
  const writerPoolConnection = mysql.createPool({
    host,
    port,
    database,
    user,
    password,
    // Master-Slave 구조나 Connection Pool 설정을 여기서 추가할 수 있습니다.
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // 1. mysql2 reader(read-only) 커넥션 풀 생성
  const readerPoolConnection = mysql.createPool({
    host: hostSlave,
    port: portSlave,
    database: databaseSlave,
    user: userSlave,
    password: passwordSlave,
    // Master-Slave 구조나 Connection Pool 설정을 여기서 추가할 수 있습니다.
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // 2. Attach request ID comment middleware to pools
  const dbMiddlewareOptions = {
    logger,
    slowQueryThresholdMs: parseInt(process.env.DB_PET_STORE_SLOW_QUERY_THRESHOLD ?? '2000', 10),
  };
  applyRequestIdCommentMiddleware(writerPoolConnection, dbMiddlewareOptions);
  applyRequestIdCommentMiddleware(readerPoolConnection, dbMiddlewareOptions);

  // 3. Drizzle 인스턴스 생성 (mysql2용)
  const writer = drizzle(writerPoolConnection, { schema, mode: 'default' });
  const reader = drizzle(readerPoolConnection, { schema, mode: 'default' });

  logger.info(
    loggerRepository.process({
      type: 'db-connect',
      // 로그 데이터는 환경에 맞게 수정 (예: host 정보 추출 등)
      sqlite3: 'mysql-database',
    }),
    'database connect',
  );

  const db = { writer, reader };

  return db;
}
