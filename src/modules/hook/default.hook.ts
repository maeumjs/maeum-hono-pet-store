import type { Hook } from "@hono/zod-openapi";
import type { Env } from "hono";

// biome-ignore lint/suspicious/noExplicitAny: temporary any type use
export const defaultHook: Hook<unknown, Env, any, unknown> = (result, c) => {
  if (!result.success) {
    return c.json({ code: "bad request", message: result.error.message }, 400);
  }

  return undefined;
};
