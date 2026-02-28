import { Writable } from 'node:stream';

import chalk from 'chalk';

import type pino from 'pino';

const LEVEL_LABELS: Record<number, string> = {
  10: 'trace',
  20: 'debug',
  30: 'info',
  40: 'warn',
  50: 'error',
  60: 'fatal',
};

function getColor(level: string) {
  if (level === 'INFO') {
    return chalk.yellowBright(level);
  }

  if (level === 'WARN') {
    return chalk.yellowBright(level);
  }

  if (level === 'ERROR') {
    return chalk.redBright(level);
  }

  if (level === 'FATAL') {
    return chalk.redBright(level);
  }

  if (level === 'DEBUG') {
    return chalk.gray(level);
  }

  if (level === 'TRACE') {
    return chalk.gray(level);
  }

  return level;
}

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
        console.log(`[${time}] ${getColor(level.toUpperCase())} ${msg}`);
      } catch {
        // ignore malformed log lines
      }

      callback();
    },
  });

  return { stream, level: 'debug' };
}
