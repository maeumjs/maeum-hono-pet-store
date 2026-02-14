import fs from 'node:fs/promises';

import dayjs from 'dayjs';
import pathe from 'pathe';
import pino from 'pino';

import type { z } from 'zod';

import type { ConfigurationSchema } from '#/schema/configuration/configuration.zod';

export async function initLog(config: z.infer<typeof ConfigurationSchema>): Promise<pino.Logger> {
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

  const logger = pino(
    {
      level: 'info',
      timestamp: () => {
        const localTime = dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
        return `,"time":"${localTime}"`;
      },
    },
    pino.destination({
      dest: logFilePath,
      sync: false,
    }),
  );

  return logger;
}
