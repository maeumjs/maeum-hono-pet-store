import { serve } from '@hono/node-server';
import { isError } from 'my-easy-fp';

import { routing } from '#/handlers/route';
import { container } from '#/loader';
import { loggerRepository } from '#/repository/logger/logger.respository';

async function app() {
  routing();

  serve(
    {
      fetch: container.app.fetch,
      port: container.config.server.port,
    },
    (info) => {
      container.logger.info(
        loggerRepository.processLog({
          type: 'server-start',
          address: info.address,
          port: container.config.server.port,
          run_mode: container.config.server.runMode,
          log_level: container.config.server.log.level,
        }),
        `server start: ${info.address}:${container.config.server.port}`,
      );
    },
  );
}

app().catch((caught) => {
  const err = isError(caught, new Error('unknown error raised'));
  console.error(err.message);
  console.error(err.stack);
});
