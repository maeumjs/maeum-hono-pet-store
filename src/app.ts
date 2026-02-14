import { serve } from '@hono/node-server';
import { isError } from 'my-easy-fp';

import { routing } from '#/handlers/route';
import { container } from '#/loader';

async function app() {
  routing();

  serve(
    {
      fetch: container.app.fetch,
      port: container.config.server.port,
    },
    (info) => {
      console.log('Server start: ', info.address, container.config.server.port);
    },
  );
}

app().catch((caught) => {
  const err = isError(caught, new Error('unknown error raised'));
  console.error(err.message);
  console.error(err.stack);
});
