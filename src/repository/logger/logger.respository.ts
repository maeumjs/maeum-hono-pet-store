import { LogSchema } from '#/schema/logger/logger.zod';

import type { z } from 'zod';

type TLogInput = z.infer<typeof LogSchema>;

/**
 * Validates log object based on its type field
 * @param log - Log object to validate
 * @returns Validated log object
 * @throws ZodError if validation fails
 */
export function validateLog(log: unknown): TLogInput {
  return LogSchema.parse(log);
}

/**
 * Safely validates log object and returns success/error result
 * @param log - Log object to validate
 * @returns SafeParseReturnType with success boolean and data/error
 */
export function safeValidateLog(log: unknown): ReturnType<typeof LogSchema.safeParse> {
  return LogSchema.safeParse(log);
}

/**
 * Type guard to check if log is valid
 * @param log - Log object to check
 * @returns true if log is valid
 */
export function isValidLog(log: unknown): log is TLogInput {
  return LogSchema.safeParse(log).success;
}

/**
 * Validates log and handles type-specific logic
 * @param log - Log object to process
 * @returns Processed log data
 */
export function processLog(log: unknown): TLogInput {
  const validatedLog = validateLog(log);

  // Type-specific processing based on discriminator
  switch (validatedLog.type) {
    case 'server-start':
      // Handle server-start specific logic
      return validatedLog;

    case 'db-connect':
      return validatedLog;

    default:
      // Exhaustive check - TypeScript will error if new types are added without handling
      throw new Error(`Unknown log type: ${validatedLog}`);
  }
}

export const loggerRepository = { processLog };
