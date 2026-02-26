import fs from 'node:fs/promises';

import dayjs from 'dayjs';
import pathe from 'pathe';
import pino from 'pino';

import { createConsoleTransport } from '#/modules/logging/create.console.transport';

import type { Writable } from 'node:stream';

import type { z } from 'zod';

import type { ConfigurationSchema } from '#/schema/configuration/configuration.zod';

export type TLogTransport = pino.StreamEntry;

export async function initLog(
  config: z.infer<typeof ConfigurationSchema>,
  transports: TLogTransport[] = [],
): Promise<pino.Logger> {
  const logDir = pathe.join(process.cwd(), config.server.log.dir);

  // Create logs directory if it doesn't exist
  await fs.mkdir(logDir, { recursive: true }).catch((err) => {
    // Ignore error if directory already exists

    // eslint-disable-next-line no-console
    console.error(err.message);
    // eslint-disable-next-line no-console
    console.error(err.stack);
  });

  const logFilePath = pathe.join(logDir, 'nodejs.log');

  const streams: pino.StreamEntry[] = [
    // Write to log file
    { stream: pino.destination({ dest: logFilePath, sync: false }) },
    // Console transport for development only
    ...(config.server.runMode === 'local' ? [createConsoleTransport()] : []),
    // Additional transports (e.g. Prometheus, stdout)
    ...transports,
  ];

  const logger = pino(
    {
      level: config.server.log.level,
      timestamp: () => {
        const localTime = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        return `,"time":"${localTime}"`;
      },
    },
    pino.multistream(streams),
  );

  return logger;
}

/**
 * Creates a writable stream transport entry for pino multistream.
 * Use this to add custom transports such as Prometheus metrics collectors.
 */
export function createTransport(stream: Writable, level: pino.Level = 'info'): TLogTransport {
  return { stream, level };
}
