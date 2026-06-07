import * as esbuild from "esbuild";
import { globSync } from "glob";
import readPkg from "read-pkg";

const pkg = readPkg.sync();

if (process.env.FORMAT !== "cjs" && process.env.FORMAT !== "esm") {
  console.log(`support "cjs" or "esm"`);
  console.log(`eg. FORMAT=cjs node esbuild.mjs`);

  process.exit(1);
}

console.log("esbuild start bundling");
console.log(`version: ${pkg.version}`);
console.log(`FORMAT: ${process.env.FORMAT}`);
console.log(`MINIFY: ${process.env.MINIFY}`);

// Get all TypeScript files while maintaining directory structure
const entryPoints = globSync("src/**/*.ts", { ignore: ["src/**/*.test.ts", "src/**/*.spec.ts"] });

await esbuild.build({
  entryPoints,
  target: "es2022",
  bundle: false, // Don't bundle - keep separate files
  sourcemap: true,
  platform: "node",
  minify: process.env.MINIFY === "true",
  outdir: "dist/src",
  format: process.env.FORMAT,
  preserveSymlinks: false,
});
