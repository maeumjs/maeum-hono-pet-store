import z from 'zod';

export const RestErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});
