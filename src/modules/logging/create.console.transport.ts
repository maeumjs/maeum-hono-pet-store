import { Writable } from 'node:stream';

import type pino from 'pino';

const LEVEL_LABELS: Record<number, string> = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

/**
 * Creates a console transport that prints only timestamp, level, and message.
 * Intended for development use only.
 */
export function createConsoleTransport(): pino.StreamEntry {
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      try {
        const log = JSON.parse(chunk.toString()) as Record<string, unknown>;
        const time = typeof log.time === 'string' ? log.time : '';
        const level = LEVEL_LABELS[log.level as number] ?? String(log.level);
        const msg = typeof log.msg === 'string' ? log.msg : '';

        // eslint-disable-next-line no-console
        console.log(`[${time}] ${level.toUpperCase()} ${msg}`);
      } catch {
        // ignore malformed log lines
      }

      callback();
    },
  });

  return { stream, level: 'debug' };
}
