import { defineConfig } from "drizzle-kit";
import { orThrow } from "my-easy-fp";
import { ConfigurationError } from "#modules/error/configuration.error.js";
import { initDotEnv } from "#modules/initialize/init.dot.env.js";

initDotEnv();

const host = orThrow(
  process.env.DB_PET_STORE_MASTER_HOST,
  new ConfigurationError("Cannot found host"),
);
const port = parseInt(
  orThrow(process.env.DB_PET_STORE_MASTER_PORT, new ConfigurationError("Cannot found port")),
  10,
);
const database = orThrow(
  process.env.DB_PET_STORE_MASTER_DB,
  new ConfigurationError("Cannot found db"),
);
const user = orThrow(
  process.env.DB_PET_STORE_MASTER_USERNAME,
  new ConfigurationError("Cannot found username"),
);
const password = orThrow(
  process.env.DB_PET_STORE_MASTER_PASSWORD,
  new ConfigurationError("Cannot found passwordd"),
);

console.log("Start drizzle-kit");
console.log("hostname", `${host}:${port}`);
console.log("database", database);
console.log("user", user);

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/schema/database/schema.drizzle.ts"],
  dialect: "mysql",
  dbCredentials: { host, port, database, user, password },
});
