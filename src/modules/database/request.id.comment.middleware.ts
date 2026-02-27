import { getRequestId } from '#/modules/context/async.context';

import type { Pool, PoolConnection, QueryOptions } from 'mysql2/promise';
import type { Logger } from 'pino';

export interface IDbMiddlewareOptions {
  /** pino logger instance for slow query logging */
  logger: Logger;
  /** Queries taking longer than this (ms) will be logged as slow queries. Default: 1000ms */
  slowQueryThresholdMs?: number;
}

function prependRequestIdComment(sql: string): string {
  const requestId = getRequestId();
  return requestId != null ? `/* requestId=${requestId} */ ${sql}` : sql;
}

function patchQueryAndExecute(target: Pool | PoolConnection, options: IDbMiddlewareOptions): void {
  const { logger, slowQueryThresholdMs = 2000 } = options;
  const originalQuery = target.query.bind(target);
  const originalExecute = target.execute.bind(target);

  function wrapSql(sql: string | QueryOptions): string | QueryOptions {
    if (typeof sql === 'string') {
      return prependRequestIdComment(sql);
    }

    return { ...sql, sql: prependRequestIdComment(sql.sql) };
  }

  async function withSlowQueryLog(
    annotatedSql: string | QueryOptions,
    run: () => Promise<unknown>,
  ): Promise<unknown> {
    const start = performance.now();
    const result = await run();
    const elapsedMs = performance.now() - start;

    if (elapsedMs >= slowQueryThresholdMs) {
      const rawSql = typeof annotatedSql === 'string' ? annotatedSql : annotatedSql.sql;
      logger.warn({ elapsedMs: Math.round(elapsedMs), sql: rawSql }, 'slow query detected');
    }

    return result;
  }

  // eslint-disable-next-line no-param-reassign
  target.query = async (sql: string | QueryOptions, values?: unknown[]) => {
    const annotated = wrapSql(sql);
    return withSlowQueryLog(annotated, async () =>
      originalQuery(annotated as string, values),
    ) as ReturnType<typeof originalQuery>;
  };

  // eslint-disable-next-line no-param-reassign
  target.execute = async (sql: string | QueryOptions, values?: unknown[]) => {
    const annotated = wrapSql(sql);
    return withSlowQueryLog(annotated, async () =>
      originalExecute(annotated as string, values),
    ) as ReturnType<typeof originalExecute>;
  };
}

/**
 * Patches the pool's query, execute, and getConnection methods to:
 * 1. Prepend a SQL comment with the current request ID from AsyncLocalStorage.
 * 2. Log slow queries (exceeding slowQueryThresholdMs) via pino logger.
 *
 * Example annotated query: /* requestId=abc-123 *\/ SELECT * FROM `pets` WHERE `id` = ?
 *
 * Note: drizzle-orm mysql2 uses pool.query() for normal queries and
 * pool.getConnection() + connection.query() for transactions, so both paths
 * are patched.
 */
export function applyRequestIdCommentMiddleware(pool: Pool, options: IDbMiddlewareOptions): void {
  // Patch pool-level query/execute for non-transaction queries
  patchQueryAndExecute(pool, options);

  // Patch getConnection so each connection used in a transaction is also patched
  const originalGetConnection = pool.getConnection.bind(pool);

  // eslint-disable-next-line no-param-reassign
  pool.getConnection = async () => {
    const connection = await originalGetConnection();
    patchQueryAndExecute(connection, options);
    return connection;
  };
}
