import { parse, v7 as uuidV7 } from 'uuid';

/**
 * Generates a UUID v7 and returns it as a 16-byte Buffer cast to string,
 * suitable for insertion into binary(16) columns via drizzle-orm + mysql2.
 * drizzle-orm types binary columns as string, but mysql2 correctly handles Buffer values.
 */
export function uuidV7Binary(): string {
  return Buffer.from(parse(uuidV7())) as unknown as string;
}
